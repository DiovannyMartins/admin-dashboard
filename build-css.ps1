# Script de Build CSS (PowerShell)
# Consolida todos os módulos CSS em um único arquivo para produção
# 
# Uso: .\build-css.ps1

$cssModules = @(
    'css/modules/base/variables.css',
    'css/modules/base/reset.css',
    'css/modules/base/accessibility.css',
    'css/modules/layout/grid.css',
    'css/modules/layout/sidebar.css',
    'css/modules/layout/topbar.css',
    'css/modules/components/buttons.css',
    'css/modules/components/cards.css',
    'css/modules/components/table.css',
    'css/modules/components/chart.css',
    'css/modules/components/modal.css',
    'css/modules/components/notifications.css',
    'css/modules/components/pagination.css',
    'css/modules/components/toast.css',
    'css/modules/components/extras.css',
    'css/modules/pages/dashboard.css',
    'css/modules/themes/dark.css',
    'css/modules/responsive/tablet.css',
    'css/modules/responsive/mobile.css',
    'css/modules/utils/skip-link.css'
)

$outputPath = 'style.css'
$output = @"
/* ==========================================================================
   ADMIN DASHBOARD - STYLESHEET CONSOLIDADO
   Gerado automaticamente por build-css.ps1 - NÃO EDITAR MANUALMENTE
   Para modificar, edite os arquivos em css/modules/
   ========================================================================== */

"@

foreach ($module in $cssModules) {
    $filePath = Join-Path $PSScriptRoot $module
    if (Test-Path $filePath) {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        $output += "`n/* ===== $($module.ToUpper()) ===== */`n`n"
        $output += $content + "`n`n"
        Write-Host "✓ $module" -ForegroundColor Green
    } else {
        Write-Host " Arquivo não encontrado: $module" -ForegroundColor Yellow
    }
}

$outputPath = Join-Path $PSScriptRoot $outputPath
Set-Content -Path $outputPath -Value $output -Encoding UTF8
$size = [math]::Round((Get-Item $outputPath).Length / 1KB, 2)
Write-Host "`n✓ CSS consolidado em $outputPath ($size KB)" -ForegroundColor Green
