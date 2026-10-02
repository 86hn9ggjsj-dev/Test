/* =====================================================================
   Paseo en primera persona por el Trading Floor (Three.js).
   La escena 3D no se dibuja a mano: se construye con lo que pinta la oficina
   isométrica (capturarOficina, en index.html). Cada mesa, tabique, cartel o
   pantalla nueva de la vista isométrica aparece también aquí, y las pantallas
   se repintan con los mismos datos en vivo. Las personas, el gato, el robot y
   el ascensor se mueven con la misma simulación que la vista de siempre.
   Controles: W A S D (o flechas) para andar, el ratón para mirar, Mayús para
   correr, E para ver la ficha de quien miras o coger el ascensor, Esc para
   soltar el ratón.
   ===================================================================== */
import * as THREE from "/vendor/three.module.min.js";

// Los colores de la oficina 2D están en sRGB: aquí se pasan a lineal para que la luz, las sombras y los reflejos
// se calculen como en la realidad, y al final se ajusta la exposición con una curva de cine (ACES).
const aLineal = c => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);

const PISO = ALTURA_PLANTA, TECHO = ALTO_MURO;      // altura entre plantas (3,1) y del techo de cada planta (2,4)
const OJOS = 1.02, RADIO = .2, ANDAR = 1.9, CORRER = 3.8, SENSIBILIDAD = .0022;
const PX_SUELO = 40, PX_PANTALLA = 2.2, ALCANCE = 4.5;
const NOMBRE_PLANTA = ["Planta baja", "Planta 1"];

let enMarcha = false, opciones = null, construida = false;
let renderer = null, escena = null, camara = null, lienzo3d = null, capa = null, g2 = null, hud = null;
let plantas = [], exterior = null, cielo3d = null, estrellas = null, materiales = null;
let caras = [], monitores = [], atlas = null, personas = null, extras = null;
let colisiones = [[], []];
const jugador = {x: 0, y: 0, p: 0, yaw: 0, pitch: 0, paso: 0, ascensor: 0};
const teclas = new Set();
let luces = null, entorno = null, calidad = {modo: "auto", nivel: 0, n: 0, desde: 0, espera: 2.5};
let objetivo = null, ultimoCielo = "", tiempoAtlas = 0, indiceLejos = 0, tactil = null;

// ------------------------------------------------------------ utilidades --
const cacheRGBA = new Map();
function rgbaDe(css) {
  let r = cacheRGBA.get(css);
  if (r) return r;
  r = [.5, .5, .5, 1];
  if (typeof css === "string" && css[0] === "#") {
    let h = css.slice(1);
    if (h.length === 3) h = [...h].map(c => c + c).join("");
    const n = parseInt(h.slice(0, 6), 16);
    if (!isNaN(n)) r = [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  } else if (typeof css === "string") {
    const m = css.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const v = m[1].split(",").map(Number);
      if (v.length >= 3 && v.slice(0, 3).every(Number.isFinite)) r = [v[0] / 255, v[1] / 255, v[2] / 255, v.length > 3 && Number.isFinite(v[3]) ? v[3] : 1];
    }
  }
  cacheRGBA.set(css, r);
  return r;
}
const colores = new Map();
function color3(css) { let c = colores.get(css); if (!c) { const [r, g, b] = rgbaDe(css); c = new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace); colores.set(css, c); } return c; }
const aclarar = (q, f) => [Math.min(1, q[0] * f), Math.min(1, q[1] * f), Math.min(1, q[2] * f), q[3]];
const luminancia = q => .2126 * q[0] + .7152 * q[1] + .0722 * q[2];
const base = p => p * PISO;   // altura del suelo de cada planta

/** Acumula cajas (6 caras con color por vértice) y las convierte en una sola malla: una llamada de dibujo para miles de muebles.
 *  Con `ao`, las caras laterales se oscurecen junto al suelo (como la sombra suave que hay al pie de cualquier mueble). */
class Malla {
  constructor(alfa = false) { this.alfa = alfa; this.p = []; this.c = []; this.n = []; this.i = []; }
  cara(v, col, normal, sombra) {
    const b = this.p.length / 3, r = aLineal(col[0]), g = aLineal(col[1]), a = aLineal(col[2]);
    v.forEach((q, k) => {
      const f = sombra ? sombra[k] : 1;
      this.p.push(q[0], q[1], q[2]); this.n.push(normal[0], normal[1], normal[2]);
      if (this.alfa) this.c.push(r * f, g * f, a * f, col[3]); else this.c.push(r * f, g * f, a * f);
    });
    this.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  /** Caja en coordenadas 3D (X = x, Y = altura, Z = y de la oficina). */
  caja(X0, Y0, Z0, X1, Y1, Z1, arriba, frente, lado, abajo = lado, ao = false) {
    const s = ao ? [.58, .58, 1, 1] : null;
    this.cara([[X0, Y1, Z1], [X1, Y1, Z1], [X1, Y1, Z0], [X0, Y1, Z0]], arriba, [0, 1, 0]);
    this.cara([[X0, Y0, Z0], [X1, Y0, Z0], [X1, Y0, Z1], [X0, Y0, Z1]], abajo, [0, -1, 0]);
    this.cara([[X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1]], frente, [0, 0, 1], s);
    this.cara([[X1, Y0, Z0], [X0, Y0, Z0], [X0, Y1, Z0], [X1, Y1, Z0]], frente, [0, 0, -1], s);
    this.cara([[X1, Y0, Z1], [X1, Y0, Z0], [X1, Y1, Z0], [X1, Y1, Z1]], lado, [1, 0, 0], s);
    this.cara([[X0, Y0, Z0], [X0, Y0, Z1], [X0, Y1, Z1], [X0, Y1, Z0]], lado, [-1, 0, 0], s);
  }
  /** Caja de la oficina (x, y, z, ancho, fondo, alto) de un solo color. */
  bloque(p, x, y, z, w, d, h, css, ao = false) { const c = rgbaDe(css); this.caja(x, base(p) + z, y, x + w, base(p) + z + h, y + d, c, c, c, c, ao); }
  malla(material, sombras = true) {
    if (!this.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.c, this.alfa ? 4 : 3));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, material);
    m.castShadow = m.receiveShadow = sombras;
    return m;
  }
}

/** Mide qué zona pinta una función de dibujo (para saber el tamaño de cada cartel o pantalla). */
const lienzoMedida = document.createElement("canvas").getContext("2d");
function medir(fn) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  let m = [1, 0, 0, 1, 0, 0];
  const pila = [];
  const pt = (x, y) => {
    const X = m[0] * x + m[2] * y + m[4], Y = m[1] * x + m[3] * y + m[5];
    if (!Number.isFinite(X) || !Number.isFinite(Y)) return;
    if (X < b[0]) b[0] = X; if (Y < b[1]) b[1] = Y; if (X > b[2]) b[2] = X; if (Y > b[3]) b[3] = Y;
  };
  const rect = (x, y, w, h) => { pt(x, y); pt(x + w, y + h); pt(x + w, y); pt(x, y + h); };
  const texto = (t, x, y) => {
    const ancho = lienzoMedida.measureText(String(t)).width, al = lienzoMedida.textAlign, bl = lienzoMedida.textBaseline;
    const tam = parseFloat((lienzoMedida.font.match(/([\d.]+)px/) || [0, 10])[1]);
    const x0 = al === "center" ? x - ancho / 2 : al === "right" || al === "end" ? x - ancho : x;
    const y0 = bl === "middle" ? y - tam / 2 : bl === "top" ? y : y - tam * .8;
    rect(x0, y0, ancho, tam);
  };
  const proxy = new Proxy({}, {
    get(_, k) {
      switch (k) {
        case "fillRect": case "strokeRect": case "rect": case "roundRect": case "clearRect": return rect;
        case "fillText": case "strokeText": return texto;
        case "arc": return (x, y, r) => { pt(x - r, y - r); pt(x + r, y + r); };
        case "ellipse": return (x, y, rx, ry) => { pt(x - rx, y - ry); pt(x + rx, y + ry); };
        case "moveTo": case "lineTo": return (x, y) => pt(x, y);
        case "quadraticCurveTo": return (a, c, x, y) => { pt(a, c); pt(x, y); };
        case "bezierCurveTo": return (a, c, d, e, x, y) => pt(x, y);
        case "drawImage": return (img, x, y, w, h) => rect(x, y, w === undefined ? img.width : w, h === undefined ? img.height : h);
        case "translate": return (x, y) => { m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; };
        case "scale": return (sx, sy) => { m[0] *= sx; m[1] *= sx; m[2] *= sy; m[3] *= sy; };
        case "rotate": return a => { const c = Math.cos(a), s = Math.sin(a); m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, m[2] * c - m[0] * s, m[3] * c - m[1] * s, m[4], m[5]]; };
        case "save": return () => pila.push(m.slice());
        case "restore": return () => { m = pila.pop() || [1, 0, 0, 1, 0, 0]; };
        case "measureText": return t => lienzoMedida.measureText(t);
        case "createLinearGradient": case "createRadialGradient": case "createPattern": return () => ({addColorStop() {}});
        default: return () => {};
      }
    },
    set(_, k, v) { if (k === "font" || k === "textAlign" || k === "textBaseline") lienzoMedida[k] = v; return true; },
  });
  lienzoMedida.font = "10px sans-serif"; lienzoMedida.textAlign = "start"; lienzoMedida.textBaseline = "alphabetic";
  try { pintarEn(proxy, fn); } catch (e) { return null; }
  return b[0] < b[2] && b[1] < b[3] ? b : null;
}

