[CmdletBinding()]
param(
    [int]$PollingTimeoutSeconds = 600,
    [int]$UpdateDelaySeconds = 7,
    [string]$ImportFilePattern = ''
)

$ErrorActionPreference = 'Stop'
$datasetId = 'fc7c1c4c-c528-48f0-9030-a72b77c7a213'
$apiBase = 'https://api.dify.ai/v1'
$ragRoot = Split-Path -Parent $PSScriptRoot
$repositoryRoot = Split-Path -Parent $ragRoot
$envPath = Join-Path $repositoryRoot '.env'
$importRoot = Join-Path $ragRoot 'dify\import'

function Get-EnvValue {
    param([Parameter(Mandatory)][string]$Name)

    $line = Get-Content -Encoding UTF8 -LiteralPath $envPath |
        Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } |
        Select-Object -First 1
    if (-not $line) {
        throw "$Name fehlt in .env."
    }

    $value = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "$Name ist in .env leer."
    }
    return $value
}

if (-not (Test-Path -LiteralPath $envPath)) {
    throw ".env nicht gefunden: $envPath"
}

& (Join-Path $PSScriptRoot 'build-dify-import.ps1')

$apiKey = Get-EnvValue -Name 'DIFY_API_KEY_KNOWLEDGE'
$headers = @{ Authorization = "Bearer $apiKey" }
$documentsUri = "$apiBase/datasets/$datasetId/documents?limit=100"
$documents = (Invoke-RestMethod -Method Get -Uri $documentsUri -Headers $headers).data
$importFiles = Get-ChildItem -LiteralPath $importRoot -Filter '*.md' -File | Sort-Object Name

if (-not [string]::IsNullOrWhiteSpace($ImportFilePattern)) {
    $importFiles = @($importFiles | Where-Object { $_.Name -match $ImportFilePattern })
    if ($importFiles.Count -eq 0) {
        throw "Keine Importdatei passt zu ImportFilePattern: $ImportFilePattern"
    }
}

if ([string]::IsNullOrWhiteSpace($ImportFilePattern) -and $importFiles.Count -ne 10) {
    throw "Erwartet wurden genau 10 Importdateien, gefunden wurden $($importFiles.Count)."
}

$processRule = @{
    mode = 'custom'
    rules = @{
        pre_processing_rules = @(
            @{ id = 'remove_extra_spaces'; enabled = $false },
            @{ id = 'remove_urls_emails'; enabled = $false }
        )
        segmentation = @{
            separator = "`n`n"
            max_tokens = 1024
            chunk_overlap = 0
        }
    }
}

foreach ($file in $importFiles) {
    $document = $documents | Where-Object { $_.name -eq $file.Name } | Select-Object -First 1
    if (-not $document) {
        throw "Kein bestehendes Dify-Dokument für $($file.Name) gefunden."
    }

    $data = @{
        name = $file.Name
        indexing_technique = 'high_quality'
        process_rule = $processRule
    } | ConvertTo-Json -Depth 8 -Compress

    $uri = "$apiBase/datasets/$datasetId/documents/$($document.id)/update-by-file"
    $form = @{ data = $data; file = $file }
    $attempt = 0
    do {
        $attempt++
        try {
            $null = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Form $form
            $rateLimited = $false
        }
        catch {
            $rateLimited = $_.Exception.Response.StatusCode -eq 403
            if (-not $rateLimited -or $attempt -ge 6) {
                throw
            }
            Write-Host "Dify-Rate-Limit aktiv, erneuter Versuch in 15 Sekunden: $($file.Name)"
            Start-Sleep -Seconds 15
        }
    } while ($rateLimited)
    Write-Host "Aktualisierung gestartet: $($file.Name)"
    if ($file -ne $importFiles[-1]) {
        Start-Sleep -Seconds $UpdateDelaySeconds
    }
}

$deadline = [DateTime]::UtcNow.AddSeconds($PollingTimeoutSeconds)
do {
    Start-Sleep -Seconds 5
    $documents = (Invoke-RestMethod -Method Get -Uri $documentsUri -Headers $headers).data
    $pending = @($documents | Where-Object { $_.indexing_status -notin @('completed', 'error', 'paused') })
    $failed = @($documents | Where-Object { $_.indexing_status -in @('error', 'paused') })

    if ($failed.Count -gt 0) {
        $names = ($failed | ForEach-Object { "$($_.name) ($($_.indexing_status))" }) -join ', '
        throw "Dify-Indexierung fehlgeschlagen: $names"
    }

    Write-Host "Noch in Indexierung: $($pending.Count)"
} while ($pending.Count -gt 0 -and [DateTime]::UtcNow -lt $deadline)

if ($pending.Count -gt 0) {
    throw "Zeitüberschreitung bei der Dify-Indexierung."
}

Write-Host 'Dify-Wissensbasis vollständig aktualisiert.' -ForegroundColor Green
