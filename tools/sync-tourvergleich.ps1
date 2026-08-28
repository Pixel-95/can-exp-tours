$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false, $true)
$componentPath = Join-Path $projectRoot 'assets\components\tourvergleich.html'
$component = [System.IO.File]::ReadAllText($componentPath, $utf8).Trim()
$replacement = "<!-- tourvergleich:start -->`r`n$component`r`n<!-- tourvergleich:end -->"

foreach ($relativePath in @('index.html', 'touren\index.html')) {
  $pagePath = Join-Path $projectRoot $relativePath
  $page = [System.IO.File]::ReadAllText($pagePath, $utf8)
  $pattern = '(?s)<!-- tourvergleich:start -->.*?<!-- tourvergleich:end -->'
  $marker = [regex]::Match($page, $pattern)

  if (-not $marker.Success) {
    throw "Tour comparison markers are missing in $relativePath."
  }

  $updatedPage = [regex]::Replace($page, $pattern, $replacement, 1)
  if ($updatedPage -ne $page) {
    [System.IO.File]::WriteAllText($pagePath, $updatedPage, $utf8)
  }
}