function texturaDe(lienzo) {
  const t = new THREE.CanvasTexture(lienzo);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

// ------------------------------------------------------------ construir --
function crearMotor() {
  lienzo3d = document.createElement("canvas");
  lienzo3d.id = "lienzo3d";
  document.body.prepend(lienzo3d);
  try { renderer = new THREE.WebGLRenderer({canvas: lienzo3d, antialias: true, powerPreference: "high-performance"}); }
  catch (e) { lienzo3d.remove(); renderer = null; throw new Error("este navegador no puede dibujar en 3D (WebGL)"); }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const forzada = new URLSearchParams(location.search).get("graficos");
  if (["alta", "media", "baja"].includes(forzada)) calidad = {...calidad, modo: forzada, nivel: ["alta", "media", "baja"].indexOf(forzada)};
  camara = new THREE.PerspectiveCamera(72, 1, .06, 700);
  camara.rotation.order = "YXZ";
  capa = document.createElement("canvas");
  capa.id = "paseo2d";
  document.body.append(capa);
  g2 = capa.getContext("2d");
  hud = document.createElement("div");
  hud.id = "paseoHud";
  hud.innerHTML = `<div class="mira"></div>
    <div class="donde"><b></b><span></span></div>
    <div class="pista" hidden></div>
    <div class="teclas">W A S D andar · ratón mirar · Mayús correr · E ver ficha o ascensor · Re Pág / Av Pág cambiar de planta · G gráficos · Esc soltar el ratón</div>
    <button type="button" class="salir" title="Volver a la vista de siempre (tecla P)">✕ Salir del paseo</button>
    <button type="button" class="graficos" title="Calidad de los gráficos (tecla G). En automático baja sola si el ordenador va justo."></button>
    <div class="pausa"><div><b>🚶 Paseo por la oficina</b><p>Haz clic para empezar a andar.<br>W A S D para moverte, el ratón para mirar, Mayús para correr y E para ver la ficha de quien tengas delante o coger el ascensor.</p><small>Esc suelta el ratón</small></div></div>
    <div class="fundido"></div>`;
  document.body.append(hud);
  const estilo = document.createElement("style");
  estilo.textContent = `
#lienzo3d{position:fixed;inset:0;width:100vw;height:100vh;display:none;touch-action:none}
#paseo2d{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;display:none;z-index:3}
#paseoHud{display:none}
body.en-paseo #lienzo3d,body.en-paseo #paseo2d{display:block}
body.en-paseo #paseoHud{display:block}
#paseoHud .mira{position:fixed;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;z-index:4;pointer-events:none}
#paseoHud .mira::before,#paseoHud .mira::after{content:"";position:absolute;background:rgba(255,255,255,.85);box-shadow:0 0 3px rgba(0,0,0,.8)}
#paseoHud .mira::before{left:8px;top:2px;width:2px;height:14px}#paseoHud .mira::after{top:8px;left:2px;height:2px;width:14px}
#paseoHud .mira.sobre::before,#paseoHud .mira.sobre::after{background:#d4ff3a}
#paseoHud .donde{position:fixed;left:16px;top:14px;z-index:5;background:rgba(10,13,19,.78);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px 12px;font:600 12px Inter,sans-serif;color:#c9d0db;backdrop-filter:blur(8px);pointer-events:none}
#paseoHud .donde b{display:block;color:#d4ff3a;font-size:14px;letter-spacing:.04em}
#paseoHud .pista{position:fixed;left:50%;top:calc(50% + 26px);transform:translateX(-50%);z-index:5;background:rgba(10,13,19,.85);border:1px solid #d4ff3a;border-radius:999px;padding:6px 14px;font:700 13px Inter,sans-serif;color:#e9edf3;white-space:nowrap;pointer-events:none}
#paseoHud .pista kbd{display:inline-block;border:1px solid #d4ff3a;border-radius:5px;padding:0 6px;margin-right:6px;color:#d4ff3a;font:800 12px JetBrains Mono,monospace}
#paseoHud .teclas{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:5;background:rgba(10,13,19,.7);border-radius:999px;padding:6px 14px;font:600 11px Inter,sans-serif;color:#aeb6c3;white-space:nowrap;pointer-events:none;max-width:calc(100vw - 24px);overflow:hidden;text-overflow:ellipsis}
#paseoHud .graficos{position:fixed;right:170px;top:14px;z-index:9;height:38px;padding:0 12px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(10,13,19,.85);color:#c9d0db;font:700 12px Inter,sans-serif;cursor:pointer}
#paseoHud .salir{position:fixed;right:16px;top:14px;z-index:9;height:38px;padding:0 14px;border-radius:10px;border:1px solid #d4ff3a;background:rgba(10,13,19,.85);color:#d4ff3a;font:800 13px Inter,sans-serif;cursor:pointer}
#paseoHud .pausa{position:fixed;inset:0;z-index:6;display:none;align-items:center;justify-content:center;background:rgba(4,6,10,.45);cursor:pointer}
#paseoHud .pausa.ver{display:flex}
#paseoHud .pausa>div{max-width:420px;margin:16px;background:rgba(10,13,19,.92);border:1px solid rgba(212,255,58,.5);border-radius:16px;padding:18px 20px;color:#c9d0db;font:500 14px/1.5 Inter,sans-serif;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)}
#paseoHud .pausa b{color:#d4ff3a;font-size:18px}#paseoHud .pausa small{color:#7d8696}
#paseoHud .fundido{position:fixed;inset:0;z-index:8;background:#000;opacity:0;pointer-events:none;transition:opacity .25s}
#paseoHud .fundido.negro{opacity:1}
@media (pointer:coarse){#paseoHud .teclas{display:none}}`;
  document.head.append(estilo);
  hud.querySelector(".salir").addEventListener("click", e => { e.stopPropagation(); salir(); });
  hud.querySelector(".graficos").addEventListener("click", e => { e.stopPropagation(); cambiarCalidad(); });
  hud.querySelector(".pausa").addEventListener("click", () => bloquearRaton());
  lienzo3d.addEventListener("click", () => {
    if (document.pointerLockElement === lienzo3d) return interactuar();
    if (!$("#ficha").hidden) { $("#ficha").hidden = true; fichaAbierta = null; }   // un clic fuera de la ficha la cierra y se sigue andando
    bloquearRaton();
  });
  document.addEventListener("pointerlockchange", () => actualizarPausa());
  document.addEventListener("mousemove", e => {
    if (!enMarcha || document.pointerLockElement !== lienzo3d) return;
    jugador.yaw -= e.movementX * SENSIBILIDAD;
    jugador.pitch = clamp(jugador.pitch - e.movementY * SENSIBILIDAD, -1.45, 1.45);
  });
  addEventListener("keydown", teclaAbajo);
  addEventListener("keyup", e => teclas.delete(e.code));
  addEventListener("blur", () => teclas.clear());
  addEventListener("resize", () => { if (enMarcha) redimensionar3d(); });
  controlesTactiles();
}

function construir() {
  if (construida) desmontar();
  escena = new THREE.Scene();
  const c = capturarOficina();
  const estandar = o => new THREE.MeshStandardMaterial({vertexColors: true, metalness: 0, ...o});
  materiales = {
    mate: estandar({roughness: .82, envMapIntensity: .5}),                    // madera, tela, paredes...
    brillo: estandar({roughness: .3, metalness: .05, envMapIntensity: .9}),   // plástico negro de monitores y teclados
    metal: estandar({roughness: .32, metalness: .75, envMapIntensity: 1.1}),  // patas, postes, marcos
    cristal: estandar({roughness: .04, metalness: .1, envMapIntensity: 1.6, transparent: true, depthWrite: false}),
    luces: new THREE.MeshBasicMaterial({vertexColors: true, toneMapped: false}),   // neones y paneles de luz
    exterior: estandar({roughness: .9, envMapIntensity: .3}),
    vidrioExt: estandar({roughness: .03, metalness: .2, envMapIntensity: 2, transparent: true, depthWrite: false}),
    hojas: new THREE.MeshStandardMaterial({roughness: .65, envMapIntensity: .4}),
  };
  plantas = [0, 1].map(() => new THREE.Group());
  plantas.forEach(g => escena.add(g));
  exterior = new THREE.Group();
  escena.add(exterior);
  colisiones = [0, 1].map(() => Array.from({length: W * D}, () => []));
  crearLuces();

  // cajas capturadas: según su color, de madera/tela, de plástico brillante o de metal; aparte, las de cristal
  const mallas = [0, 1].map(() => ({mate: new Malla(), brillo: new Malla(), metal: new Malla(), vidrio: new Malla(true), luz: new Malla()}));
  for (const [x, y, z, w, d, h, top, izq, der, p] of c.cajas) {
    if (!(w > 0 && d > 0 && h > 0)) continue;
    const a = rgbaDe(top), b = rgbaDe(izq), e = rgbaDe(der), Y = base(p);
    if (a[3] < .999 || b[3] < .999 || e[3] < .999) {
      const f = q => [q[0], q[1], q[2], Math.min(1, q[3] * 1.3 + .02)];
      mallas[p].vidrio.caja(x, Y + z, y, x + w, Y + z + h, y + d, f(a), f(b), f(e));
    } else {
      // en 2D los lados ya vienen oscurecidos para fingir la luz; aquí la pone la escena, así que se aclaran
      const lado = aclarar(b, 1.14);
      const clase = luminancia(a) < .11 && luminancia(b) < .11 ? "brillo"
        : Math.max(b[0], b[1], b[2]) - Math.min(b[0], b[1], b[2]) < .1 && luminancia(b) > .3 && luminancia(b) < .8 && Math.min(w, d) < .16 ? "metal" : "mate";
      mallas[p][clase].caja(x, Y + z, y, x + w, Y + z + h, y + d, a, lado, lado, e, z < .02 && h > .05);
    }
    if (z < 1 && z + h > .3 && !(z >= .15 && w < .45 && d < .45)) choque(p, x, y, x + w, y + d);
  }
  // tabiques de cristal: aquí llegan hasta el techo; su neón va arriba, como una tira de luz, para no tapar la vista
  const vidrio = [.63, .8, 1, .075];
  for (const [x, y, w, d, h, neon, p] of c.cristales) {
    mallas[p].metal.bloque(p, x, y, 0, w, d, .12, "#3a404b", true);
    mallas[p].luz.bloque(p, x, y, .12, w, d, .015, neon);
    const nada = [0, 0, 0, 0], largo = w > d;   // solo las dos caras grandes: las juntas entre paneles no se ven
    mallas[p].vidrio.caja(x, base(p) + .135, y, x + w, base(p) + TECHO - .075, y + d, nada, largo ? vidrio : nada, largo ? nada : vidrio, nada);
    const tira = aclarar(rgbaDe(neon), .8);
    mallas[p].luz.caja(x, base(p) + TECHO - .075, y, x + w, base(p) + TECHO - .05, y + d, tira, tira, tira);
    mallas[p].metal.bloque(p, x, y, TECHO - .05, w, d, .05, "#3a404b");
    choque(p, x, y, x + w, y + d);
  }
  // objetos que en 2D se pintan a mano: plantas, árboles, sombrillas, mesas redondas y pufs
  const hojas = [];
  for (const o of c.objetos) {
    const p = o.planta, Y = base(p);
    if (o.tipo === "planta") {
      for (const [dx, dy, dz, r, col] of [[0, .55, 0, .26, "#3aa56a"], [-.13, .46, .08, .2, "#2f8f5b"], [.13, .48, -.06, .2, "#237a4b"], [-.05, .74, -.05, .18, "#46b877"], [.07, .72, .07, .17, "#2f8f5b"], [0, .9, 0, .13, "#3aa56a"],
        [.1, .62, .12, .14, "#237a4b"], [-.12, .66, -.1, .14, "#3aa56a"]])
        hojas.push([o.x + dx * o.s, Y + .32 + (dy - .32) * o.s, o.y + dz * o.s, r * o.s, col]);
      choque(p, o.x - .25, o.y - .25, o.x + .25, o.y + .25);
    } else if (o.tipo === "arbol") {
      mallas[p].mate.bloque(p, o.x - .045, o.y - .045, .45, .09, .09, .95 * o.s, "#6b4a2e");
      for (const [dx, dy, dz, r, col] of [[0, 1.45, 0, .55, "#2f8f5b"], [-.38, 1.3, .12, .42, "#237a4b"], [.38, 1.35, -.12, .42, "#2a8551"], [0, 1.85, 0, .42, "#3aa56a"], [-.2, 1.72, .22, .32, "#46b877"],
        [.25, 1.68, .25, .3, "#2f8f5b"], [.15, 1.2, -.3, .3, "#237a4b"]])
        hojas.push([o.x + dx * o.s, Y + .45 + (dy - .45) * o.s, o.y + dz * o.s, r * o.s, col]);
      choque(p, o.x - .38, o.y - .38, o.x + .38, o.y + .38);
    } else if (o.tipo === "sombrilla") {
      const lona = new THREE.Mesh(new THREE.ConeGeometry(1.05, .38, 16, 1, true), new THREE.MeshStandardMaterial({color: color3(o.c), side: THREE.DoubleSide, roughness: .9}));
      lona.position.set(o.x, Y + 1.92, o.y); lona.castShadow = true;
      plantas[p].add(lona);
    } else if (o.tipo === "disco") {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r, o.r * (o.alto > .1 ? .92 : 1), o.alto, 32), new THREE.MeshStandardMaterial({color: color3(o.color), roughness: o.alto > .1 ? .9 : .35, envMapIntensity: .7}));
      m.position.set(o.x, Y + o.z + o.alto / 2, o.y); m.castShadow = m.receiveShadow = true;
      plantas[p].add(m);
      if (o.z + o.alto > .2) choque(p, o.x - o.r * .8, o.y - o.r * .8, o.x + o.r * .8, o.y + o.r * .8);
    }
  }
  if (hojas.length) {
    const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), materiales.hojas, hojas.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    hojas.forEach(([x, y, z, r, col], i) => {
      q.setFromEuler(e.set(x * 3.1, y * 5.3, z * 2.7));   // cada mata girada a su manera para que no se repitan
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(r, r * .9, r)); im.setMatrixAt(i, m); im.setColorAt(i, color3(col));
    });
    im.computeBoundingSphere(); im.castShadow = im.receiveShadow = true;
    escena.add(im);
  }
  // la piscina de la terraza no se pisa
  choque(1, PISCINA.x0 - .2, PISCINA.y0 - .2, PISCINA.x1 + .2, PISCINA.y1 + .2);
  // objetos animados que en 2D se dibujan cada fotograma: sus bases
  mallas[0].mate.bloque(0, GLOBO.x - .4, GLOBO.y - .4, 0, .8, .8, .25, "#15283a", true);
  mallas[0].mate.bloque(0, MONEDA.x - .45, MONEDA.y - .45, 0, .9, .9, .35, "#2b2210", true);
  mallas[0].metal.bloque(0, BALIZA.x - .08, BALIZA.y - .08, 0, .16, .16, 1.5, "#5a606b");
  mallas[0].brillo.bloque(0, HOLO.x - .45, HOLO.y - .45, 0, .9, .9, .12, "#11262a", true);
  choque(0, GLOBO.x - .4, GLOBO.y - .4, GLOBO.x + .4, GLOBO.y + .4);
  choque(0, MONEDA.x - .45, MONEDA.y - .45, MONEDA.x + .45, MONEDA.y + .45);
  choque(0, HOLO.x - .45, HOLO.y - .45, HOLO.x + .45, HOLO.y + .45);
  choque(0, BALIZA.x - .15, BALIZA.y - .15, BALIZA.x + .15, BALIZA.y + .15);

  techos(mallas);
  fachadas();
  for (const p of [0, 1]) {
    for (const k of ["mate", "brillo", "metal"]) { const m = mallas[p][k].malla(materiales[k]); if (m) plantas[p].add(m); }
    const mv = mallas[p].vidrio.malla(materiales.cristal, false); if (mv) { mv.renderOrder = 2; plantas[p].add(mv); }
    const ml = mallas[p].luz.malla(materiales.luces, false); if (ml) plantas[p].add(ml);
    plantas[p].add(suelo(p, c.suelo[p] || []));
  }
  crearCaras(c.caras);
  crearMonitores(c.pantallas);
  crearPersonas();
  crearExtras();
  crearCielo();
  construida = true;
}

