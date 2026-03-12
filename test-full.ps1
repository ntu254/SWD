param([string]$BaseUrl = "http://localhost:8080/api")

$b = $BaseUrl
$ts = Get-Date -Format "HHmmss"
$pass = "Test1234!"
$ok = 0; $fail = 0

function Ok($label, $code, $body) {
    Write-Host "[PASS] $label  ($code)" -ForegroundColor Green
    $script:ok++
}
function Fail($label, $code, $msg) {
    Write-Host "[FAIL] $label  ($code): $msg" -ForegroundColor Red
    $script:fail++
}
function Call($label, $method, $url, $body = $null, $headers = @{}, $expectCode = 200) {
    try {
        $params = @{ Uri = $url; Method = $method; UseBasicParsing = $true; ErrorAction = "Stop" }
        if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 5); $params.ContentType = "application/json" }
        if ($headers.Count) { $params.Headers = $headers }
        $r = Invoke-WebRequest @params
        $j = $r.Content | ConvertFrom-Json
        if ($r.StatusCode -eq $expectCode -or ($expectCode -eq 200 -and $r.StatusCode -lt 300)) {
            Ok $label $r.StatusCode $j
        } else {
            Fail $label $r.StatusCode "Expected $expectCode"
        }
        return $j
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $rawMsg = $_.ErrorDetails.Message
        $msg = if ($rawMsg) { try { ($rawMsg | ConvertFrom-Json).message } catch { $rawMsg } } else { $_.Exception.Message }
        Fail $label $code $msg
        return $null
    }
}

Write-Host "`n========= SWD392 Full Business Flow Test =========" -ForegroundColor Cyan
Write-Host "Timestamp: $ts | Base: $b`n"

# ═══════════════════════════════════════════════════
# STEP 1: ADMIN SETUP
# ═══════════════════════════════════════════════════
Write-Host "--- [1] ADMIN BOOTSTRAP ---" -ForegroundColor Yellow
$adminEmail = "admin@swd392.com"
$setupHdr = @{ "X-Setup-Secret" = "swd392-setup-secret" }
# Accept 200 (admin updated) or 201 (admin created) - both return a token
$j = $null
try {
    $params = @{ Uri = "$b/auth/admin-setup"; Method = "POST"; Body = (@{email=$adminEmail;password=$pass;firstName="Admin";lastName="SWD392";role="CITIZEN"} | ConvertTo-Json); ContentType = "application/json"; Headers = $setupHdr; UseBasicParsing = $true }
    $r = Invoke-WebRequest @params -ErrorAction Stop
    $j = $r.Content | ConvertFrom-Json
    Ok "Admin Setup/Reset" $r.StatusCode $j
} catch {
    $rawMsg = $_.ErrorDetails.Message
    $msg = if ($rawMsg) { try { ($rawMsg | ConvertFrom-Json).message } catch { $rawMsg } } else { $_.Exception.Message }
    Fail "Admin Setup/Reset" $_.Exception.Response.StatusCode.value__ $msg
}
if (-not $j) { Write-Host "FATAL: Cannot get admin token. Aborting." -ForegroundColor Red; return }
$adminToken = $j.data.accessToken
$adminHdr = @{ Authorization = "Bearer $adminToken" }
Write-Host "  Admin token: $adminToken.Substring(0,20)..."

# ═══════════════════════════════════════════════════
# STEP 2: ADMIN CREATES REFERENCE DATA
# ═══════════════════════════════════════════════════
Write-Host "`n--- [2] ADMIN: Create reference data ---" -ForegroundColor Yellow

# 2a. Waste Types
$j = Call "Create Waste Type: Organic" POST "$b/admin/waste-types" @{name="Organic Waste $ts";description="Food and plant waste";isActive=$true;isRecyclable=$false} $adminHdr 200
$wasteTypeOrganic = $j.data.wasteTypeId
$j2 = Call "Create Waste Type: Recyclable" POST "$b/admin/waste-types" @{name="Recyclable $ts";description="Plastic, paper, glass";isActive=$true;isRecyclable=$true} $adminHdr 200
$wasteTypeRecyclable = $j2.data.wasteTypeId

