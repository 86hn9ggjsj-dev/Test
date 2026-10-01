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

// Los colores se usan tal cual, igual que en el lienzo 2D (sin gestión de color).
THREE.ColorManagement.enabled = false;

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
function color3(css) { let c = colores.get(css); if (!c) { const [r, g, b] = rgbaDe(css); c = new THREE.Color(r, g, b); colores.set(css, c); } return c; }
const base = p => p * PISO;   // altura del suelo de cada planta

/** Acumula cajas (6 caras con color por vértice) y las convierte en una sola malla: una llamada de dibujo para miles de muebles. */
class Malla {
  constructor(alfa = false) { this.alfa = alfa; this.p = []; this.c = []; this.i = []; }
  cara(v, col) {
    const b = this.p.length / 3;
    for (const q of v) { this.p.push(q[0], q[1], q[2]); if (this.alfa) this.c.push(col[0], col[1], col[2], col[3]); else this.c.push(col[0], col[1], col[2]); }
    this.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  /** Caja en coordenadas 3D (X = x, Y = altura, Z = y de la oficina). */
  caja(X0, Y0, Z0, X1, Y1, Z1, arriba, frente, lado, abajo = lado) {
    this.cara([[X0, Y1, Z1], [X1, Y1, Z1], [X1, Y1, Z0], [X0, Y1, Z0]], arriba);
    this.cara([[X0, Y0, Z0], [X1, Y0, Z0], [X1, Y0, Z1], [X0, Y0, Z1]], abajo);
    this.cara([[X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1]], frente);
    this.cara([[X1, Y0, Z0], [X0, Y0, Z0], [X0, Y1, Z0], [X1, Y1, Z0]], frente);
    this.cara([[X1, Y0, Z1], [X1, Y0, Z0], [X1, Y1, Z0], [X1, Y1, Z1]], lado);
    this.cara([[X0, Y0, Z0], [X0, Y0, Z1], [X0, Y1, Z1], [X0, Y1, Z0]], lado);
  }
  /** Caja de la oficina (x, y, z, ancho, fondo, alto) de un solo color. */
  bloque(p, x, y, z, w, d, h, css) { const c = rgbaDe(css); this.caja(x, base(p) + z, y, x + w, base(p) + z + h, y + d, c, c, c); }
  malla(material) {
    if (!this.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.c, this.alfa ? 4 : 3));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    return new THREE.Mesh(g, material);
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
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
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
    <div class="teclas">W A S D andar · ratón mirar · Mayús correr · E ver ficha o ascensor · Re Pág / Av Pág cambiar de planta · Esc soltar el ratón</div>
    <button type="button" class="salir" title="Volver a la vista de siempre (tecla P)">✕ Salir del paseo</button>
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
  materiales = {
    cajas: new THREE.MeshBasicMaterial({vertexColors: true}),
    cristal: new THREE.MeshBasicMaterial({vertexColors: true, transparent: true, depthWrite: false}),
    luces: new THREE.MeshBasicMaterial({vertexColors: true}),
    exterior: new THREE.MeshBasicMaterial({vertexColors: true}),
    vidrioExt: new THREE.MeshBasicMaterial({vertexColors: true, transparent: true, depthWrite: false}),
    suelo: [],
    hojas: new THREE.MeshLambertMaterial({color: 0xffffff}),
  };
  plantas = [0, 1].map(() => new THREE.Group());
  plantas.forEach(g => escena.add(g));
  exterior = new THREE.Group();
  escena.add(exterior);
  colisiones = [0, 1].map(() => Array.from({length: W * D}, () => []));

  // cajas capturadas: opacas y de cristal, una malla de cada por planta
  const opacas = [new Malla(), new Malla()], vidrios = [new Malla(true), new Malla(true)], luces = [new Malla(), new Malla()];
  for (const [x, y, z, w, d, h, top, izq, der, p] of c.cajas) {
    if (!(w > 0 && d > 0 && h > 0)) continue;
    const a = rgbaDe(top), b = rgbaDe(izq), e = rgbaDe(der);
    if (a[3] < .999 || b[3] < .999 || e[3] < .999) {
      const f = q => [q[0], q[1], q[2], Math.min(1, q[3] * 1.3 + .02)];
      vidrios[p].caja(x, base(p) + z, y, x + w, base(p) + z + h, y + d, f(a), f(b), f(e));
    } else opacas[p].caja(x, base(p) + z, y, x + w, base(p) + z + h, y + d, a, b, e);
    if (z < 1 && z + h > .3 && !(z >= .15 && w < .45 && d < .45)) choque(p, x, y, x + w, y + d);
  }
  // tabiques de cristal: aquí llegan hasta el techo; su neón va arriba, como una tira de luz, para no tapar la vista
  const vidrio = [.63, .8, 1, .075];
  for (const [x, y, w, d, h, neon, p] of c.cristales) {
    opacas[p].bloque(p, x, y, 0, w, d, .12, "#1a1e26");
    luces[p].bloque(p, x, y, .12, w, d, .015, neon);
    const nada = [0, 0, 0, 0], largo = w > d;   // solo las dos caras grandes: las juntas entre paneles no se ven
    vidrios[p].caja(x, base(p) + .135, y, x + w, base(p) + TECHO - .1, y + d, nada, largo ? vidrio : nada, largo ? nada : vidrio, nada);
    luces[p].bloque(p, x, y, TECHO - .1, w, d, .06, neon);
    opacas[p].bloque(p, x, y, TECHO - .04, w, d, .04, "#1a1e26");
    choque(p, x, y, x + w, y + d);
  }
  // objetos que en 2D se pintan a mano: plantas, árboles, sombrillas, mesas redondas y pufs
  const hojas = [];
  for (const o of c.objetos) {
    const p = o.planta, Y = base(p);
    if (o.tipo === "planta") {
      for (const [dx, dy, dz, r, col] of [[0, .55, 0, .26, "#3aa56a"], [-.13, .46, .08, .2, "#2f8f5b"], [.13, .48, -.06, .2, "#237a4b"], [-.05, .74, -.05, .18, "#46b877"], [.07, .72, .07, .17, "#2f8f5b"], [0, .9, 0, .13, "#3aa56a"]])
        hojas.push([o.x + dx * o.s, Y + .32 + (dy - .32) * o.s, o.y + dz * o.s, r * o.s, col]);
      choque(p, o.x - .25, o.y - .25, o.x + .25, o.y + .25);
    } else if (o.tipo === "arbol") {
      opacas[p].bloque(p, o.x - .04, o.y - .04, .45, .08, .08, .9 * o.s, "#5a3a22");
      for (const [dx, dy, dz, r, col] of [[0, 1.45, 0, .55, "#2f8f5b"], [-.38, 1.3, .12, .42, "#237a4b"], [.38, 1.35, -.12, .42, "#2a8551"], [0, 1.85, 0, .42, "#3aa56a"], [-.2, 1.72, .22, .32, "#46b877"]])
        hojas.push([o.x + dx * o.s, Y + .45 + (dy - .45) * o.s, o.y + dz * o.s, r * o.s, col]);
      choque(p, o.x - .38, o.y - .38, o.x + .38, o.y + .38);
    } else if (o.tipo === "sombrilla") {
      const lona = new THREE.Mesh(new THREE.ConeGeometry(1.05, .42, 8, 1, true), new THREE.MeshLambertMaterial({color: color3(o.c), side: THREE.DoubleSide}));
      lona.position.set(o.x, Y + 1.92, o.y);
      plantas[p].add(lona);
    } else if (o.tipo === "disco") {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r, o.r, o.alto, 24), new THREE.MeshLambertMaterial({color: color3(o.color)}));
      m.position.set(o.x, Y + o.z + o.alto / 2, o.y);
      plantas[p].add(m);
      if (o.z + o.alto > .2) choque(p, o.x - o.r * .8, o.y - o.r * .8, o.x + o.r * .8, o.y + o.r * .8);
    }
  }
  if (hojas.length) {
    const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), materiales.hojas, hojas.length);
    const m = new THREE.Matrix4();
    hojas.forEach(([x, y, z, r, col], i) => { m.makeScale(r, r * .92, r).setPosition(x, y, z); im.setMatrixAt(i, m); im.setColorAt(i, color3(col)); });
    im.computeBoundingSphere();
    escena.add(im);
  }
  // la piscina de la terraza no se pisa
  choque(1, PISCINA.x0 - .2, PISCINA.y0 - .2, PISCINA.x1 + .2, PISCINA.y1 + .2);
  // objetos animados que en 2D se dibujan cada fotograma: sus bases
  opacas[0].bloque(0, GLOBO.x - .4, GLOBO.y - .4, 0, .8, .8, .25, "#15283a");
  opacas[0].bloque(0, MONEDA.x - .45, MONEDA.y - .45, 0, .9, .9, .35, "#2b2210");
  opacas[0].bloque(0, BALIZA.x - .08, BALIZA.y - .08, 0, .16, .16, 1.5, "#2a2e36");
  opacas[0].bloque(0, HOLO.x - .45, HOLO.y - .45, 0, .9, .9, .12, "#11262a");
  choque(0, GLOBO.x - .4, GLOBO.y - .4, GLOBO.x + .4, GLOBO.y + .4);
  choque(0, MONEDA.x - .45, MONEDA.y - .45, MONEDA.x + .45, MONEDA.y + .45);
  choque(0, HOLO.x - .45, HOLO.y - .45, HOLO.x + .45, HOLO.y + .45);
  choque(0, BALIZA.x - .15, BALIZA.y - .15, BALIZA.x + .15, BALIZA.y + .15);

  techos(opacas, luces);
  fachadas();
  for (const p of [0, 1]) {
    const mo = opacas[p].malla(materiales.cajas); if (mo) plantas[p].add(mo);
    const mv = vidrios[p].malla(materiales.cristal); if (mv) { mv.renderOrder = 2; plantas[p].add(mv); }
    const ml = luces[p].malla(materiales.luces); if (ml) plantas[p].add(ml);
    plantas[p].add(suelo(p, c.suelo[p] || []));
  }
  crearCaras(c.caras);
  crearMonitores(c.pantallas);
  crearPersonas();
  crearExtras();
  crearCielo();
  construida = true;
}