// ---- luz: cielo y suelo (luz rebotada), una luz principal con sombras suaves y un entorno para los reflejos ----
function crearLuces() {
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.2);
  const sol = new THREE.DirectionalLight(0xffffff, 2.4);
  sol.shadow.bias = -.0004; sol.shadow.normalBias = .025;
  Object.assign(sol.shadow.camera, {left: -34, right: 34, top: 22, bottom: -22, near: 1, far: 80});
  sol.shadow.camera.updateProjectionMatrix();
  escena.add(hemi, sol, sol.target);
  luces = {hemi, sol};
  if (!entorno) {   // un estudio con paneles de luz: da reflejos creíbles a mesas, suelos y cristales (se hace una sola vez)
    const pm = new THREE.PMREMGenerator(renderer);
    entorno = pm.fromScene(salaDeEntorno(), .04).texture;
    pm.dispose();
  }
  escena.environment = entorno;
  aplicarCalidad();
}
function salaDeEntorno() {
  const s = new THREE.Scene(), caja = new THREE.BoxGeometry();
  const pieza = (x, y, z, sx, sy, sz, color, lado = THREE.FrontSide) => {
    const m = new THREE.Mesh(caja, new THREE.MeshBasicMaterial({color, side: lado}));
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); s.add(m);
  };
  pieza(0, 6, 0, 32, 12, 32, new THREE.Color(.42, .43, .46), THREE.BackSide);   // paredes y techo
  pieza(0, .05, 0, 31, .1, 31, new THREE.Color(.16, .15, .14));                  // suelo
  for (const x of [-9, 0, 9]) for (const z of [-9, 0, 9]) pieza(x, 11.85, z, 3.4, .1, 1.3, new THREE.Color(9, 9, 8.5));   // paneles del techo
  pieza(-15.9, 5.5, 0, .1, 5, 22, new THREE.Color(3.2, 3.6, 4.2));               // ventanales
  pieza(15.9, 5.5, 0, .1, 5, 22, new THREE.Color(2.2, 2.4, 2.8));
  return s;
}
/** La luz principal sigue a la planta en la que estás (la otra planta no se ve). */
function colocarSol(p) {
  const {sol} = luces;
  sol.target.position.set(W / 2, base(p), D / 2);
  sol.position.set(W / 2 - 9, base(p) + 24, D / 2 + 11);
  sol.target.updateMatrixWorld();
}
/** Día o noche: de noche la oficina sigue con sus luces encendidas, más cálidas, y fuera está oscuro. */
function luzSegunHora() {
  const n = noche, {hemi, sol} = luces;
  hemi.color.copy(color3(n > .5 ? "#c9d2ff" : "#eef3ff")); hemi.groundColor.copy(color3("#8d8983"));
  hemi.intensity = lerp(1.25, .8, n);
  sol.color.copy(color3(n > .5 ? "#ffe2bd" : "#fff6ea")); sol.intensity = lerp(2.5, 1.45, n);
  renderer.toneMappingExposure = lerp(1.05, .92, n);
}
// ---- calidad de los gráficos: alta (sombras finas), media o baja (sin sombras); en automático baja sola si va justo ----
const NIVELES = [{nombre: "alta", sombra: 4096, ratio: 2}, {nombre: "media", sombra: 2048, ratio: 1.25}, {nombre: "baja", sombra: 0, ratio: .85}];
function aplicarCalidad() {
  if (!luces) return;
  const n = NIVELES[calidad.nivel], conSombras = n.sombra > 0;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, n.ratio));
  renderer.shadowMap.enabled = conSombras;
  luces.sol.castShadow = conSombras;
  if (conSombras && luces.sol.shadow.mapSize.x !== n.sombra) {
    luces.sol.shadow.mapSize.set(n.sombra, n.sombra);
    if (luces.sol.shadow.map) { luces.sol.shadow.map.dispose(); luces.sol.shadow.map = null; }
  }
  escena.traverse(o => { for (const m of [].concat(o.material || [])) m.needsUpdate = true; });
  if (enMarcha) redimensionar3d();
  const b = hud && hud.querySelector(".graficos");
  if (b) b.textContent = `Gráficos: ${calidad.modo === "auto" ? `auto (${n.nombre})` : n.nombre}`;
}
function cambiarCalidad() {
  const orden = ["auto", "alta", "media", "baja"], sig = orden[(orden.indexOf(calidad.modo) + 1) % orden.length];
  calidad = {...calidad, modo: sig, nivel: sig === "auto" ? 0 : ["alta", "media", "baja"].indexOf(sig), n: 0, desde: 0, espera: 2.5};
  aplicarCalidad();
}
function vigilarCalidad() {   // en automático: si va a menos de 28 imágenes por segundo (en tiempo real), baja un nivel
  if (calidad.modo !== "auto" || calidad.nivel >= NIVELES.length - 1) return;
  const ahora = performance.now();
  if (!calidad.desde) { calidad.desde = ahora + calidad.espera * 1000; calidad.n = 0; return; }   // deja unos segundos para arrancar
  if (ahora < calidad.desde) return;
  calidad.n++;
  const seg = (ahora - calidad.desde) / 1000;
  if (seg < 3) return;
  if (calidad.n / seg < 28) { calidad.nivel++; aplicarCalidad(); }
  calidad.desde = 0;
}

function desmontar() {
  escena.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    for (const m of [].concat(o.material || [])) { if (m.map) m.map.dispose(); m.dispose(); }
  });
  caras = []; monitores = []; atlas = null; personas = null; extras = null; capsulas = esferas = null; luces = null;
}

/** Guarda un obstáculo (rectángulo en planta) para no atravesar muebles ni paredes. */
function choque(p, x0, y0, x1, y1) {
  const r = colisiones[p], caja = [x0, y0, x1, y1];
  for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W - 1, Math.floor(x1)); x++)
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(D - 1, Math.floor(y1)); y++) r[x * D + y].push(caja);
}