# 2b. Service Area
$j = Call "Create Service Area" POST "$b/admin/service-areas" @{name="District 1 - $ts";geoBoundaryWkt="POLYGON((0 0,1 0,1 1,0 1,0 0))";isActive=$true} $adminHdr 200
$areaId = $j.data.areaId

# 2c. Reward Items
$j = Call "Create Reward Item" POST "$b/admin/reward-items" @{name="Eco Bag $ts";description="Reusable bag";pointsCost=500;stock=100;isActive=$true} $adminHdr 200
$rewardItemId = $j.data.itemId

# 2d. Notification
$j = Call "Create Notification" POST "$b/admin/notifications" @{
    title="System Update $ts"
    content="New reward rules in effect"
    type="General"
    targetAudience="All"
    priority="Normal"
    isActive=$true
} $adminHdr 200

# 2e. System Settings
$j = Call "Create System Setting" POST "$b/admin/settings" @{
    settingKey="test_setting_$ts"
    settingValue="5"
    description="Test setting $ts"
    dataType="INTEGER"
} $adminHdr 201
$j = Call "Update System Setting" PUT "$b/admin/settings/max_reports_per_citizen_per_day" @{settingValue="10"} $adminHdr

# 2f. Dashboard
$j = Call "Admin Dashboard" GET "$b/admin/dashboard" $null $adminHdr
if ($j) { Write-Host "  Stats: users=$($j.data.totalUsers) reports=$($j.data.totalReports) tasks=$($j.data.activeTasks)" }

# ═══════════════════════════════════════════════════
# STEP 3: ENTERPRISE REGISTERS & SETS UP
# ═══════════════════════════════════════════════════
Write-Host "`n--- [3] ENTERPRISE: Register & configure ---" -ForegroundColor Yellow
$entEmail = "enterprise$ts@swd392.com"
$j = Call "Enterprise Register" POST "$b/auth/register" @{email=$entEmail;password=$pass;firstName="EcoRecycle";lastName="Corp";role="ENTERPRISE"} $null 201
$entToken = $j.data.accessToken
$entId = $j.data.userId
$entHdr = @{ Authorization = "Bearer $entToken" }

# 3b. Add capability
$j = Call "Add Enterprise Capability" POST "$b/enterprise/capabilities" @{
    serviceAreaId=$areaId
    wasteTypeId=$wasteTypeRecyclable
    dailyCapacityKg=500.0
    effectiveFrom="2026-01-01"
    effectiveTo="2026-12-31"
} $entHdr 200
$capId = $j.data.capabilityId

# 3c. Create reward rules
$j = Call "Create Reward Rule (GOOD)" POST "$b/enterprise/reward-rules" @{
    wasteTypeId=$wasteTypeRecyclable
    sortingLevel="GOOD"
    pointsFixed=50.0
    pointsPerKg=10.0
} $entHdr 201
$ruleId = $j.data.ruleId
$j = Call "Create Reward Rule (ACCEPTABLE)" POST "$b/enterprise/reward-rules" @{
    wasteTypeId=$wasteTypeOrganic
    sortingLevel="ACCEPTABLE"
    pointsFixed=20.0
    pointsPerKg=5.0
} $entHdr 201

# 3d. List reward rules
$j = Call "List Reward Rules" GET "$b/enterprise/reward-rules" $null $entHdr
if ($j) { Write-Host "  Rules count: $($j.data.Count)" }

# 3e. Update reward rule
$j = Call "Update Reward Rule" PUT "$b/enterprise/reward-rules/$ruleId" @{
    wasteTypeId=$wasteTypeRecyclable
    sortingLevel="GOOD"
    pointsFixed=60.0
    pointsPerKg=12.0
} $entHdr