function desmontar() {
  escena.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    for (const m of [].concat(o.material || [])) { if (m.map) m.map.dispose(); m.dispose(); }
  });
  caras = []; monitores = []; atlas = null; personas = null; extras = null;
}

/** Guarda un obstáculo (rectángulo en planta) para no atravesar muebles ni paredes. */
function choque(p, x0, y0, x1, y1) {
  const r = colisiones[p], caja = [x0, y0, x1, y1];
  for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W - 1, Math.floor(x1)); x++)
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(D - 1, Math.floor(y1)); y++) r[x * D + y].push(caja);
}

/** Techo con paneles de luz en cada planta (la terraza de la planta 1 queda al aire libre). */
function techos(opacas, luces) {
  const zonas = [[[0, 0, W, 11], [0, 11, X_ALA, D]], [[0, 0, W, 11], [0, 11, 18, D]]];
  const panel = rgbaDe("#f6f3ea");
  for (const p of [0, 1]) {
    for (const [x0, y0, x1, y1] of zonas[p]) {
      opacas[p].bloque(p, x0, y0, TECHO - .02, x1 - x0, y1 - y0, .02, p ? "#2a2f38" : "#2c313b");
      for (let x = x0 + 1.5; x < x1 - .5; x += 3) for (let y = y0 + 1.2; y < y1 - .4; y += 2.6)
        luces[p].caja(x - .55, base(p) + TECHO - .035, y - .18, x + .55, base(p) + TECHO - .02, y + .18, panel, panel, panel);
    }
  }
}

