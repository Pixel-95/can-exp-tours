[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$ragRoot = Split-Path -Parent $PSScriptRoot
$knowledgeRoot = Join-Path $ragRoot 'knowledge'
$files = Get-ChildItem -LiteralPath $knowledgeRoot -Filter '*.md' -File | Sort-Object Name

if ($files.Count -eq 0) {
    throw 'Keine Wissensdokumente gefunden.'
}

$requiredFields = @('document_id:', 'title:', 'category:', 'language:', 'source_url:', 'source_path:', 'content_updated:')
$documentIds = @{}
$errors = [System.Collections.Generic.List[string]]::new()

foreach ($file in $files) {
    $content = Get-Content -Raw -LiteralPath $file.FullName

    if (-not $content.StartsWith("---`n") -and -not $content.StartsWith("---`r`n")) {
        $errors.Add("$($file.Name): YAML-Frontmatter fehlt.")
    }

    foreach ($field in $requiredFields) {
        if ($content -notmatch "(?m)^$([regex]::Escape($field))\s*\S+") {
            $errors.Add("$($file.Name): Pflichtfeld $field fehlt oder ist leer.")
        }
    }

    $idMatch = [regex]::Match($content, '(?m)^document_id:\s*(\S+)')
    if ($idMatch.Success) {
        $documentId = $idMatch.Groups[1].Value
        if ($documentIds.ContainsKey($documentId)) {
            $errors.Add("$($file.Name): document_id $documentId ist doppelt.")
        }
        else {
            $documentIds[$documentId] = $file.Name
        }
    }

    $sourcePathMatch = [regex]::Match($content, '(?m)^source_path:\s*(.+?)\s*$')
    if ($sourcePathMatch.Success) {
        $sourcePath = $sourcePathMatch.Groups[1].Value.Trim().Replace('/', [IO.Path]::DirectorySeparatorChar)
        $repositoryRoot = Split-Path -Parent $ragRoot
        if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot $sourcePath))) {
            $errors.Add("$($file.Name): source_path $sourcePath wurde im Repository nicht gefunden.")
        }
    }

    $sourceUrlMatch = [regex]::Match($content, '(?m)^source_url:\s*(\S+)')
    if ($sourceUrlMatch.Success -and $sourceUrlMatch.Groups[1].Value -notmatch '^https://canyon-explore-tours\.com/') {
        $errors.Add("$($file.Name): source_url verweist nicht auf die kanonische Website.")
    }

    $dateMatch = [regex]::Match($content, '(?m)^content_updated:\s*(\S+)')
    if ($dateMatch.Success -and $dateMatch.Groups[1].Value -notmatch '^\d{4}-\d{2}-\d{2}$') {
        $errors.Add("$($file.Name): content_updated muss YYYY-MM-DD verwenden.")
    }

    if ($content -match '(?i)OPENAI_API_KEY|sk-proj-|Bearer\s+[A-Za-z0-9_-]{20,}') {
        $errors.Add("$($file.Name): mögliches Secret gefunden.")
    }

    if ($content -notmatch '(?m)^#\s+\S+') {
        $errors.Add("$($file.Name): H1-Titel fehlt.")
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host "Wissensbasis gültig: $($files.Count) Markdown-Dokumente." -ForegroundColor Green