# ═══════════════════════════════════════════════════
# STEP 4: COLLECTOR REGISTERS & ENTERPRISE CONFIGURES KPI
# ═══════════════════════════════════════════════════
Write-Host "`n--- [4] COLLECTOR: Register + KPI config ---" -ForegroundColor Yellow
$collEmail = "collector$ts@swd392.com"
$j = Call "Collector Register" POST "$b/auth/register" @{email=$collEmail;password=$pass;firstName="Nguyen";lastName="Collector";role="COLLECTOR";enterpriseUserId=$entId} $null 201
$collToken = $j.data.accessToken
$collId = $j.data.userId
$collHdr = @{ Authorization = "Bearer $collToken" }

# Enterprise lists their collectors
$j = Call "Enterprise: List Collectors" GET "$b/enterprise/collectors" $null $entHdr
if ($j) { Write-Host "  Collectors: $($j.data.Count)" }

# Enterprise sets KPI for collector
$j = Call "Enterprise: Set Collector KPI" POST "$b/enterprise/collectors/kpi" @{
    collectorUserId=$collId
    areaId=$areaId
    minVisits=3
    minWeightKg=30.0
} $entHdr
if ($j) { Write-Host "  KPI: min $($j.data.minVisits) visits, min $($j.data.minWeightKg) kg" }

# Collector views KPI
$j = Call "Collector: View Today KPI" GET "$b/collector/kpi/today" $null $collHdr
if ($j) { Write-Host "  KPI status: $($j.data.status) ($($j.data.actualVisits)/$($j.data.minVisits) visits)" }

# ═══════════════════════════════════════════════════
# STEP 5: CITIZEN REGISTERS & SUBMITS REPORT
# ═══════════════════════════════════════════════════
Write-Host "`n--- [5] CITIZEN: Register & submit report ---" -ForegroundColor Yellow
$citEmail = "citizen$ts@swd392.com"
$j = Call "Citizen Register" POST "$b/auth/register" @{email=$citEmail;password=$pass;firstName="Tran";lastName="Citizen";role="CITIZEN"} $null 201
$citToken = $j.data.accessToken
$citId = $j.data.userId
$citHdr = @{ Authorization = "Bearer $citToken" }

# 5a. View waste types (public)
$j = Call "List Waste Types (public)" GET "$b/waste-types"
if ($j) { Write-Host "  Waste types: $($j.data.Count)" }

# 5b. View service areas (public)
$j = Call "List Service Areas (public)" GET "$b/service-areas"

# 5c. Create waste report
$j = Call "Citizen: Create Report" POST "$b/reports" @{
    wasteTypeId=$wasteTypeRecyclable
    areaId=$areaId
    latitude=10.775
    longitude=106.700
    description="Recyclable plastic bags near my house"
    reportPhotoUrl="https://example.com/photo.jpg"
} $citHdr 200
if (-not $j) {
    Fail "Citizen: Create Report (retry)" 0 "Report creation failed"
} else {
    $reportId = $j.data.reportId
    Write-Host "  Report ID: $reportId | Status: $($j.data.status)"
}

# 5d. Track report status
$j = Call "Citizen: View My Reports" GET "$b/reports/mine" $null $citHdr
if ($j) { Write-Host "  My reports: $($j.data.content.Count)" }

$j = Call "Citizen: Get Report Detail" GET "$b/reports/$reportId" $null $citHdr
if ($j) { Write-Host "  Report status: $($j.data.status)" }

# ═══════════════════════════════════════════════════
# STEP 6: ENTERPRISE SEES & ACCEPTS REPORT
# ═══════════════════════════════════════════════════
Write-Host "`n--- [6] ENTERPRISE: Accept report & assign collector ---" -ForegroundColor Yellow

# Enterprise views pending reports
$j = Call "Enterprise: View Pending Reports" GET "$b/enterprise/reports/pending" $null $entHdr
if ($j) { Write-Host "  Pending reports: $($j.data.content.Count)" }

