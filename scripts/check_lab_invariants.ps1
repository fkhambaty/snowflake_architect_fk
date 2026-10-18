# Fail if FR_ role proofs omit SECONDARY ROLES NONE, or lab HTML reintroduces SnowShop names.
# Usage: powershell -File scripts/check_lab_invariants.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$fail = New-Object System.Collections.Generic.List[string]

$sqlFiles = @(Get-ChildItem -Path (Join-Path $root "sql") -Filter "*.sql" -File)
$htmlLabs = @(Get-ChildItem -Path (Join-Path $root "docs") -Filter "lab-*.html" -File)
$scanFiles = $sqlFiles + $htmlLabs

foreach ($f in $scanFiles) {
  $text = Get-Content -Raw -LiteralPath $f.FullName
  if ($text -notmatch "USE ROLE FR_") { continue }

  $matches = [regex]::Matches($text, "USE ROLE FR_\w+\s*;([\s\S]{0,400})")
  foreach ($m in $matches) {
    $window = $m.Value
    if ($window -notmatch "USE SECONDARY ROLES NONE") {
      $snippet = $window.Substring(0, [Math]::Min(100, $window.Length)).Replace("`r", " ").Replace("`n", " ")
      $fail.Add("$($f.Name): FR_ switch missing USE SECONDARY ROLES NONE near: $snippet")
    }
  }
}

foreach ($f in $htmlLabs) {
  $text = Get-Content -Raw -LiteralPath $f.FullName
  # Labs 00–13 must ship interviewer dig-deeper drills (not Lab 14 mock hub)
  if ($f.Name -match '^lab-(0\d|1[0-3])\.html$' -and $text -notmatch 'id="interview-drill"') {
    $fail.Add("$($f.Name): missing required #interview-drill section")
  }
  foreach ($bad in @("ARCH_INTERVIEW", "WH_ARCH_XS", "ROLE_ARCH_LAB_ADMIN", "AR_RAW_READ", "SnowShop", "AR_LANDING_READ", "AR_CURATED_READ", "FINANCE_MART")) {
    if ($text.Contains($bad)) {
      $fail.Add("$($f.Name): forbidden legacy name '$bad'")
    }
  }
  # Bare schema names (allow BRONZE_LANDING / SILVER_CURATED only)
  if ($text -match '(?<![A-Z_])LANDING(?![A-Z_])' -or $text -match '(?<![A-Z_])CURATED(?![A-Z_])') {
    # PowerShell lookbehind limited — simple contains checks for old schema tokens in code
    if ($text -match 'USE SCHEMA LANDING|FROM LANDING\.|SCHEMA LANDING|`LANDING`|schema: LANDING') {
      $fail.Add("$($f.Name): old schema LANDING still referenced")
    }
    if ($text -match 'USE SCHEMA CURATED|FROM CURATED\.|SCHEMA CURATED|`CURATED`|schema: CURATED') {
      $fail.Add("$($f.Name): old schema CURATED still referenced")
    }
  }
}

if ($fail.Count -gt 0) {
  Write-Host "FAIL - lab invariants:" -ForegroundColor Red
  foreach ($item in $fail) { Write-Host " - $item" }
  exit 1
}

Write-Host "OK - lab invariants passed ($($scanFiles.Count) files scanned)." -ForegroundColor Green