/** Fachadas de cristal hacia la calle, forjados y tejado: la piel del edificio, que se ve desde las dos plantas. */
function fachadas() {
  const m = new Malla(), v = new Malla(true);
  const piel = rgbaDe("#20252e"), marco = rgbaDe("#3a414d"), zocalo = rgbaDe("#1a1e26"), vidrio = [.55, .72, .9, .13];
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
  const mm = m.malla(materiales.exterior), mv = v.malla(materiales.vidrioExt);
  exterior.add(mm); mv.renderOrder = 2; exterior.add(mv);
  // calle, aceras y la ciudad alrededor
  const acera = document.createElement("canvas"); acera.width = acera.height = 128;
  const ga = acera.getContext("2d");
  ga.fillStyle = "#596170"; ga.fillRect(0, 0, 128, 128);
  ga.strokeStyle = "rgba(0,0,0,.25)"; ga.lineWidth = 2; ga.strokeRect(1, 1, 126, 126); ga.beginPath(); ga.moveTo(64, 0); ga.lineTo(64, 128); ga.moveTo(0, 64); ga.lineTo(128, 64); ga.stroke();
  const ta = texturaDe(acera); ta.wrapS = ta.wrapT = THREE.RepeatWrapping; ta.repeat.set(300, 300);
  const calle = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshBasicMaterial({map: ta}));
  calle.rotation.x = -Math.PI / 2; calle.position.set(W / 2, -.37, D / 2);
  exterior.add(calle);
  materiales.calle = calle.material;
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
  const geo = new THREE.BufferGeometry(), pos = [], uv = [], idx = [], Y = base(p);
  for (const [x0, y0, x1, y1] of [[0, 0, W, 11], [0, 11, X_ALA, D]]) {
    const k = pos.length / 3;
    pos.push(x0, Y, y1, x1, Y, y1, x1, Y, y0, x0, Y, y0);
    uv.push(x0 / W, 1 - y1 / D, x1 / W, 1 - y1 / D, x1 / W, 1 - y0 / D, x0 / W, 1 - y0 / D);
    idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({map: t});
  materiales.suelo.push(mat);
  return new THREE.Mesh(geo, mat);
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
    const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true, alphaTest: .02, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
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
  const mat = new THREE.MeshBasicMaterial({map: tex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
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

// ---- personas y gato: cajas en una sola malla instanciada, animadas cada fotograma ----
const PIEZAS_POR_PERSONA = 19;
function crearPersonas(capacidad = 4096) {
  if (personas) { escena.remove(personas); personas.dispose(); }
  personas = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({color: 0xffffff}), capacidad);
  personas.frustumCulled = false;
  personas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  personas.setColorAt(0, new THREE.Color(1, 1, 1));
  personas.instanceColor.setUsage(THREE.DynamicDrawUsage);
  escena.add(personas);
  if (!escena.userData.luces) {
    escena.userData.luces = {amb: new THREE.AmbientLight(0xffffff, 1), sol: new THREE.DirectionalLight(0xffffff, 1.6)};
    escena.userData.luces.sol.position.set(-6, 10, 8);
    escena.add(escena.userData.luces.amb, escena.userData.luces.sol);
  }
}
const _m = new THREE.Matrix4(), _b = new THREE.Matrix4(), _t = new THREE.Matrix4(), _r = new THREE.Matrix4(), _s = new THREE.Matrix4();
let nPiezas = 0;
/** Pieza = base · T(pivote) · Rx(giro) · T(desplazamiento) · S(tamaño). */
function pieza(px, py, pz, giro, sx, sy, sz, ox, oy, oz, css) {
  if (nPiezas >= personas.count) return;
  _m.copy(_b).multiply(_t.makeTranslation(px, py, pz));
  if (giro) _m.multiply(_r.makeRotationX(giro));
  _m.multiply(_t.makeTranslation(ox, oy, oz)).multiply(_s.makeScale(sx, sy, sz));
  personas.setMatrixAt(nPiezas, _m); personas.setColorAt(nPiezas, color3(css)); nPiezas++;
}
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
  const pantalon = a.pantalon || "#2b3140", camisa = a.camisa || "#3d7bf7", piel = a.piel || "#e3ae88", pelo = a.pelo || "#3a2a1f", zapato = "#1a1c22";
  const bote = anda ? Math.abs(Math.cos(fase)) * .025 : 0, respira = Math.sin(T * 2.2 + a.semilla) * .006;
  const cadera = (sentado ? .32 : .52) + bote;
  for (const s of [-1, 1]) {
    const hx = s * .065;
    if (sentado) {
      pieza(hx, cadera, 0, -Math.PI / 2, .1, .28, .11, 0, -.14, 0, pantalon);
      pieza(hx, cadera, .28, 0, .095, .3, .1, 0, -.15, 0, pantalon);
      pieza(hx, .03, .31, 0, .1, .06, .16, 0, 0, 0, zapato);
    } else {
      const g = anda ? Math.sin(fase) * .5 * s : 0;
      const ry = cadera - .26 * Math.cos(g), rz = -.26 * Math.sin(g);
      pieza(hx, cadera, 0, g, .1, .27, .11, 0, -.135, 0, pantalon);
      pieza(hx, ry, rz, g, .095, .26, .1, 0, -.13, 0, pantalon);
      pieza(hx, ry - .26 * Math.cos(g), rz - .26 * Math.sin(g), g, .1, .06, .16, 0, .02, .03, zapato);
    }
  }
  const tronco = cadera + .18 + respira;
  pieza(0, tronco, 0, 0, .27, .36, .15, 0, 0, 0, camisa);
  const hombro = cadera + .34;
  const teclea = sentado && !anda;
  for (const s of [-1, 1]) {
    const g = anda ? -Math.sin(fase) * .45 * s : teclea ? -1.15 + Math.sin(T * 9 + s + a.semilla) * .05 : (gym === "pesas" ? -1.4 - Math.abs(Math.sin(T * 3)) : 0);
    pieza(s * .17, hombro, 0, g, .07, .34, .08, 0, -.17, 0, camisa);
    pieza(s * .17, hombro, 0, g, .06, .06, .06, 0, -.36, 0, piel);
  }
  const cabeza = cadera + .47 + respira;
  pieza(0, cabeza, 0, 0, .19, .2, .18, 0, 0, 0, piel);
  const pe = a.peinado;
  if (pe === "rapado") pieza(0, cabeza + .095, -.01, 0, .195, .025, .185, 0, 0, 0, pelo);
  else {
    pieza(0, cabeza + .09, -.005, 0, pe === "rizado" ? .23 : .205, pe === "tupé" ? .08 : .06, pe === "rizado" ? .22 : .195, 0, 0, pe === "tupé" ? .01 : 0, pelo);
    pieza(0, cabeza + (pe === "largo" ? -.04 : .03), -.08, 0, .205, pe === "largo" ? .26 : .13, .05, 0, 0, 0, pelo);
    if (pe === "moño") pieza(0, cabeza + .16, -.05, 0, .09, .08, .09, 0, 0, 0, pelo);
    if (pe === "coleta") pieza(0, cabeza - .02, -.12, 0, .06, .17, .06, 0, 0, 0, pelo);
  }
  for (const s of [-1, 1]) pieza(s * .045, cabeza + .005, .092, 0, .03, .035, .012, 0, 0, 0, "#1d1f26");
  const acc = a.accesorio;
  if (acc === "casco") pieza(0, cabeza + .12, 0, 0, .23, .06, .23, 0, 0, 0, "#ffc24a");
  else if (acc === "gafas" || acc === "gafas_pasta") pieza(0, cabeza + .01, .096, 0, .17, .028, .012, 0, 0, 0, acc === "gafas" ? "#9aa4b1" : "#1a1c22");
  else if (acc === "corbata" || acc === "corbata_oro") pieza(0, tronco + .02, .078, 0, .04, .2, .012, 0, 0, 0, acc === "corbata" ? "#c2302f" : "#ffcf5a");
  else if (acc === "cascos") pieza(0, cabeza + .02, 0, 0, .22, .1, .05, 0, 0, 0, "#1a1c22");
  else if (acc === "general") pieza(0, tronco + .1, .078, 0, .06, .06, .012, 0, 0, 0, "#ffcf5a");
}
function dibujarGato(dt) {
  const G = GATO, c = "#e28f3e", o = "#b86a26";
  const yaw = giroSuave(G, GIRO[G.mira] ?? 0, dt);
  _b.makeRotationY(yaw).setPosition(G.x, base(G.planta || 0) + (G.z || 0), G.y);
  if (G.andando || G.estado === "sentado") {
    const anda = G.andando, paso = Math.sin((G.fase || 0) * 13);
    if (anda) {
      for (const [dx, dz, f] of [[-.05, .1, 1], [.05, .1, -1], [-.05, -.1, -1], [.05, -.1, 1]]) pieza(dx, .1, dz, paso * f * .5, .035, .1, .035, 0, -.05, 0, o);
      pieza(0, .15, 0, 0, .12, .1, .3, 0, 0, 0, c);
      pieza(0, .21, .18, 0, .13, .12, .12, 0, 0, 0, c);
      pieza(0, .16, -.14, -.9 + Math.sin(T * 6) * .2, .03, .03, .22, 0, 0, -.11, o);
    } else {
      pieza(0, .12, 0, 0, .14, .22, .14, 0, 0, 0, c);
      pieza(0, .29, .02, 0, .13, .12, .12, 0, 0, 0, c);
      pieza(0, .02, -.1, 0, .03, .03, .2, 0, 0, -.06, o);
    }
    const hy = anda ? .21 : .29, hz = anda ? .18 : .02;
    for (const s of [-1, 1]) { pieza(s * .04, hy + .08, hz, 0, .035, .05, .03, 0, 0, 0, c); pieza(s * .03, hy + .01, hz + .061, 0, .022, .022, .005, 0, 0, 0, "#2a7a2a"); }
  } else {   // durmiendo hecho una bola
    const r = 1 + Math.sin(T * 2) * .03;
    pieza(0, .05, 0, 0, .24 * r, .1 * r, .3, 0, 0, 0, c);
    pieza(0, .08, .14, 0, .12, .1, .11, 0, 0, 0, c);
    for (const s of [-1, 1]) pieza(s * .035, .15, .14, 0, .03, .045, .03, 0, 0, 0, c);
    pieza(.09, .03, -.08, 0, .03, .03, .2, 0, 0, 0, o);
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
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(.28, .3, .14, 24), new THREE.MeshLambertMaterial({color: color3("#2d323c")}));
  cuerpo.position.y = .08;
  const tapa = new THREE.Mesh(new THREE.CylinderGeometry(.25, .27, .05, 24), new THREE.MeshLambertMaterial({color: color3("#3d4450")}));
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
  cielo3d = new THREE.Mesh(g, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false}));
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
function tintes() {
  const n = noche, r = 1 - n * .5, g = 1 - n * .45, b = 1 - n * .25;
  for (const m of [materiales.cajas, materiales.exterior, materiales.hojas, materiales.calle, ...materiales.suelo]) m.color.setRGB(r, g, b);
  materiales.cristal.color.setRGB(1, 1, 1);
  const l = escena.userData.luces;
  l.amb.intensity = 1.05 - n * .45; l.sol.intensity = 1.5 - n * 1.1;
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
  nPiezas = 0;
  const necesarias = (agentes.length + 1) * PIEZAS_POR_PERSONA;
  if (personas.instanceMatrix.count < necesarias) crearPersonas(Math.ceil(necesarias * 1.5));
  personas.count = personas.instanceMatrix.count;
  for (const a of agentes) if ((a.planta || 0) === jugador.p && !a.transbordo && Math.hypot(a.x - jugador.x, a.y - jugador.y) < 60) dibujarPersona(a, dt);
  if ((GATO.planta || 0) === jugador.p && !GATO.transbordo) dibujarGato(dt);
  personas.count = nPiezas;
  personas.instanceMatrix.needsUpdate = true;
  if (personas.instanceColor) personas.instanceColor.needsUpdate = true;
  moverExtras();
  repintarPantallas();
  tintes();
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
}

export function entrar(o = {}) {
  opciones = o;
  if (!renderer) crearMotor();
  construir();
  jugador.p = vista;
  [jugador.x, jugador.y, jugador.yaw] = puntoDeSalida();
  jugador.pitch = -.05; jugador.ascensor = 0;
  for (const q of [0, 1]) plantas[q].visible = q === jugador.p;
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
