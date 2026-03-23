$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$imagesFolder = Join-Path $projectRoot "images"
$manifestPath = Join-Path $imagesFolder "manifest.json"
$extensions = @(".jpg", ".jpeg", ".png", ".webp", ".gif")

if (-not (Test-Path $imagesFolder)) {
  throw "Images folder not found: $imagesFolder"
}

$images = Get-ChildItem -Path $imagesFolder -File |
  Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
  Sort-Object Name |
  ForEach-Object { "images/$($_.Name)" }

$manifest = @{
  images = @($images)
}

$manifest | ConvertTo-Json -Depth 3 | Set-Content -Path $manifestPath -Encoding utf8

Write-Host "Updated manifest with $($images.Count) image(s): $manifestPath"