# Accept report → creates task
$j = Call "Enterprise: Accept Report" PUT "$b/enterprise/reports/$reportId/accept" $null $entHdr 201
$taskId = $null
if ($j) { $taskId = $j.data.taskId; Write-Host "  Task created: $taskId | Status: $($j.data.status)" }

# List enterprise tasks
$j = Call "Enterprise: List Tasks" GET "$b/enterprise/tasks" $null $entHdr
if ($j) { Write-Host "  Tasks: $($j.data.content.Count)" }

# Assign task to collector
if ($taskId) {
    $j = Call "Enterprise: Assign Task to Collector" POST "$b/enterprise/tasks/$taskId/assign" @{
        collectorUserId=$collId
    } $entHdr
    if ($j) { Write-Host "  Task $taskId assigned to collector $collId | Status: $($j.data.status)" }
}

# ═══════════════════════════════════════════════════
# STEP 7: COLLECTOR UPDATES STATUS & COMPLETES TASK
# ═══════════════════════════════════════════════════
Write-Host "`n--- [7] COLLECTOR: Receive task, update status, complete ---" -ForegroundColor Yellow

# Collector views tasks
$j = Call "Collector: View My Tasks" GET "$b/collector/tasks" $null $collHdr
if ($j) { Write-Host "  My tasks: $($j.data.content.Count)" }

# Update status to ON_THE_WAY
if ($taskId) {
    $j = Call "Collector: Update Status → ON_THE_WAY" PUT "$b/collector/tasks/$taskId/status?status=ON_THE_WAY" $null $collHdr

    # Complete task with waste items and photos
    $j = Call "Collector: Complete Task" POST "$b/collector/tasks/$taskId/complete" @{
        visitStatus="SUCCESS"
        collectorNote="Collected 15kg recyclable material, good sorting"
        photoUrls=@("https://example.com/evidence1.jpg", "https://example.com/evidence2.jpg")
        wasteItems=@(
            @{wasteTypeId=$wasteTypeRecyclable; weightKg=15.0; sortingLevel="GOOD"; contaminationNote="Clean"},
            @{wasteTypeId=$wasteTypeOrganic; weightKg=8.0; sortingLevel="ACCEPTABLE"; contaminationNote="Minor mix"}
        )
    } $collHdr
    if ($j) { Write-Host "  Task completed! Status: $($j.data.status)" }
}

# Collector checks KPI after completion
$j = Call "Collector: KPI Today (after 1 task)" GET "$b/collector/kpi/today" $null $collHdr
if ($j) { Write-Host "  KPI: $($j.data.actualVisits)/$($j.data.minVisits) visits | $($j.data.actualWeightKg)/$($j.data.minWeightKg) kg | Status: $($j.data.status)" }

# ═══════════════════════════════════════════════════
# STEP 8: CITIZEN CHECKS POINTS (AFTER COLLECTION)
# ═══════════════════════════════════════════════════
Write-Host "`n--- [8] CITIZEN: Points & rewards ---" -ForegroundColor Yellow

$j = Call "Citizen: Check Points Balance" GET "$b/rewards/balance" $null $citHdr
if ($j) { Write-Host "  Points: $($j.data)" }

$j = Call "Citizen: View Reward Transactions" GET "$b/rewards/transactions" $null $citHdr
if ($j) { Write-Host "  Transactions: $($j.data.content.Count)" }

$j = Call "Citizen: View Leaderboard" GET "$b/rewards/leaderboard?limit=10" $null $citHdr
if ($j) { Write-Host "  Leaderboard entries: $($j.data.Count)" }

# View available reward items
$j = Call "Citizen: View Reward Items" GET "$b/rewards/items" $null $citHdr
if ($j) { Write-Host "  Available items: $($j.data.Count)" }

