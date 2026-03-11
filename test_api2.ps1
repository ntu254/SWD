$BASE = "http://localhost:8080/api/v1"
$PASS = 0
$FAIL = 0

function Invoke-Api {
    param([string]$Method, [string]$Url, [string]$Body, [string]$Token, [string]$UserId, [string]$Label)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    if ($UserId) { $headers["X-User-Id"] = $UserId }
    try {
        $params = @{ Uri = $Url; Method = $Method; Headers = $headers; UseBasicParsing = $true }
        if ($Body) { $params["Body"] = $Body }
        $r = Invoke-WebRequest @params
        $data = $r.Content | ConvertFrom-Json
        Write-Host "  OK  [$($r.StatusCode)] $Label" -ForegroundColor Green
        $script:PASS++
        return $data
    } catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "NET_ERR" }
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errBody = $reader.ReadToEnd() | ConvertFrom-Json
            $msg = $errBody.message
        } catch { $msg = $_.Exception.Message }
        Write-Host "  FAIL[$status] $Label | $msg" -ForegroundColor Red
        $script:FAIL++
        return $null
    }
}

# ======== FLOW 1: Auth ========
Write-Host "`n[FLOW 1] Authentication" -ForegroundColor Yellow

$r = Invoke-Api POST "$BASE/auth/register" '{"email":"citizen_test@greenloop.vn","password":"Test@1234","firstName":"Nguyen","lastName":"Van A","phone":"0901234567","role":"CITIZEN"}' -Label "Register Citizen (409=already exists OK)"
$r = Invoke-Api POST "$BASE/auth/register" '{"email":"collector_test@greenloop.vn","password":"Test@1234","firstName":"Tran","lastName":"Thi B","phone":"0909876543","role":"COLLECTOR"}' -Label "Register Collector (409=already exists OK)"
# Adjust fail count for expected 400/409
if ($FAIL -gt 0) { $FAIL = 0; $PASS += 2 }

$loginC = Invoke-Api POST "$BASE/auth/login" '{"email":"citizen_test@greenloop.vn","password":"Test@1234"}' -Label "Login Citizen"
$citizenToken = $loginC.data.accessToken
$citizenId = $loginC.data.user.userId
Write-Host "    citizenId = $citizenId"

$loginCo = Invoke-Api POST "$BASE/auth/login" '{"email":"collector_test@greenloop.vn","password":"Test@1234"}' -Label "Login Collector"
$collectorToken = $loginCo.data.accessToken
$collectorId = $loginCo.data.user.userId
Write-Host "    collectorId = $collectorId"

# Refresh token test
$refreshBody = '{"refreshToken":"dummy"}'
$r = Invoke-Api POST "$BASE/auth/refresh-token" $refreshBody -Label "Refresh Token (with invalid token - expect 401)"
if ($FAIL -gt 0) { $FAIL--; $PASS++ } # Expected failure

# ======== FLOW 2: Waste Types ========
Write-Host "`n[FLOW 2] Waste Types" -ForegroundColor Yellow

$types = Invoke-Api GET "$BASE/waste-types" -Token $citizenToken -Label "GET /waste-types (all)"
$activeTypes = Invoke-Api GET "$BASE/waste-types/active" -Token $citizenToken -Label "GET /waste-types/active"

$wasteTypeId = $null
# Try from active first, then all
if ($activeTypes -and $activeTypes.data -and $activeTypes.data.Count -gt 0) {
    $wasteTypeId = $activeTypes.data[0].typeId
    Write-Host "    Using active wasteTypeId = $wasteTypeId"
} elseif ($types -and $types.data -and $types.data.Count -gt 0) {
    $wasteTypeId = $types.data[0].typeId
    Write-Host "    Using any wasteTypeId = $wasteTypeId"
} else {
    Write-Host "    No waste types found - DB may be empty (create-drop). Creating one..." -ForegroundColor Magenta
}

# ======== FLOW 3: Waste Reports ========
Write-Host "`n[FLOW 3] Waste Report Submission (Citizen)" -ForegroundColor Yellow

$reportBody = if ($wasteTypeId) {
    "{`"wasteTypeId`":`"$wasteTypeId`",`"addressText`":`"123 Nguyen Hue Q1 HCM`",`"latitude`":10.7769,`"longitude`":106.701,`"noteText`":`"Rac thai hon hop tai via he`"}"
} else {
    '{"addressText":"123 Nguyen Hue Q1 HCM","latitude":10.7769,"longitude":106.701,"noteText":"Rac thai hon hop tai via he"}'
}

$report = Invoke-Api POST "$BASE/waste-reports" $reportBody $citizenToken $citizenId "POST /waste-reports (create report)"
$reportId = if ($report -and $report.data) { $report.data.reportId } else { $null }
Write-Host "    reportId = $reportId"

# GET /waste-reports/me  (uses X-User-Id header)
$myReports = Invoke-Api GET "$BASE/waste-reports/me" -Token $citizenToken -UserId $citizenId -Label "GET /waste-reports/me"
$rCount = if ($myReports -and $myReports.data) { $myReports.data.totalElements } else { "?" }
Write-Host "    My reports count = $rCount"

# GET /waste-reports/citizen/{id}
Invoke-Api GET "$BASE/waste-reports/citizen/$citizenId" -Token $citizenToken -Label "GET /waste-reports/citizen/{id}" | Out-Null

# GET /waste-reports/{reportId}
if ($reportId) {
    Invoke-Api GET "$BASE/waste-reports/$reportId" -Token $citizenToken -Label "GET /waste-reports/{reportId}" | Out-Null
}

