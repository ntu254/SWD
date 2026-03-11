$BASE = "http://localhost:8080/api/v1"
$results = @()

function Invoke-Api {
    param([string]$Method, [string]$Url, [string]$Body, [string]$Token, [string]$Label)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    try {
        $params = @{ Uri = $Url; Method = $Method; Headers = $headers; UseBasicParsing = $true }
        if ($Body) { $params["Body"] = $Body }
        $r = Invoke-WebRequest @params
        $data = $r.Content | ConvertFrom-Json
        Write-Host "OK  [$($r.StatusCode)] $Label" -ForegroundColor Green
        return $data
    } catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "NET_ERR" }
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errBody = $reader.ReadToEnd()
        } catch { $errBody = $_.Exception.Message }
        Write-Host "FAIL[$status] $Label | $errBody" -ForegroundColor Red
        return $null
    }
}

# ==============================
Write-Host "=== FLOW 1: Authentication ===" -ForegroundColor Yellow

# 1a. Register Citizen
$r = Invoke-Api POST "$BASE/auth/register" '{"email":"citizen_test@greenloop.vn","password":"Test@1234","firstName":"Nguyen","lastName":"Van A","phone":"0901234567","role":"CITIZEN"}' -Label "Register Citizen"

# 1b. Register Collector
$r = Invoke-Api POST "$BASE/auth/register" '{"email":"collector_test@greenloop.vn","password":"Test@1234","firstName":"Tran","lastName":"Thi B","phone":"0909876543","role":"COLLECTOR"}' -Label "Register Collector"

# 1c. Login Citizen
$loginC = Invoke-Api POST "$BASE/auth/login" '{"email":"citizen_test@greenloop.vn","password":"Test@1234"}' -Label "Login Citizen"
if ($loginC) {
    $citizenToken = $loginC.data.accessToken
    $citizenId = $loginC.data.user.userId
    Write-Host "    citizenId=$citizenId" -ForegroundColor Cyan
} else { Write-Host "    WARN: citizen login failed, trying alternate" }

# 1d. Login Collector
$loginCo = Invoke-Api POST "$BASE/auth/login" '{"email":"collector_test@greenloop.vn","password":"Test@1234"}' -Label "Login Collector"
if ($loginCo) {
    $collectorToken = $loginCo.data.accessToken
    $collectorId = $loginCo.data.user.userId
    Write-Host "    collectorId=$collectorId" -ForegroundColor Cyan
}

# ==============================
Write-Host "=== FLOW 2: Waste Types ===" -ForegroundColor Yellow
$types = Invoke-Api GET "$BASE/waste-types" -Token $citizenToken -Label "Get Waste Types"
$wasteTypeId = if ($types -and $types.data) { $types.data[0].typeId } else { $null }
Write-Host "    First wasteTypeId=$wasteTypeId" -ForegroundColor Cyan

# ==============================
Write-Host "=== FLOW 3: Citizen - Submit Waste Report ===" -ForegroundColor Yellow
$reportBody = @{
    wasteTypeId = $wasteTypeId
    addressText = "123 Nguyen Hue, Q1, HCM"
    latitude = 10.7769
    longitude = 106.701
    noteText = "Rác thải hỗn hợp tại vỉa hè"
    photoUrl = "https://example.com/photo.jpg"
} | ConvertTo-Json
$report = Invoke-Api POST "$BASE/waste-reports" $reportBody $citizenToken "Submit Waste Report"
$reportId = if ($report -and $report.data) { $report.data.reportId } else { $null }
Write-Host "    reportId=$reportId" -ForegroundColor Cyan

# ==============================
Write-Host "=== FLOW 4: Citizen - Get My Reports ===" -ForegroundColor Yellow
Invoke-Api GET ($BASE + "/waste-reports/my-reports?page=0&size=10") -Token $citizenToken -Label "Get My Reports" | Out-Null

# ==============================
Write-Host "=== FLOW 5: Citizen - Get Report By ID ===" -ForegroundColor Yellow
if ($reportId) {
    Invoke-Api GET "$BASE/waste-reports/$reportId" -Token $citizenToken -Label "Get Report By ID" | Out-Null
}

# ==============================
Write-Host "=== FLOW 6: Citizen - Complaints ===" -ForegroundColor Yellow
$comp = Invoke-Api POST "$BASE/complaints" '{"title":"Test complaint","description":"Rac khong duoc thu gom","category":"UNCOLLECTED_WASTE"}' $citizenToken "Submit Complaint"
$complaintId = if ($comp -and $comp.data) { $comp.data.id } else { $null }
Write-Host "    complaintId=$complaintId" -ForegroundColor Cyan

Invoke-Api GET ($BASE + "/complaints/my-complaints?page=0&size=10") -Token $citizenToken -Label "Get My Complaints" | Out-Null

# ==============================
Write-Host "=== FLOW 7: Citizen - Rewards ===" -ForegroundColor Yellow
Invoke-Api GET ($BASE + "/rewards/items?page=0&size=10") -Token $citizenToken -Label "Get Reward Items" | Out-Null
Invoke-Api GET "$BASE/rewards/my-points" -Token $citizenToken -Label "Get My Points" | Out-Null
Invoke-Api GET ($BASE + "/rewards/leaderboard?page=0&size=10") -Token $citizenToken -Label "Get Leaderboard" | Out-Null

# ==============================
Write-Host "=== FLOW 8: Security - Unauthenticated access ===" -ForegroundColor Yellow
Invoke-Api GET ($BASE + "/waste-reports?page=0&size=5") -Label "All Reports no auth - expect 401/403" | Out-Null

# ==============================
Write-Host "=== FLOW 9: Collector - Get Tasks ===" -ForegroundColor Yellow
if ($collectorId -and $collectorToken) {
    Invoke-Api GET ($BASE + "/collector/$collectorId/tasks?page=0&size=10") -Token $collectorToken -Label "Get Collector Tasks" | Out-Null
    Invoke-Api GET ($BASE + "/collector/$collectorId/history?page=0&size=10") -Token $collectorToken -Label "Get Collector History" | Out-Null
}

# ==============================
Write-Host "=== FLOW 10: User Profile ===" -ForegroundColor Yellow
Invoke-Api GET "$BASE/users/me" -Token $citizenToken -Label "Get My Profile (citizen)" | Out-Null
if ($collectorToken) {
    Invoke-Api GET "$BASE/users/me" -Token $collectorToken -Label "Get My Profile (collector)" | Out-Null
}

# ==============================
Write-Host "=== FLOW 11: Notifications ===" -ForegroundColor Yellow
Invoke-Api GET ($BASE + "/notifications?page=0&size=10") -Token $citizenToken -Label "Get Notifications" | Out-Null

# ==============================
Write-Host "=== FLOW 12: Area list ===" -ForegroundColor Yellow
Invoke-Api GET "$BASE/areas" -Token $citizenToken -Label "Get Areas" | Out-Null

Write-Host "=== ALL TESTS COMPLETE ===" -ForegroundColor Yellow