# Try to redeem (may fail if insufficient points — that's expected)
$redeemResult = $null
try {
    $params = @{ Uri = "$b/rewards/redeem"; Method = "POST"; Body = (@{itemId=$rewardItemId} | ConvertTo-Json); ContentType = "application/json"; Headers = $citHdr; UseBasicParsing = $true; ErrorAction = "Stop" }
    $r = Invoke-WebRequest @params
    $j = $r.Content | ConvertFrom-Json
    Ok "Citizen: Redeem Reward" $r.StatusCode $j
    $redeemResult = $j
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $rawMsg2 = $_.ErrorDetails.Message
    $msg = if ($rawMsg2) { try { ($rawMsg2 | ConvertFrom-Json).message } catch { $rawMsg2 } } else { $_.Exception.Message }
    if ($code -eq 400) {
        Write-Host "[INFO] Redeem: insufficient points (expected at low balance) - $msg" -ForegroundColor Cyan
        $script:ok++  # Not a test failure
    } else {
        Fail "Citizen: Redeem Reward" $code $msg
    }
}

# ═══════════════════════════════════════════════════
# STEP 9: CITIZEN SUBMITS COMPLAINT
# ═══════════════════════════════════════════════════
Write-Host "`n--- [9] CITIZEN: Complaint management ---" -ForegroundColor Yellow

$j = Call "Citizen: Submit Complaint" POST "$b/complaints" @{
    title="Collector was late"
    content="Collector arrived 3 hours after the scheduled time"
    category="COLLECTION_ISSUE"
    priority="Normal"
} $citHdr 200
$complaintId = $null
if ($j) { $complaintId = $j.data.complaintId; Write-Host "  Complaint ID: $complaintId" }

$j = Call "Citizen: View My Complaints" GET "$b/complaints/mine" $null $citHdr
if ($j) { Write-Host "  My complaints: $($j.data.content.Count)" }

# ═══════════════════════════════════════════════════
# STEP 10: ADMIN RESOLVES COMPLAINT & MANAGES SYSTEM
# ═══════════════════════════════════════════════════
Write-Host "`n--- [10] ADMIN: Complaints + system management ---" -ForegroundColor Yellow

# Admin views all complaints
    $j = Call "Admin: View All Complaints" GET "$b/complaints?page=0`&size=20" $null $adminHdr
if ($j) { Write-Host "  Total complaints: $($j.data.totalElements)" }

# Resolve complaint
if ($complaintId) {
    $j = Call "Admin: Resolve Complaint" PUT "$b/complaints/$complaintId/resolve" @{
        decision="RESOLVED"
        note="Collector was delayed due to traffic. Apology issued."
        isAccepted=$true
    } $adminHdr
    if ($j) { Write-Host "  Complaint resolved: $($j.data.status)" }
}

# Admin views enterprise list
$j = Call "Admin: List Enterprises" GET "$b/admin/enterprises" $null $adminHdr
if ($j) { Write-Host "  Enterprises: $($j.data.totalElements)" }

# Admin manages users
$j = Call "Admin: List All Users" GET "$b/admin/users" $null $adminHdr
if ($j) { Write-Host "  Total users: $($j.data.totalElements)" }

# Admin views/manages notifications
$j = Call "Admin: List Notifications" GET "$b/admin/notifications" $null $adminHdr
if ($j) { Write-Host "  Notifications: $($j.data.totalElements)" }

# Admin reward items management
$j = Call "Admin: List Reward Items" GET "$b/admin/reward-items" $null $adminHdr
if ($j) { Write-Host "  Reward items: $($j.data.content.Count)" }

# Admin: Get system settings
$j = Call "Admin: Get System Settings" GET "$b/admin/settings" $null $adminHdr
if ($j) { Write-Host "  Settings: $($j.data.Count)" }

# ═══════════════════════════════════════════════════
# STEP 11: ENTERPRISE REJECTS A SECOND REPORT
# ═══════════════════════════════════════════════════
Write-Host "`n--- [11] ENTERPRISE: Reject flow ---" -ForegroundColor Yellow