/** Techo de placas claras con paneles de luz en cada planta (la terraza de la planta 1 queda al aire libre). */
function techos(mallas) {
  const zonas = [[[0, 0, W, 11], [0, 11, X_ALA, D]], [[0, 0, W, 11], [0, 11, 18, D]]];
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;   // una placa de techo de 60 × 60 cm
  const g = cv.getContext("2d");
  g.fillStyle = "#e6e8eb"; g.fillRect(0, 0, 128, 128);
  for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .05})`; g.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5); }
  g.fillStyle = "#b9bec6"; g.fillRect(0, 0, 128, 3); g.fillRect(0, 0, 3, 128);
  const tex = texturaDe(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // el techo de una oficina está iluminado por todas partes (luz rebotada): se le da algo de luz propia
  const mat = new THREE.MeshStandardMaterial({map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .55, roughness: .95, envMapIntensity: .2});
  const panel = rgbaDe("#ffffff"), marco = rgbaDe("#c9ced5");
  for (const p of [0, 1]) {
    const pos = [], uv = [], idx = [], Y = base(p) + TECHO - .001;
    for (const [x0, y0, x1, y1] of zonas[p]) {
      const k = pos.length / 3, e = 2.5;   // 2,5 placas por baldosa
      pos.push(x0, Y, y0, x1, Y, y0, x1, Y, y1, x0, Y, y1);
      uv.push(x0 * e, y0 * e, x1 * e, y0 * e, x1 * e, y1 * e, x0 * e, y1 * e);
      idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
      for (let x = x0 + 1.5; x < x1 - .5; x += 3) for (let y = y0 + 1.2; y < y1 - .4; y += 2.6) {
        mallas[p].mate.caja(x - .6, base(p) + TECHO - .03, y - .22, x + .6, base(p) + TECHO - .001, y + .22, marco, marco, marco);
        mallas[p].luz.caja(x - .55, base(p) + TECHO - .034, y - .17, x + .55, base(p) + TECHO - .03, y + .17, panel, panel, panel);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    plantas[p].add(new THREE.Mesh(geo, mat));
  }
}

/** Fachadas de cristal hacia la calle, forjados y tejado: la piel del edificio, que se ve desde las dos plantas. */
function fachadas() {
  const m = new Malla(), v = new Malla(true);
  const piel = rgbaDe("#2a2f38"), marco = rgbaDe("#4a515d"), zocalo = rgbaDe("#22262e"), vidrio = [.55, .72, .9, .13];
  // forjados (entre el techo de una planta y el suelo de la siguiente) y tejado
  for (const [x0, y0, x1, y1] of [[0, 0, W, 11], [0, 11, X_ALA, D]]) {
    m.caja(x0, TECHO, y0, x1, PISO - .01, y1, piel, piel, piel);
    m.caja(x0, -.35, y0, x1, -.01, y1, piel, piel, piel);
  }
  for (const [x0, y0, x1, y1] of [[0, 0, W, 11], [0, 11, 18, D]]) m.caja(x0, PISO + TECHO, y0, x1, PISO + TECHO + .3, y1, piel, piel, piel);
  m.caja(18, PISO + TECHO - .02, 11 - .02, X_ALA, PISO + TECHO + .3, 11 + .02, piel, piel, piel);
  // paredes del fondo por encima del techo (por fuera) y muros que cierran la terraza por arriba
  for (const p of [0, 1]) {
    m.caja(-.25, base(p) + TECHO, -.25, W, base(p) + PISO, 0, piel, piel, piel);
    m.caja(-.25, base(p) + TECHO, 0, 0, base(p) + PISO, D, piel, piel, piel);
  }
  // muros de cristal hacia la calle: [x0, y0, x1, y1] (líneas), por planta
  const lineas = [
    [[0, D, X_ALA, D], [X_ALA, 11, X_ALA, D], [X_ALA, 11, W, 11], [W, 0, W, 11]],
    [[0, D, 18, D], [X_ALA, 11, W, 11], [W, 0, W, 11]],
  ];
  for (const p of [0, 1]) for (const [x0, y0, x1, y1] of lineas[p]) {
    const Y = base(p), horiz = y0 === y1, largo = horiz ? x1 - x0 : y1 - y0;
    const caja = (a0, a1, yb, yt, col, malla = m, grosor = .06) => horiz
      ? malla.caja(x0 + a0, yb, y0 - grosor, x0 + a1, yt, y0 + grosor, col, col, col)
      : malla.caja(x0 - grosor, yb, y0 + a0, x0 + grosor, yt, y0 + a1, col, col, col);
    caja(0, largo, Y, Y + .12, zocalo);
    caja(0, largo, Y + .12, Y + TECHO, vidrio, v, .03);
    caja(0, largo, Y + TECHO, Y + PISO, piel, m, .1);
    for (let k = 0; k <= largo; k += 1) caja(Math.max(0, k - .03), Math.min(largo, k + .03), Y, Y + TECHO, marco);
    for (let k = 0; k < largo; k++) horiz ? choque(p, x0 + k, y0 - .1, x0 + k + 1, y0 + .1) : choque(p, x0 - .1, y0 + k, x0 + .1, y0 + k + 1);
  }
  // paredes del fondo (norte y oeste): obstáculos
  for (const p of [0, 1]) { for (let x = 0; x < W; x++) choque(p, x, -.3, x + 1, .02); for (let y = 0; y < D; y++) choque(p, -.3, y, .02, y + 1); }
  const mm = m.malla(materiales.exterior, false), mv = v.malla(materiales.vidrioExt, false);
  mm.receiveShadow = true;
  exterior.add(mm); mv.renderOrder = 2; exterior.add(mv);
  // calle, aceras y la ciudad alrededor
  const acera = document.createElement("canvas"); acera.width = acera.height = 128;
  const ga = acera.getContext("2d");
  ga.fillStyle = "#596170"; ga.fillRect(0, 0, 128, 128);
  ga.strokeStyle = "rgba(0,0,0,.25)"; ga.lineWidth = 2; ga.strokeRect(1, 1, 126, 126); ga.beginPath(); ga.moveTo(64, 0); ga.lineTo(64, 128); ga.moveTo(0, 64); ga.lineTo(128, 64); ga.stroke();
  const ta = texturaDe(acera); ta.wrapS = ta.wrapT = THREE.RepeatWrapping; ta.repeat.set(300, 300);
  const calle = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({map: ta, roughness: .95, envMapIntensity: .2}));
  calle.rotation.x = -Math.PI / 2; calle.position.set(W / 2, -.37, D / 2);
  exterior.add(calle);
  exterior.add(ciudad());
}

function ciudad() {
  const tex = d => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = d ? "#121726" : "#3c4a5e"; g.fillRect(0, 0, 256, 256);
    let s = 7;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      g.fillStyle = d ? (azar() < .45 ? `rgba(255,${200 + azar() * 40 | 0},120,.9)` : "#1b2133") : (azar() < .5 ? "#8fb4d8" : "#6d8db0");
      g.fillRect(i * 32 + 6, j * 32 + 6, 20, 22);
    }
    const t = texturaDe(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  };
  materiales.ciudad = [tex(0), tex(1)];
  const p = [], u = [], idx = [];
  let s = 11;
  const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cx = W / 2, cz = D / 2;
  for (let i = 0; i < 110; i++) {
    const ang = azar() * Math.PI * 2, dist = 85 + azar() * 190, w = 8 + azar() * 16, d = 8 + azar() * 16, h = 6 + azar() * (dist > 180 ? 80 : 40);
    const x0 = cx + Math.cos(ang) * dist - w / 2, z0 = cz + Math.sin(ang) * dist - d / 2, x1 = x0 + w, z1 = z0 + d, y0 = -.4, y1 = h;
    const cara = (v, a, b) => { const k = p.length / 3; for (const q of v) p.push(...q); u.push(0, 0, a, 0, a, b, 0, b); idx.push(k, k + 1, k + 2, k, k + 2, k + 3); };
    cara([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], w / 4, h / 4);
    cara([[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], w / 4, h / 4);
    cara([[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], d / 4, h / 4);
    cara([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], d / 4, h / 4);
    cara([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], .01, .01);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(u, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  materiales.edificios = new THREE.MeshBasicMaterial({map: materiales.ciudad[0]});
  return new THREE.Mesh(g, materiales.edificios);
}

const RUGOSIDAD = {trading: .95, incubadora: .95, macro: .9, holding: .9, riesgos: .9, scalping: .9, juegos: .95, comunicacion: .9, quant: .9,
  mineria: .65, infra: .55, laboratorio: .25, banco: .18, pasillo: .4, pasillo1: .4, descanso: .55, comite: .45, cafeteria: .5, academia: .5, terraza: .85, terraza1: .8};
/** Suelo de una planta: las mismas baldosas, moquetas, alfombras y rótulos que en la vista isométrica. */
function suelo(p, capas) {
  const cv = document.createElement("canvas");
  cv.width = W * PX_SUELO; cv.height = D * PX_SUELO;
  const g = cv.getContext("2d");
  g.fillStyle = "#101318"; g.fillRect(0, 0, cv.width, cv.height);
  for (const s of (p ? SALAS1 : SALAS)) for (let x = s.x0; x < s.x1; x++) for (let y = s.y0; y < s.y1; y++) {
    g.fillStyle = (x + y) % 2 ? s.a : s.b; g.fillRect(x * PX_SUELO, y * PX_SUELO, PX_SUELO + .5, PX_SUELO + .5);
  }
  for (const f of capas) {
    g.save(); g.setTransform(PX_SUELO / 100, 0, 0, PX_SUELO / 100, f.x * PX_SUELO, f.y * PX_SUELO);
    try { pintarEn(g, f.fn); } catch (e) { /* una capa que falla no rompe el resto */ }
    g.restore();
  }
  const t = texturaDe(cv);
  const rv = document.createElement("canvas"); rv.width = W * 4; rv.height = D * 4;   // rugosidad (canal verde): baja = brilla
  const gr = rv.getContext("2d");
  gr.fillStyle = "rgb(200,200,200)"; gr.fillRect(0, 0, rv.width, rv.height);
  for (const sala of (p ? SALAS1 : SALAS)) {
    const r = RUGOSIDAD[sala.id] ?? .8, v = Math.round(r * 255);
    gr.fillStyle = `rgb(${v},${v},${v})`; gr.fillRect(sala.x0 * 4, sala.y0 * 4, (sala.x1 - sala.x0) * 4, (sala.y1 - sala.y0) * 4);
  }
  const tr = new THREE.CanvasTexture(rv);
  const geo = new THREE.BufferGeometry(), pos = [], uv = [], idx = [], Y = base(p);
  for (const [x0, y0, x1, y1] of [[0, 0, W, 11], [0, 11, X_ALA, D]]) {
    const k = pos.length / 3;
    pos.push(x0, Y, y1, x1, Y, y1, x1, Y, y0, x0, Y, y0);
    uv.push(x0 / W, 1 - y1 / D, x1 / W, 1 - y1 / D, x1 / W, 1 - y0 / D, x0 / W, 1 - y0 / D);
    idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({map: t, roughnessMap: tr, roughness: 1, metalness: 0, envMapIntensity: .7});
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

// ---- carteles y pantallas de pared: cada uno con su lienzo, repintado con los datos en vivo ----
function crearCaras(lista) {
  for (const f of lista) {
    const b = medir(f.fn);
    if (!b) continue;
    const wU = b[2] - b[0], hU = b[3] - b[1];
    if (wU < 1 || hU < 1) continue;
    const s = Math.min(2.5, 2048 / wU, 768 / hU), cw = Math.max(2, Math.ceil(wU * s)), ch = Math.max(2, Math.ceil(hU * s));
    const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    const tex = texturaDe(cv);
    const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true, alphaTest: .02, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wU / 100, hU / 100), mat);
    const Y = base(f.planta), cu = (b[0] + b[2]) / 200, cv2 = (b[1] + b[3]) / 200;
    let cx, cz;
    if (f.tipo === "y") { mesh.position.set(f.x + cu, Y + f.z - cv2, f.y + .006); cx = f.x + cu; cz = f.y; }
    else if (f.tipo === "x") { mesh.position.set(f.x + .006, Y + f.z - cv2, f.y - cu); mesh.rotation.y = Math.PI / 2; cx = f.x; cz = f.y - cu; }
    else { mesh.position.set(f.x + cu, Y + f.z + .004, f.y + cv2); mesh.rotation.x = -Math.PI / 2; cx = f.x + cu; cz = f.y + cv2; }
    plantas[f.planta].add(mesh);
    const cara = {fn: f.fn, g: cv.getContext("2d"), cv, tex, b, s, p: f.planta, cx, cz, ultimo: -1e9, radio: Math.max(wU, hU) / 200};
    pintarCara(cara);
    caras.push(cara);
  }
}
function pintarCara(f) {
  const g = f.g;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, f.cv.width, f.cv.height);
  g.setTransform(f.s, 0, 0, f.s, -f.b[0] * f.s, -f.b[1] * f.s);
  try { pintarEn(g, f.fn); } catch (e) { /* sin datos todavía */ }
  f.tex.needsUpdate = true; f.ultimo = T;
}

// ---- monitores de los puestos: todos en un mismo lienzo (atlas) para no tener cientos de texturas ----
function crearMonitores(lista) {
  const AW = 2048, alto = Math.ceil(28 * PX_PANTALLA) + 2;
  let x = 0, y = 0;
  const huecos = lista.map(m => {
    const w = Math.ceil(m.w * 100 * PX_PANTALLA) + 2;
    if (x + w > AW) { x = 0; y += alto; }
    const h = {x, y, w: w - 2, h: alto - 2};
    x += w;
    return h;
  });
  const AH = y + alto;
  const cv = document.createElement("canvas"); cv.width = AW; cv.height = Math.max(4, AH);
  const tex = texturaDe(cv);
  atlas = {cv, g: cv.getContext("2d"), tex, cambiado: false};
  const mat = new THREE.MeshBasicMaterial({map: tex, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
  const datos = [{p: [], u: [], i: []}, {p: [], u: [], i: []}];
  lista.forEach((m, n) => {
    const h = huecos[n], d = datos[m.planta], k = d.p.length / 3, Y = base(m.planta), Z = m.y + .006;
    d.p.push(m.x, Y + m.z - m.h, Z, m.x + m.w, Y + m.z - m.h, Z, m.x + m.w, Y + m.z, Z, m.x, Y + m.z, Z);
    const u0 = (h.x + .5) / AW, u1 = (h.x + h.w - .5) / AW, v0 = 1 - (h.y + h.h - .5) / atlas.cv.height, v1 = 1 - (h.y + .5) / atlas.cv.height;
    d.u.push(u0, v0, u1, v0, u1, v1, u0, v1);
    d.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
    monitores.push({fn: m.fn, hueco: h, p: m.planta, cx: m.x + m.w / 2, cz: m.y, ultimo: -1e9});
  });
  datos.forEach((d, p) => {
    if (!d.i.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(d.p, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(d.u, 2));
    g.setIndex(d.i);
    g.computeBoundingSphere();
    plantas[p].add(new THREE.Mesh(g, mat));
  });
  for (const m of monitores) pintarMonitor(m);
  tex.needsUpdate = true;
}
function pintarMonitor(m) {
  const g = atlas.g, h = m.hueco;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.beginPath(); g.rect(h.x, h.y, h.w, h.h); g.clip();
  g.setTransform(PX_PANTALLA, 0, 0, PX_PANTALLA, h.x, h.y);
  try { pintarEn(g, m.fn); } catch (e) { /* sin datos todavía */ }
  g.restore();
  m.ultimo = T; atlas.cambiado = true;
}

// ---- personas y gato: cuerpos redondeados (cápsulas y esferas) en dos mallas instanciadas, animados cada fotograma ----
const CAPSULAS_POR_PERSONA = 26, ESFERAS_POR_PERSONA = 16;
let capsulas = null, esferas = null;
function crearPersonas(capacidad = 320) {
  for (const m of [capsulas, esferas]) if (m) { escena.remove(m); m.dispose(); }
  const hacer = (geo, n) => {
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({roughness: .7, metalness: 0, envMapIntensity: .45}), n);
    im.frustumCulled = false; im.castShadow = im.receiveShadow = true;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.setColorAt(0, new THREE.Color()); im.instanceColor.setUsage(THREE.DynamicDrawUsage);
    escena.add(im);
    return im;
  };
  capsulas = hacer(new THREE.CapsuleGeometry(.5, 1, 6, 16), capacidad * CAPSULAS_POR_PERSONA);   // 1 de ancho y 2 de alto
  esferas = hacer(new THREE.SphereGeometry(1, 24, 16), capacidad * ESFERAS_POR_PERSONA);
  personas = {capacidad};
}
const _m = new THREE.Matrix4(), _b = new THREE.Matrix4(), _t = new THREE.Matrix4(), _r = new THREE.Matrix4(), _s = new THREE.Matrix4();
let nC = 0, nE = 0;
/** Pieza = base · T(pivote) · Rx(giro) · Rz(abre) · T(desplazamiento) · S(tamaño). Giro negativo = hacia delante. */
function poner(malla, i, px, py, pz, rx, rz, sx, sy, sz, ox, oy, oz, css) {
  _m.copy(_b).multiply(_t.makeTranslation(px, py, pz));
  if (rx) _m.multiply(_r.makeRotationX(rx));
  if (rz) _m.multiply(_r.makeRotationZ(rz));
  _m.multiply(_t.makeTranslation(ox, oy, oz)).multiply(_s.makeScale(sx, sy, sz));
  malla.setMatrixAt(i, _m); malla.setColorAt(i, color3(css));
}
/** Cápsula de ancho w, alto total h (con las puntas redondas) y fondo d. */
function capsula(px, py, pz, rx, rz, w, h, d, ox, oy, oz, css) { if (nC < capsulas.instanceMatrix.count) poner(capsulas, nC++, px, py, pz, rx, rz, w, h / 2, d, ox, oy, oz, css); }
/** Esfera (o elipsoide) de radios ax, ay, az. */
function esfera(px, py, pz, ax, ay, az, css) { if (nE < esferas.instanceMatrix.count) poner(esferas, nE++, px, py, pz, 0, 0, ax, ay, az, 0, 0, 0, css); }
/** Punta de un segmento de largo L que sale de (x, y, z) con giro rx y apertura rz. */
const punta = (x, y, z, rx, rz, L) => [x + L * Math.sin(rz), y - L * Math.cos(rz) * Math.cos(rx), z - L * Math.cos(rz) * Math.sin(rx)];
const GIRO = {s: 0, n: Math.PI, e: Math.PI / 2, o: -Math.PI / 2};
const giros = new WeakMap();
function giroSuave(a, objetivo, dt) {
  let g = giros.get(a);
  if (g === undefined) g = objetivo;
  let d = objetivo - g;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  g += d * Math.min(1, dt * 10);
  giros.set(a, g);
  return g;
}
function dibujarPersona(a, dt) {
  const sentado = a.postura === "sentado";
  const gym = !a.andando && a.sitio && a.tarea === "descanso" ? a.sitio.tipo : null;
  const anda = a.andando || gym === "cinta";
  const fase = a.andando ? a.fase * 10 : T * 12 + a.semilla;
  const yaw = giroSuave(a, GIRO[a.mira] ?? 0, dt);
  _b.makeRotationY(yaw).setPosition(a.x, base(a.planta || 0) + (a.z || 0), a.y);
  const pantalon = a.pantalon || "#2b3140", camisa = a.camisa || "#3d7bf7", piel = a.piel || "#e3ae88", pelo = a.pelo || "#3a2a1f", zapato = "#24262c";
  const bote = anda ? Math.abs(Math.cos(fase)) * .018 : 0, respira = Math.sin(T * 2.2 + a.semilla) * .004;
  const cadera = (sentado ? .31 : .5) + bote;
  // piernas: muslo, pierna (con la rodilla que se dobla al andar) y zapato
  for (const s of [-1, 1]) {
    const hx = s * .068;
    if (sentado) {
      capsula(hx, cadera, .02, -Math.PI / 2, 0, .125, .32, .125, 0, -.14, 0, pantalon);
      capsula(hx, cadera, .29, 0, 0, .1, .31, .1, 0, -.13, 0, pantalon);
      capsula(hx, .035, .33, Math.PI / 2, 0, .1, .22, .075, 0, 0, 0, zapato);
    } else {
      const g = anda ? Math.sin(fase) * .45 * s : 0, dobla = anda ? Math.max(0, Math.sin(fase) * s) * .75 : 0;
      capsula(hx, cadera, 0, g, 0, .125, .31, .125, 0, -.13, 0, pantalon);
      const [, ry, rz] = punta(hx, cadera, 0, g, 0, .25);
      capsula(hx, ry, rz, g + dobla, 0, .1, .29, .1, 0, -.12, 0, pantalon);
      const [, ty, tz] = punta(hx, ry, rz, g + dobla, 0, .24);
      capsula(hx, ty - .012, tz + .04, Math.PI / 2, 0, .1, .22, .075, 0, 0, 0, zapato);
    }
  }
  // cuerpo: cadera, pecho, hombros, cuello y cabeza
  capsula(0, cadera + .03, 0, 0, 0, .27, .2, .17, 0, 0, 0, pantalon);
  capsula(0, cadera + .24 + respira, 0, sentado ? -.04 : 0, 0, .31, .42, .19, 0, 0, 0, camisa);
  const hombro = cadera + .385 + respira;
  for (const s of [-1, 1]) esfera(s * .145, hombro, 0, .062, .058, .07, camisa);
  capsula(0, cadera + .47, .005, 0, 0, .075, .1, .075, 0, 0, 0, piel);
  const cy = cadera + .575 + respira, cz = .008;
  esfera(0, cy, cz, .078, .094, .088, piel);
  // brazos: brazo, antebrazo y mano (al teclear, los antebrazos van hacia el teclado)
  const teclea = sentado && !anda;
  for (const s of [-1, 1]) {
    let ua, codo;
    if (anda) { ua = -Math.sin(fase) * .4 * s; codo = -.3; }
    else if (teclea) { ua = -.38 + Math.sin(T * 9 + s + a.semilla) * .03; codo = -1.02; }
    else if (gym === "pesas") { ua = -.15; codo = -1.5 - Math.abs(Math.sin(T * 3)) * .9; }
    else { ua = .04; codo = -.14; }
    const ax = s * .178, rz = s * .09;
    capsula(ax, hombro, 0, ua, rz, .088, .29, .088, 0, -.125, 0, camisa);
    const [ex, ey, ez] = punta(ax, hombro, 0, ua, rz, .25);
    capsula(ex, ey, ez, ua + codo, rz * .4, .076, .27, .076, 0, -.115, 0, camisa);
    const [mx, my, mz] = punta(ex, ey, ez, ua + codo, rz * .4, .24);
    esfera(mx, my, mz, .041, .05, .041, piel);
  }
  // cara: ojos, cejas, nariz y boca
  for (const s of [-1, 1]) {
    esfera(s * .029, cy + .012, cz + .07, .017, .012, .008, "#f1eee9");           // blanco del ojo
    esfera(s * .029, cy + .011, cz + .076, .0075, .0085, .004, "#2e2219");         // iris
    capsula(s * .03, cy + .04, cz + .071, 0, Math.PI / 2, .011, .042, .01, 0, 0, 0, pelo);
  }
  esfera(0, cy - .01, cz + .083, .011, .018, .014, shade(piel, .94));
  capsula(0, cy - .045, cz + .073, 0, Math.PI / 2, .009, .032, .007, 0, 0, 0, shade(piel, .62));
  // pelo según el peinado
  const pe = a.peinado;
  if (pe === "rizado") esfera(0, cy + .03, cz - .026, .098, .09, .1, pelo);
  else if (pe === "rapado") esfera(0, cy + .024, cz - .012, .08, .073, .086, shade(pelo, .9));
  else esfera(0, cy + .03, cz - .012, .083, .078, .088, pelo);
  if (pe === "largo") capsula(0, cy - .045, cz - .05, .12, 0, .175, .3, .085, 0, 0, 0, pelo);
  if (pe === "coleta") capsula(0, cy - .01, cz - .1, .55, 0, .055, .2, .055, 0, -.07, 0, pelo);
  if (pe === "moño") esfera(0, cy + .088, cz - .055, .046, .042, .046, pelo);
  if (pe === "tupé") esfera(0, cy + .082, cz + .03, .055, .032, .05, pelo);
  // accesorios del puesto
  const acc = a.accesorio;
  if (acc === "casco") { esfera(0, cy + .045, cz - .006, .096, .07, .102, "#f2b632"); capsula(0, cy + .012, cz + .07, Math.PI / 2, 0, .17, .07, .012, 0, 0, 0, "#f2b632"); }
  else if (acc === "gafas" || acc === "gafas_pasta") {
    const c = acc === "gafas" ? "#3b4652" : "#141518";
    for (const s of [-1, 1]) esfera(s * .029, cy + .012, cz + .084, .023, .018, .006, c);
    capsula(0, cy + .016, cz + .089, 0, Math.PI / 2, .007, .03, .007, 0, 0, 0, c);
  } else if (acc === "cascos") {
    for (const s of [-1, 1]) esfera(s * .087, cy, cz - .005, .026, .042, .036, "#1d2027");
    capsula(0, cy + .1, cz - .005, 0, Math.PI / 2, .022, .19, .03, 0, 0, 0, "#1d2027");
  } else if (acc === "corbata" || acc === "corbata_oro") capsula(0, cadera + .3, .097, .06, 0, .045, .21, .015, 0, 0, 0, acc === "corbata" ? "#b02a2a" : "#e2b33c");
  else if (acc === "general") esfera(.07, cadera + .36, .096, .02, .02, .008, "#ffcf5a");
}
function dibujarGato(dt) {
  const G = GATO, c = "#e28f3e", o = "#b86a26";
  const yaw = giroSuave(G, GIRO[G.mira] ?? 0, dt);
  _b.makeRotationY(yaw).setPosition(G.x, base(G.planta || 0) + (G.z || 0), G.y);
  const orejas = (y, z) => { for (const s of [-1, 1]) esfera(s * .035, y, z, .02, .032, .012, c); };
  const ojos = (y, z) => { for (const s of [-1, 1]) esfera(s * .024, y, z, .01, .012, .006, "#2a7a2a"); };
  if (G.andando) {
    const paso = Math.sin((G.fase || 0) * 13);
    for (const [dx, dz, f] of [[-.045, .1, 1], [.045, .1, -1], [-.045, -.1, -1], [.045, -.1, 1]]) capsula(dx, .14, dz, paso * f * .45, 0, .045, .15, .045, 0, -.06, 0, o);
    capsula(0, .17, 0, Math.PI / 2, 0, .13, .34, .12, 0, 0, 0, c);
    esfera(0, .24, .2, .066, .06, .066, c); orejas(.3, .2); ojos(.25, .262);
    capsula(0, .2, -.16, -.6 + Math.sin(T * 6) * .15, 0, .032, .26, .032, 0, .12, 0, o);
  } else if (G.estado === "sentado") {
    esfera(0, .14, 0, .1, .14, .1, c);
    esfera(0, .3, .03, .066, .06, .066, c); orejas(.36, .03); ojos(.31, .092);
    capsula(.04, .025, -.06, Math.PI / 2, .7, .032, .24, .032, 0, 0, 0, o);
  } else {   // durmiendo hecho una bola
    const r = 1 + Math.sin(T * 2) * .03;
    esfera(0, .07, 0, .16 * r, .08 * r, .14, c);
    esfera(.08, .08, .1, .056, .05, .056, c); orejas(.13, .1);
    capsula(-.05, .03, .1, Math.PI / 2, -1, .03, .24, .03, 0, 0, 0, o);
  }
}

// ---- cosas animadas: holograma, globo, moneda, baliza, robot, guirnaldas, fogata, pelota y paquetes ----
function crearExtras() {
  const aditivo = c => new THREE.MeshBasicMaterial({color: color3(c), transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false});
  extras = {};
  // holograma de la minería: doble hélice de puntos
  extras.holo = new THREE.InstancedMesh(new THREE.SphereGeometry(.035, 6, 4), aditivo("#3effd0"), 52);
  extras.holo.frustumCulled = false; plantas[0].add(extras.holo);
  // globo de macro
  extras.globo = new THREE.Mesh(new THREE.SphereGeometry(.42, 18, 12), new THREE.MeshBasicMaterial({color: color3("#5cc0ff"), wireframe: true, transparent: true, opacity: .55}));
  extras.globo.position.set(GLOBO.x, 1.15, GLOBO.y); plantas[0].add(extras.globo);
  // moneda gigante del holding
  const cara = document.createElement("canvas"); cara.width = cara.height = 128;
  const gc = cara.getContext("2d"), gr = gc.createRadialGradient(48, 44, 6, 64, 64, 64);
  gr.addColorStop(0, "#ffe3a3"); gr.addColorStop(.6, "#f7931a"); gr.addColorStop(1, "#c46a0c");
  gc.fillStyle = gr; gc.fillRect(0, 0, 128, 128);
  gc.fillStyle = "#fff6e5"; gc.font = "900 84px Inter, sans-serif"; gc.textAlign = "center"; gc.textBaseline = "middle"; gc.fillText("₿", 64, 70);
  const tc = texturaDe(cara);
  extras.moneda = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .07, 40), [new THREE.MeshBasicMaterial({color: color3("#b8741a")}), new THREE.MeshBasicMaterial({map: tc}), new THREE.MeshBasicMaterial({map: tc})]);
  extras.moneda.rotation.order = "YXZ"; plantas[0].add(extras.moneda);
  // baliza de riesgos
  extras.baliza = new THREE.Mesh(new THREE.BoxGeometry(.4, .35, .4), new THREE.MeshBasicMaterial({color: 0xffffff}));
  extras.baliza.position.set(BALIZA.x, 1.675, BALIZA.y); plantas[0].add(extras.baliza);
  // robot del pasillo
  extras.robot = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(.28, .3, .14, 24), new THREE.MeshStandardMaterial({color: color3("#2d323c"), roughness: .35, metalness: .4}));
  cuerpo.position.y = .08;
  const tapa = new THREE.Mesh(new THREE.CylinderGeometry(.25, .27, .05, 24), new THREE.MeshStandardMaterial({color: color3("#3d4450"), roughness: .3, metalness: .5}));
  tapa.position.y = .17;
  extras.led = new THREE.Mesh(new THREE.BoxGeometry(.06, .03, .03), new THREE.MeshBasicMaterial({color: 0x2ee6a6}));
  extras.led.position.set(.2, .17, 0);
  extras.robot.add(cuerpo, tapa, extras.led); plantas[0].add(extras.robot);
  // guirnaldas de bombillas (patio y terraza)
  const bombillas = (lista, p) => {
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.045, 8, 6), new THREE.MeshBasicMaterial({color: 0xffffff}), lista.length);
    const m = new THREE.Matrix4(), tramos = new Map();
    lista.forEach((b, i) => {
      const z = p ? b[2] - Math.abs(Math.sin(b[0] * 5.7 + b[1] * 5.7)) * .12 : 1.9 - Math.abs(Math.sin(b[0] * 5.7 + b[1] * 5.7)) * .15;
      m.makeTranslation(b[0], base(p) + z - .04, b[1]); im.setMatrixAt(i, m);
      const clave = p ? (b[2] > 2 ? "p" + b[1] : b[1] > 23 ? "s" : "e") : "0";
      if (!tramos.has(clave)) tramos.set(clave, []);
      tramos.get(clave).push(new THREE.Vector3(b[0], base(p) + z, b[1]));
    });
    im.setColorAt(0, new THREE.Color());
    plantas[p].add(im);
    for (const pts of tramos.values()) plantas[p].add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color: 0x2a2a2a})));
    return {im, lista};
  };
  extras.bombillas = [bombillas(BOMBILLAS, 0), bombillas(BOMBILLAS1, 1)];
  // fogata
  extras.llamas = new THREE.InstancedMesh(new THREE.ConeGeometry(.07, .24, 6), aditivo("#ff8a3c"), 7);
  extras.llamas.frustumCulled = false; plantas[1].add(extras.llamas);
  // pelota de ping-pong y paquetes del laboratorio
  extras.pelota = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), new THREE.MeshBasicMaterial({color: 0xffffff}));
  plantas[0].add(extras.pelota);
  extras.paquetes = new THREE.InstancedMesh(new THREE.BoxGeometry(.22, .2, .22), new THREE.MeshBasicMaterial({color: 0xffffff}), 64);
  extras.paquetes.frustumCulled = false;
  extras.paquetes.setColorAt(0, new THREE.Color());
  plantas[0].add(extras.paquetes);
}
const _x = new THREE.Matrix4();
function moverExtras() {
  const minando = S && S.mineria && S.mineria.estado === "minando";
  const vel = minando ? 2.4 : .6;
  for (let i = 0; i < 26; i++) for (let k = 0; k < 2; k++) {
    const h = i / 26, ang = T * vel + h * Math.PI * 2 * 1.4 + k * Math.PI;
    _x.makeTranslation(HOLO.x + Math.cos(ang) * .42, .25 + h * 2, HOLO.y + Math.sin(ang) * .42);
    extras.holo.setMatrixAt(i * 2 + k, _x);
  }
  extras.holo.instanceMatrix.needsUpdate = true;
  extras.holo.material.opacity = minando ? .95 : .45;
  extras.globo.rotation.y = T * .35;
  extras.moneda.position.set(MONEDA.x, 1.3 + Math.sin(T * 1.5) * .06, MONEDA.y);
  extras.moneda.rotation.set(Math.PI / 2, T * 1.1, 0);
  const mal = !!(S && S.papel && S.papel.riesgo && S.papel.riesgo.bloqueo);
  extras.baliza.material.color.copy(color3(mal ? (Math.sin(T * 10) > 0 ? "#ff5a76" : "#7a1d2a") : "#2ee6a6"));
  extras.robot.position.set(ROBOT.x, 0, ROBOT.y);
  extras.robot.rotation.y = ROBOT.dir > 0 ? 0 : Math.PI;
  extras.led.material.color.copy(color3(Math.sin(T * 6) > 0 ? "#2ee6a6" : "#11453a"));
  const tonos = ["#ffcf5a", "#ff8a5c", "#d4ff3a", "#5cc0ff"];
  for (const {im, lista} of extras.bombillas) {
    lista.forEach((b, i) => im.setColorAt(i, color3(noche > .3 ? tonos[i % 4] : shade(tonos[i % 4], .7))));
    im.instanceColor.needsUpdate = true;
  }
  for (let k = 0; k < 7; k++) {
    const f = (T * 3 + k * .7) % 1, s = 1 - f * .8;
    _x.makeScale(s, s * 1.2, s).setPosition(FOGATA.x + Math.sin(k * 2.1 + T * 4) * .12, PISO + .3 + f * .45, FOGATA.y + Math.cos(k * 1.7 + T * 3) * .1);
    extras.llamas.setMatrixAt(k, _x);
  }
  extras.llamas.instanceMatrix.needsUpdate = true;
  const bola = pelotaPingPong();
  extras.pelota.visible = !!bola;
  if (bola) extras.pelota.position.set(bola.x, bola.z, bola.y);
  let n = 0;
  for (const p of paquetes) {
    if (n >= 64) break;
    _x.makeTranslation(p.x, p.z + .1, p.y); extras.paquetes.setMatrixAt(n, _x);
    extras.paquetes.setColorAt(n, color3(p.destino === 7 ? "#ffcf5a" : "#d4ff3a")); n++;
  }
  extras.paquetes.count = n;
  extras.paquetes.instanceMatrix.needsUpdate = true;
  if (extras.paquetes.instanceColor) extras.paquetes.instanceColor.needsUpdate = true;
}

// ---- cielo: degradado según la hora, estrellas de noche y la ciudad con ventanas encendidas ----
function crearCielo() {
  const g = new THREE.SphereGeometry(600, 32, 16);
  g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  cielo3d = new THREE.Mesh(g, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false}));
  cielo3d.renderOrder = -1;
  escena.add(cielo3d);
  const pts = [];
  let s = 3;
  const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 500; i++) { const a = azar() * Math.PI * 2, e = .08 + azar() * 1.4; pts.push(Math.cos(a) * Math.cos(e) * 560, Math.sin(e) * 560, Math.sin(a) * Math.cos(e) * 560); }
  const ge = new THREE.BufferGeometry(); ge.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  estrellas = new THREE.Points(ge, new THREE.PointsMaterial({color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, fog: false, depthWrite: false}));
  escena.add(estrellas);
  escena.fog = new THREE.Fog(0x000000, 90, 420);
  ultimoCielo = "";
}
function actualizarCielo() {
  const [c1, c2] = cielo(), clave = c1 + c2 + (noche > .5);
  cielo3d.position.copy(camara.position); estrellas.position.copy(camara.position);
  if (clave === ultimoCielo) return;
  ultimoCielo = clave;
  const zenit = color3(c1), horizonte = color3(c2), pos = cielo3d.geometry.attributes.position, col = cielo3d.geometry.attributes.color, tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const t = clamp(pos.getY(i) / 600 * 2.2, 0, 1); tmp.copy(horizonte).lerp(zenit, t); col.setXYZ(i, tmp.r, tmp.g, tmp.b); }
  col.needsUpdate = true;
  escena.fog.color.copy(horizonte);
  estrellas.material.opacity = noche > .5 ? .9 : 0;
  materiales.edificios.map = materiales.ciudad[noche > .3 ? 1 : 0];
  materiales.edificios.needsUpdate = true;
}

// ------------------------------------------------------------ jugador --
function libreEn(p, x, y) {
  const r = RADIO;
  const dentro = (x >= r && x <= W - r && y >= r && y <= 11 - r) || (x >= r && x <= X_ALA - r && y >= r && y <= D - r);
  if (!dentro) return false;
  const lista = colisiones[p];
  for (let cx = Math.floor(x - r); cx <= Math.floor(x + r); cx++) for (let cy = Math.floor(y - r); cy <= Math.floor(y + r); cy++) {
    if (cx < 0 || cy < 0 || cx >= W || cy >= D) continue;
    for (const [x0, y0, x1, y1] of lista[cx * D + cy]) {
      const dx = x - clamp(x, x0, x1), dy = y - clamp(y, y0, y1);
      if (dx * dx + dy * dy < r * r) return false;
    }
  }
  return true;
}
function moverJugador(dt) {
  let f = 0, l = 0;
  if (teclas.has("KeyW") || teclas.has("ArrowUp")) f += 1;
  if (teclas.has("KeyS") || teclas.has("ArrowDown")) f -= 1;
  if (teclas.has("KeyD") || teclas.has("ArrowRight")) l += 1;
  if (teclas.has("KeyA") || teclas.has("ArrowLeft")) l -= 1;
  if (tactil && tactil.mover) { f -= tactil.mover.dy; l += tactil.mover.dx; }
  const n = Math.hypot(f, l);
  if (n > 1) { f /= n; l /= n; }
  const vel = (teclas.has("ShiftLeft") || teclas.has("ShiftRight") ? CORRER : ANDAR) * dt;
  const sy = Math.sin(jugador.yaw), cy = Math.cos(jugador.yaw);
  const dx = (-sy * f + cy * l) * vel, dy = (-cy * f - sy * l) * vel;
  if (!dx && !dy) { jugador.paso *= .9; return; }
  const p = jugador.p, atrapado = !libreEn(p, jugador.x, jugador.y);
  const pasos = Math.ceil(Math.hypot(dx, dy) / .08);
  for (let i = 0; i < pasos; i++) {
    const nx = jugador.x + dx / pasos, ny = jugador.y + dy / pasos;
    if (atrapado || libreEn(p, nx, ny)) { jugador.x = nx; jugador.y = ny; }
    else if (libreEn(p, nx, jugador.y)) jugador.x = nx;
    else if (libreEn(p, jugador.x, ny)) jugador.y = ny;
  }
  jugador.paso += Math.hypot(dx, dy) * 5.5;
}
function colocarCamara() {
  const bob = Math.sin(jugador.paso) * .018;
  camara.position.set(jugador.x, base(jugador.p) + OJOS + bob, jugador.y);
  camara.rotation.set(jugador.pitch, jugador.yaw, 0);
}
function puntoDeSalida() {
  // se aparece en el pasillo, delante de lo que se veía en la vista isométrica y mirando hacia esa sala
  const ix = cam.x, iy = cam.y + (vista ? ALTURA_PLANTA * ZH : 0);
  const cx = clamp((ix / (TW / 2) + iy / (TH / 2)) / 2, 1.5, W - 1.5), cy = (iy / (TH / 2) - ix / (TW / 2)) / 2;
  const giro = cy < 10 ? 0 : Math.PI;
  for (let r = 0; r < W; r += .25) for (const s of [1, -1]) {
    const x = cx + r * s;
    for (const y of [10, 9.6, 10.4]) if (x > 1 && x < W - 1 && libreEn(vista, x, y)) return [x, y, giro];
  }
  return [ASCENSOR.x + 1, ASCENSOR.y, -Math.PI / 2];
}
function salaEn(p, x, y) {
  const s = (p ? SALAS1 : SALAS).find(s => x >= s.x0 && x < s.x1 && y >= s.y0 && y < s.y1);
  if (!s) return "";
  return s.nombre || "PASILLO";
}
function cercaDelAscensor() { return jugador.x < 1.7 && jugador.y > 9 && jugador.y < 11; }
function irAPlantaPaseo(p) {
  if (p === jugador.p || jugador.ascensor) return;
  const f = hud.querySelector(".fundido");
  f.classList.add("negro");
  ascensorPlanta[jugador.p] = T + 2;
  jugador.ascensor = 1;
  setTimeout(() => {
    jugador.p = p; jugador.x = ASCENSOR.x + .45; jugador.y = ASCENSOR.y; jugador.yaw = -Math.PI / 2; jugador.pitch = 0;
    ascensorPlanta[p] = T + 2.5;
    for (const q of [0, 1]) plantas[q].visible = q === p;
    colocarSol(p);
    f.classList.remove("negro");
    jugador.ascensor = 0;
  }, 320);
}

// ---- a quién miras: la persona más cercana al centro de la pantalla ----
const _o = new THREE.Vector3(), _d = new THREE.Vector3();
function buscarObjetivo() {
  camara.getWorldPosition(_o); camara.getWorldDirection(_d);
  let mejor = null, md = ALCANCE;
  const prueba = (a, alto) => {
    if ((a.planta || 0) !== jugador.p || a.transbordo) return;
    const ax = a.x, az = a.y, y0 = base(a.planta || 0) + (a.z || 0);
    // punto del rayo más cercano al eje vertical de la persona
    const hx = _d.x, hz = _d.z, hh = hx * hx + hz * hz;
    const t = hh > 1e-6 ? ((ax - _o.x) * hx + (az - _o.z) * hz) / hh : 0;
    if (t < .2 || t > md) return;
    const px = _o.x + hx * t - ax, pz = _o.z + hz * t - az, py = _o.y + _d.y * t;
    if (px * px + pz * pz < .26 * .26 && py > y0 - .05 && py < y0 + alto) { md = t; mejor = a; }
  };
  for (const a of agentes) prueba(a, a.postura === "sentado" ? .95 : 1.15);
  prueba(GATO, .4);
  return mejor === GATO ? GATO_AGENTE : mejor;
}
function interactuar() {
  if (!enMarcha) return;
  if (objetivo) { mostrarFicha(objetivo); soltarRaton(); return; }
  if (cercaDelAscensor()) irAPlantaPaseo(1 - jugador.p);
}

// ------------------------------------------------------------ entradas --
function bloquearRaton() {
  if (!enMarcha || matchMedia("(pointer:coarse)").matches) { actualizarPausa(); return; }
  try { const r = lienzo3d.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) { /* el navegador no deja */ }
}
function soltarRaton() { if (document.pointerLockElement === lienzo3d) document.exitPointerLock(); }
function actualizarPausa() {
  if (!hud) return;
  const tactilOn = matchMedia("(pointer:coarse)").matches;
  hud.querySelector(".pausa").classList.toggle("ver", enMarcha && !tactilOn && document.pointerLockElement !== lienzo3d && $("#ficha").hidden);
}
function teclaAbajo(e) {
  if (!enMarcha) return;
  if (e.target.closest && e.target.closest("input,textarea")) return;
  teclas.add(e.code);
  if (e.code === "KeyE") interactuar();
  else if (e.code === "PageUp") { irAPlantaPaseo(1); e.preventDefault(); }
  else if (e.code === "PageDown") { irAPlantaPaseo(0); e.preventDefault(); }
  else if (e.code === "KeyP" && !e.ctrlKey && !e.metaKey && !e.altKey) salir();
  else if (e.code === "KeyG" && !e.ctrlKey && !e.metaKey) cambiarCalidad();
  if (/^(Arrow|Space)/.test(e.code)) e.preventDefault();
}
function controlesTactiles() {
  lienzo3d.addEventListener("touchstart", e => {
    if (!enMarcha) return;
    for (const t of e.changedTouches) {
      if (!tactil) tactil = {};
      if (t.clientX < innerWidth / 2 && !tactil.mover) tactil.mover = {id: t.identifier, x0: t.clientX, y0: t.clientY, dx: 0, dy: 0, t0: performance.now()};
      else if (!tactil.mirar) tactil.mirar = {id: t.identifier, x: t.clientX, y: t.clientY, x0: t.clientX, y0: t.clientY, t0: performance.now()};
    }
    e.preventDefault();
  }, {passive: false});
  lienzo3d.addEventListener("touchmove", e => {
    if (!enMarcha || !tactil) return;
    for (const t of e.changedTouches) {
      if (tactil.mover && t.identifier === tactil.mover.id) { tactil.mover.dx = clamp((t.clientX - tactil.mover.x0) / 60, -1, 1); tactil.mover.dy = clamp((t.clientY - tactil.mover.y0) / 60, -1, 1); }
      if (tactil.mirar && t.identifier === tactil.mirar.id) {
        jugador.yaw -= (t.clientX - tactil.mirar.x) * .005; jugador.pitch = clamp(jugador.pitch - (t.clientY - tactil.mirar.y) * .005, -1.45, 1.45);
        tactil.mirar.x = t.clientX; tactil.mirar.y = t.clientY;
      }
    }
    e.preventDefault();
  }, {passive: false});
  const fin = e => {
    if (!tactil) return;
    for (const t of e.changedTouches) {
      for (const k of ["mover", "mirar"]) {
        const c = tactil[k];
        if (c && t.identifier === c.id) {
          if (performance.now() - c.t0 < 250 && Math.hypot(t.clientX - (c.x0), t.clientY - (c.y0)) < 10) interactuar();   // un toque corto: interactuar
          tactil[k] = null;
        }
      }
    }
  };
  lienzo3d.addEventListener("touchend", fin);
  lienzo3d.addEventListener("touchcancel", fin);
}
function redimensionar3d() {
  renderer.setSize(innerWidth, innerHeight, false);
  camara.aspect = innerWidth / Math.max(1, innerHeight); camara.updateProjectionMatrix();
  const r = Math.min(devicePixelRatio || 1, 2);
  capa.width = Math.round(innerWidth * r); capa.height = Math.round(innerHeight * r);
  g2.setTransform(r, 0, 0, r, 0, 0);
}

// ------------------------------------------------------------ fotograma --
function repintarPantallas() {
  const fx = -Math.sin(jugador.yaw), fz = -Math.cos(jugador.yaw);
  const delante = (x, z, margen) => (x - jugador.x) * fx + (z - jugador.y) * fz > -margen;
  // carteles y pantallas de pared: las cercanas a menudo, las lejanas de vez en cuando
  const pendientes = [];
  for (const f of caras) {
    if (f.p !== jugador.p) continue;
    const d = Math.hypot(f.cx - jugador.x, f.cz - jugador.y) - f.radio;
    if (!delante(f.cx, f.cz, f.radio + 2)) continue;
    const grande = f.cv.width * f.cv.height > 400000 ? 2 : 1;   // las pantallas grandes pesan más al subirlas a la tarjeta gráfica
    const cada = (d < 8 ? .25 : d < 22 ? 1.2 : 5) * grande, prioridad = (T - f.ultimo) / cada;
    if (prioridad >= 1) pendientes.push([prioridad, f]);
  }
  pendientes.sort((a, b) => b[0] - a[0]);
  for (const [, f] of pendientes.slice(0, 5)) pintarCara(f);
  // monitores de las mesas: los cercanos 4 veces por segundo, el resto poco a poco
  if (T - tiempoAtlas >= .25) {
    tiempoAtlas = T;
    for (const m of monitores) if (m.p === jugador.p && Math.hypot(m.cx - jugador.x, m.cz - jugador.y) < 9 && delante(m.cx, m.cz, 1)) pintarMonitor(m);
    for (let k = 0; k < 12 && monitores.length; k++) { indiceLejos = (indiceLejos + 1) % monitores.length; const m = monitores[indiceLejos]; if (m.p === jugador.p) pintarMonitor(m); }
    if (atlas.cambiado) { atlas.tex.needsUpdate = true; atlas.cambiado = false; }
  }
}
const _v = new THREE.Vector3();
function aPantalla3d(x, y, z) {
  _v.set(x, y, z).project(camara);
  if (_v.z > 1 || _v.z < -1) return null;
  return [(_v.x + 1) / 2 * innerWidth, (1 - _v.y) / 2 * innerHeight];
}
function dibujarCapa() {
  g2.clearRect(0, 0, innerWidth, innerHeight);
  const fx = -Math.sin(jugador.yaw), fz = -Math.cos(jugador.yaw);
  const visibles = [];
  for (const a of agentes) {
    if ((a.planta || 0) !== jugador.p || a.transbordo) continue;
    const dx = a.x - jugador.x, dz = a.y - jugador.y, d = Math.hypot(dx, dz);
    if (d > 16 || dx * fx + dz * fz < .2) continue;
    visibles.push([d, a]);
  }
  visibles.sort((a, b) => b[0] - a[0]);
  for (const [d, a] of visibles) {
    const alto = a.postura === "sentado" ? 1.02 : 1.24, Y = base(a.planta || 0) + (a.z || 0) + alto;
    const s = aPantalla3d(a.x, Y, a.y);
    if (!s) continue;
    const b = a.burbuja;
    if (b && T < b.t1 && d < 14) burbuja3d(a, b, s[0], s[1] - 6);
    else if (d < 6 || a === objetivo) nombre3d(a, s[0], s[1] - 4, a === objetivo);
  }
}
function burbuja3d(a, b, sx, sy) {
  g2.font = "600 12px Inter, sans-serif";
  const lineas = [];
  let l = "";
  for (const p of String(b.texto).split(" ")) { const prueba = l ? l + " " + p : p; if (g2.measureText(prueba).width > 220 && l) { lineas.push(l); l = p; } else l = prueba; }
  if (l) lineas.push(l);
  const ls = lineas.slice(0, 5);
  const ancho = Math.max(...ls.map(x => g2.measureText(x).width), g2.measureText(a.nombre).width + 10) + 20, alto = 22 + ls.length * 15;
  const x = clamp(sx - ancho / 2, 8, innerWidth - ancho - 8), y = clamp(sy - alto - 10, 8, innerHeight - alto - 8);
  const al = Math.min(clamp((T - b.t0) * 5, 0, 1), clamp((b.t1 - T) * 2, 0, 1));
  g2.globalAlpha = al;
  g2.fillStyle = "rgba(0,0,0,.35)"; g2.beginPath(); g2.roundRect(x + 2, y + 3, ancho, alto, 11); g2.fill();
  g2.fillStyle = "#fbfcfd"; g2.beginPath(); g2.roundRect(x, y, ancho, alto, 11); g2.fill();
  g2.beginPath(); g2.moveTo(clamp(sx - 7, x + 10, x + ancho - 20), y + alto - 1); g2.lineTo(clamp(sx, x + 14, x + ancho - 14), y + alto + 8); g2.lineTo(clamp(sx + 7, x + 20, x + ancho - 10), y + alto - 1); g2.fill();
  g2.fillStyle = shade(a.tono || "#5cc0ff", .75); g2.font = "800 11px Inter, sans-serif"; g2.fillText(a.nombre, x + 10, y + 15);
  g2.fillStyle = "#16202c"; g2.font = "600 12px Inter, sans-serif";
  ls.forEach((t, i) => g2.fillText(t, x + 10, y + 31 + i * 15));
  g2.globalAlpha = 1;
}
function nombre3d(a, sx, sy, destacado) {
  const texto = destacado ? a.nombre + (a.puesto ? " · " + a.puesto : "") : a.nombre;
  g2.font = destacado ? "700 12px Inter, sans-serif" : "700 11px Inter, sans-serif";
  const w = g2.measureText(texto).width + 14;
  g2.fillStyle = "rgba(10,13,19,.82)"; g2.beginPath(); g2.roundRect(sx - w / 2, sy - 20, w, 19, 9); g2.fill();
  if (destacado) { g2.strokeStyle = "#d4ff3a"; g2.lineWidth = 1; g2.stroke(); }
  g2.fillStyle = "#e9edf3"; g2.textAlign = "center"; g2.fillText(texto, sx, sy - 6.5); g2.textAlign = "start";
}
function actualizarHud() {
  const sala = salaEn(jugador.p, jugador.x, jugador.y);
  const donde = hud.querySelector(".donde");
  donde.querySelector("b").textContent = sala || "TRADING FLOOR";
  donde.querySelector("span").textContent = NOMBRE_PLANTA[jugador.p] + (jugador.p === 1 && sala === "TERRAZA" ? " · al aire libre" : "");
  const pista = hud.querySelector(".pista");
  let texto = "";
  if (objetivo) texto = `<kbd>E</kbd>Ver la ficha de ${esc(objetivo.nombre)}`;
  else if (cercaDelAscensor()) texto = `<kbd>E</kbd>Ascensor a la ${jugador.p ? "planta baja" : "planta 1 (terraza)"}`;
  if (pista.innerHTML !== texto) pista.innerHTML = texto;
  pista.hidden = !texto;
  hud.querySelector(".mira").classList.toggle("sobre", !!objetivo);
}

export function fotograma(dt) {
  if (!enMarcha) return;
  if (!$("#ficha").hidden && document.pointerLockElement === lienzo3d) soltarRaton();
  moverJugador(dt);
  colocarCamara();
  if (personas.capacidad < agentes.length + 2) crearPersonas(Math.ceil((agentes.length + 2) * 1.5));
  nC = nE = 0;
  for (const a of agentes) if ((a.planta || 0) === jugador.p && !a.transbordo && Math.hypot(a.x - jugador.x, a.y - jugador.y) < 60) dibujarPersona(a, dt);
  if ((GATO.planta || 0) === jugador.p && !GATO.transbordo) dibujarGato(dt);
  for (const [m, n] of [[capsulas, nC], [esferas, nE]]) { m.count = n; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
  moverExtras();
  repintarPantallas();
  luzSegunHora();
  vigilarCalidad();
  actualizarCielo();
  objetivo = buscarObjetivo();
  renderer.render(escena, camara);
  dibujarCapa();
  actualizarHud();
  actualizarPausa();
}

export function activo() { return enMarcha; }
/** Dónde está quien pasea, y para colocarle en un sitio concreto (lo usan las pruebas automáticas). */
export function posicion() { return {x: jugador.x, y: jugador.y, planta: jugador.p, giro: jugador.yaw, mirando: objetivo && objetivo.nombre}; }
export function estadisticas() { const r = renderer.info.render; return {llamadas: r.calls, triangulos: r.triangles, texturas: renderer.info.memory.textures, geometrias: renderer.info.memory.geometries, caras: caras.length, monitores: monitores.length}; }
export function teletransportar(x, y, p = jugador.p, giro = jugador.yaw, inclinacion = 0) {
  jugador.x = x; jugador.y = y; jugador.p = p; jugador.yaw = giro; jugador.pitch = inclinacion;
  for (const q of [0, 1]) plantas[q].visible = q === p;
  colocarSol(p);
}

export function entrar(o = {}) {
  opciones = o;
  if (!renderer) crearMotor();
  construir();
  jugador.p = vista;
  [jugador.x, jugador.y, jugador.yaw] = puntoDeSalida();
  jugador.pitch = -.05; jugador.ascensor = 0;
  for (const q of [0, 1]) plantas[q].visible = q === jugador.p;
  colocarSol(jugador.p);
  enMarcha = true;
  document.body.classList.add("en-paseo");
  redimensionar3d();
  teclas.clear();
  bloquearRaton();
  actualizarPausa();
}

export function salir() {
  if (!enMarcha) return;
  enMarcha = false;
  soltarRaton();
  teclas.clear();
  document.body.classList.remove("en-paseo");
  hud.querySelector(".pausa").classList.remove("ver");
  if (opciones && opciones.alSalir) opciones.alSalir(jugador.p, jugador.x, jugador.y);
}