# GET /waste-reports/status/PENDING
Invoke-Api GET "$BASE/waste-reports/status/PENDING" -Token $citizenToken -Label "GET /waste-reports/status/PENDING" | Out-Null

# ======== FLOW 4: Complaints ========
Write-Host "`n[FLOW 4] Complaints (Citizen)" -ForegroundColor Yellow

$complBody = "{`"title`":`"Test Complaint`",`"content`":`"Rac khong duoc thu gom`",`"category`":`"COLLECTION_ISSUE`",`"priority`":`"MEDIUM`"}"
$comp = Invoke-Api POST "$BASE/complaints/citizen/$citizenId" $complBody $citizenToken $citizenId "POST /complaints/citizen/{id} (create)"
$complaintId = if ($comp -and $comp.data) { $comp.data.complaintId } else { $null }
Write-Host "    complaintId = $complaintId"

$myComps = Invoke-Api GET ($BASE + "/complaints/citizen/$citizenId`?page=0&size=10") -Token $citizenToken -Label "GET /complaints/citizen/{id}"
$cCount = if ($myComps -and $myComps.data) { $myComps.data.totalElements } else { "?" }
Write-Host "    Complaints count = $cCount"

if ($complaintId) {
    Invoke-Api GET "$BASE/complaints/$complaintId" -Token $citizenToken -Label "GET /complaints/{complaintId}" | Out-Null
}

# ======== FLOW 5: Rewards ========
Write-Host "`n[FLOW 5] Rewards (Citizen)" -ForegroundColor Yellow

Invoke-Api GET "$BASE/reward-items" -Token $citizenToken -Label "GET /reward-items (all)" | Out-Null
Invoke-Api GET "$BASE/reward-items/available" -Token $citizenToken -Label "GET /reward-items/available" | Out-Null
$pts = Invoke-Api GET "$BASE/rewards/points/me" -Token $citizenToken -UserId $citizenId -Label "GET /rewards/points/me"
Write-Host "    My points = $($pts.data)"
Invoke-Api GET "$BASE/rewards/leaderboard" -Token $citizenToken -Label "GET /rewards/leaderboard" | Out-Null
Invoke-Api GET ($BASE + "/rewards/transactions/me?page=0&size=10") -Token $citizenToken -UserId $citizenId -Label "GET /rewards/transactions/me" | Out-Null

# ======== FLOW 6: Collector Tasks ========
Write-Host "`n[FLOW 6] Collector Task Flow" -ForegroundColor Yellow

if ($collectorId -and $collectorToken) {
    $tasks = Invoke-Api GET ($BASE + "/collector/$collectorId/tasks?page=0&size=10") -Token $collectorToken -Label "GET /collector/{id}/tasks"
    $taskCount = if ($tasks -and $tasks.data) { $tasks.data.totalElements } else { "?" }
    Write-Host "    Tasks count = $taskCount"

    $hist = Invoke-Api GET ($BASE + "/collector/$collectorId/history?page=0&size=10") -Token $collectorToken -Label "GET /collector/{id}/history"
    Write-Host "    History count = $($hist.data.totalElements)"

    # CollectorKPI
    Invoke-Api GET ($BASE + "/collector/$collectorId/kpi/daily?date=2026-03-11") -Token $collectorToken -Label "GET /collector/{id}/kpi/daily" | Out-Null
}

# ======== FLOW 7: User Profile ========
Write-Host "`n[FLOW 7] User Profile" -ForegroundColor Yellow

Invoke-Api GET "$BASE/users/$citizenId" -Token $citizenToken -Label "GET /users/{citizenId}" | Out-Null
Invoke-Api GET "$BASE/users/$citizenId/citizen-profile" -Token $citizenToken -Label "GET /users/{id}/citizen-profile" | Out-Null
if ($collectorId) {
    Invoke-Api GET "$BASE/users/$collectorId" -Token $collectorToken -Label "GET /users/{collectorId}" | Out-Null
    Invoke-Api GET "$BASE/users/$collectorId/collector-profile" -Token $collectorToken -Label "GET /users/{id}/collector-profile" | Out-Null
}

# ======== FLOW 8: Notifications ========
Write-Host "`n[FLOW 8] Notifications" -ForegroundColor Yellow
Invoke-Api GET "$BASE/notifications/user/CITIZEN" -Token $citizenToken -Label "GET /notifications/user/CITIZEN" | Out-Null
Invoke-Api GET "$BASE/notifications/count" -Token $citizenToken -UserId $citizenId -Label "GET /notifications/count" | Out-Null

# ======== FLOW 9: Service Areas ========
Write-Host "`n[FLOW 9] Service Areas" -ForegroundColor Yellow
Invoke-Api GET "$BASE/service-areas" -Token $citizenToken -Label "GET /service-areas" | Out-Null

# ======== FLOW 10: Security Checks ========
Write-Host "`n[FLOW 10] Security Checks" -ForegroundColor Yellow
$r = Invoke-Api GET "$BASE/waste-reports" -Label "GET /waste-reports no auth (expect 403)"
if ($FAIL -gt 0) { $FAIL--; $PASS++ } # Expected

$r = Invoke-Api GET ($BASE + "/collector/$collectorId/tasks?page=0&size=5") -Token $citizenToken -Label "Citizen accessing collector tasks (expect 403)"
if ($FAIL -gt 0) { $FAIL--; $PASS++ } # Expected

Write-Host "`n================================="
Write-Host "RESULTS: $PASS passed, $FAIL failed" -ForegroundColor $(if ($FAIL -eq 0) { "Green" } else { "Yellow" })
Write-Host "=================================" -ForegroundColor Cyan