# Citizen creates another report
$j = Call "Citizen: Create Second Report" POST "$b/reports" @{
    wasteTypeId=$wasteTypeOrganic
    areaId=$areaId
    latitude=10.780
    longitude=106.705
    description="Organic waste pile"
} $citHdr 200
$reportId2 = $j.data.reportId

# Enterprise rejects
$j = Call "Enterprise: Reject Report" PUT "$b/enterprise/reports/$reportId2/reject?reason=OutOfServiceArea" $null $entHdr
if ($j) { Write-Host "  Report rejected" }

# Verify report status changed
$j = Call "Citizen: Check Rejected Report" GET "$b/reports/$reportId2" $null $citHdr
if ($j) { Write-Host "  Report 2 status: $($j.data.status)" }

# ═══════════════════════════════════════════════════
# STEP 12: KPI HISTORY
# ═══════════════════════════════════════════════════
Write-Host "`n--- [12] ENTERPRISE: KPI History ---" -ForegroundColor Yellow
$j = Call "Enterprise: Collector KPI History" GET "$b/enterprise/collectors/$collId/kpi" $null $entHdr
if ($j) { Write-Host "  KPI records for collector: $($j.data.Count)" }

# ═══════════════════════════════════════════════════
# STEP 13: PROFILE & AUTH FLOWS
# ═══════════════════════════════════════════════════
Write-Host "`n--- [13] Profile + Auth flows ---" -ForegroundColor Yellow
$j = Call "Citizen: Get Profile" GET "$b/users/me" $null $citHdr
if ($j) { Write-Host "  Profile: $($j.data.email) | role: $($j.data.role)" }

$j = Call "Citizen: Update Profile" PUT "$b/users/me" @{
    firstName="TranUpdated"; lastName="Citizen"
} $citHdr

# Auth: Refresh token
$j = Call "Citizen Login (get fresh tokens)" POST "$b/auth/login" @{email=$citEmail;password=$pass}
$newRefreshToken = $j.data.refreshToken
$j = Call "Refresh Access Token" POST "$b/auth/refresh" @{refreshToken=$newRefreshToken}
if ($j) { Write-Host "  Token refreshed successfully" }

# Auth: Logout
$j = Call "Citizen: Logout" POST "$b/auth/logout" $null $citHdr

# ═══════════════════════════════════════════════════
# STEP 14: ADMIN SECURITY VERIFICATION
# ═══════════════════════════════════════════════════
Write-Host "`n--- [14] Security checks ---" -ForegroundColor Yellow

# Citizen cannot access admin endpoints → should be 403
try {
    $r = Invoke-WebRequest "$b/admin/users" -Headers $citHdr -UseBasicParsing -ErrorAction Stop
    Fail "Security: Citizen blocked from admin" $r.StatusCode "Should have returned 403"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 403) { Ok "Security: Citizen blocked from admin (403)" 403 $null }
    else { Fail "Security: Citizen blocked from admin" $code "Expected 403" }
}

# Collector cannot access enterprise endpoints
try {
    $r = Invoke-WebRequest "$b/enterprise/reports/pending" -Headers $collHdr -UseBasicParsing -ErrorAction Stop
    Fail "Security: Collector blocked from enterprise" $r.StatusCode "Should have returned 403"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 403) { Ok "Security: Collector blocked from enterprise (403)" 403 $null }
    else { Fail "Security: Collector blocked from enterprise" $code "Expected 403" }
}

# ═══════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════
Write-Host "`n========= TEST RESULTS =========" -ForegroundColor Cyan
Write-Host "  PASSED: $ok" -ForegroundColor Green
Write-Host "  FAILED: $fail" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "  TOTAL : $($ok + $fail)"
if ($fail -eq 0) {
    Write-Host "`n  ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "`n  $fail test(s) FAILED - check output above." -ForegroundColor Red
}
