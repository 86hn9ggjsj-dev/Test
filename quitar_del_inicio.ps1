# Quita el Trading Floor y Jarvis del inicio de Windows.
# No borra nada: aparta los accesos directos a la carpeta «inicio_quitado», apunta en ella lo que quita del registro y
# solo desactiva las tareas programadas, así que todo se puede deshacer. Antes de tocar nada, enseña lo que ha encontrado
# y pregunta.

$carpeta = Split-Path -Parent $MyInvocation.MyCommand.Path
$apartado = Join-Path $carpeta 'inicio_quitado'
$claves = @('trading.bat', 'iniciar.bat', 'trading_floor', '-m jarvis', $carpeta)

function EsNuestro([string]$texto) {
    if (-not $texto) { return $false }
    $t = $texto.ToLower()
    foreach ($c in $claves) { if ($t.Contains($c.ToLower())) { return $true } }
    return $false
}

Write-Host ''
Write-Host 'Buscando el Trading Floor y Jarvis en el inicio de Windows...'
$encontrado = @()

# 1) Carpetas de inicio (la tuya y la de todos los usuarios)
$shell = New-Object -ComObject WScript.Shell
foreach ($ci in @([Environment]::GetFolderPath('Startup'), [Environment]::GetFolderPath('CommonStartup'))) {
    if (-not $ci -or -not (Test-Path -LiteralPath $ci)) { continue }
    foreach ($f in Get-ChildItem -LiteralPath $ci -File -ErrorAction SilentlyContinue) {
        $destino = $f.FullName
        if ($f.Extension -eq '.lnk') {
            try { $s = $shell.CreateShortcut($f.FullName); $destino = "$($s.TargetPath) $($s.Arguments) $($s.WorkingDirectory)" } catch { }
        } elseif (@('.bat', '.cmd', '.vbs', '.ps1') -contains $f.Extension.ToLower()) {
            $destino = $destino + ' ' + (Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue)
        }
        if (EsNuestro $destino) {
            $encontrado += [pscustomobject]@{ Tipo = 'acceso'; Nombre = $f.Name; Donde = $ci; Que = $f.FullName }
        }
    }
}

# 2) Registro: programas que arrancan al iniciar sesión
foreach ($rk in @('HKCU:\Software\Microsoft\Windows\CurrentVersion\Run', 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run')) {
    $props = Get-ItemProperty -Path $rk -ErrorAction SilentlyContinue
    if (-not $props) { continue }
    foreach ($p in $props.PSObject.Properties) {
        if (@('PSPath', 'PSParentPath', 'PSChildName', 'PSDrive', 'PSProvider') -contains $p.Name) { continue }
        if (EsNuestro ([string]$p.Value)) {
            $encontrado += [pscustomobject]@{ Tipo = 'registro'; Nombre = $p.Name; Donde = $rk; Que = [string]$p.Value }
        }
    }
}

# 3) Tareas programadas (solo las activas)
try {
    foreach ($t in Get-ScheduledTask -ErrorAction Stop) {
        if ([string]$t.State -eq 'Disabled') { continue }
        $acc = ($t.Actions | ForEach-Object { "$($_.Execute) $($_.Arguments) $($_.WorkingDirectory)" }) -join ' '
        if (EsNuestro $acc) {
            $encontrado += [pscustomobject]@{ Tipo = 'tarea'; Nombre = $t.TaskName; Donde = $t.TaskPath; Que = $acc }
        }
    }
} catch { }

if ($encontrado.Count -eq 0) {
    Write-Host ''
    Write-Host 'No he encontrado nada que abra el Trading Floor o Jarvis al encender el PC.'
    Write-Host 'Mira también en el Administrador de tareas (Ctrl + Mayus + Esc), pestaña "Aplicaciones de arranque":'
    Write-Host 'si ves ahí algo del Trading Floor, clic derecho y "Deshabilitar".'
    return
}

Write-Host ''
Write-Host 'He encontrado esto:'
$n = 0
foreach ($e in $encontrado) {
    $n++
    $tipo = @{ acceso = 'Acceso directo en la carpeta de inicio'; registro = 'Arranque en el registro'; tarea = 'Tarea programada' }[$e.Tipo]
    Write-Host ("  {0}. {1}: {2}" -f $n, $tipo, $e.Nombre)
    Write-Host ("     abre: {0}" -f $e.Que)
}
Write-Host ''
$r = Read-Host 'Lo quito del inicio? (S/N)'
if ($r -notmatch '^[sSyY]') { Write-Host 'No he tocado nada.'; return }

New-Item -ItemType Directory -Force -Path $apartado | Out-Null
$nota = Join-Path $apartado 'lo_que_he_quitado.txt'
$fallos = 0
foreach ($e in $encontrado) {
    try {
        if ($e.Tipo -eq 'acceso') {
            Move-Item -LiteralPath $e.Que -Destination (Join-Path $apartado $e.Nombre) -Force -ErrorAction Stop
            Add-Content -LiteralPath $nota -Value ("Acceso directo apartado: {0} (estaba en {1}). Para deshacerlo, devuélvelo a esa carpeta." -f $e.Nombre, $e.Donde)
        } elseif ($e.Tipo -eq 'registro') {
            Remove-ItemProperty -Path $e.Donde -Name $e.Nombre -ErrorAction Stop
            Add-Content -LiteralPath $nota -Value ("Quitado del registro: {0} -> {1} = {2}" -f $e.Donde, $e.Nombre, $e.Que)
        } else {
            Disable-ScheduledTask -TaskName $e.Nombre -TaskPath $e.Donde -ErrorAction Stop | Out-Null
            Add-Content -LiteralPath $nota -Value ("Tarea programada desactivada (no borrada): {0}{1}" -f $e.Donde, $e.Nombre)
        }
        Write-Host ("  Hecho: {0}" -f $e.Nombre)
    } catch {
        $fallos++
        Write-Host ("  No he podido con {0}: {1}" -f $e.Nombre, $_.Exception.Message)
    }
}
Write-Host ''
if ($fallos) {
    Write-Host 'Alguno necesita permisos de administrador: cierra esta ventana, haz clic derecho en quitar_del_inicio.bat y elige'
    Write-Host '"Ejecutar como administrador".'
} else {
    Write-Host 'Listo: ya no se abrirá al encender el PC. Cuando quieras usarlo, abre trading.bat como siempre.'
}
Write-Host ("Lo que he quitado está apuntado en {0}" -f $nota)
