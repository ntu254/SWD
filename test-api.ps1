$ts = Get-Date -Format "HHmmss"
$b = "http://localhost:8080/api"
$email = "tester$ts@test.com"
Write-Host "=== API TEST SUITE ==="
Write-Host "Email: $email"
Write-Host ""

# 1. REGISTER
$body = '{"email":"' + $email + '","password":"Test1234!","firstName":"A","lastName":"B","role":"CITIZEN"}'
try {
  $r = Invoke-WebRequest "$b/auth/register" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction Stop
  Write-Host "1. REGISTER $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "1. REGISTER FAIL ($code): $msg"
}

# 2. LOGIN
$body = '{"email":"' + $email + '","password":"Test1234!"}'
try {
  $r = Invoke-WebRequest "$b/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction Stop
  $j = $r.Content | ConvertFrom-Json
  $tok = $j.data.accessToken
  $ref = $j.data.refreshToken
  Write-Host "2. LOGIN $($r.StatusCode): $($j.message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "2. LOGIN FAIL ($code): $msg"
  exit
}

$headers = @{ "Authorization" = "Bearer $tok" }

# 3. GET PROFILE
try {
  $r = Invoke-WebRequest "$b/users/me" -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "3. PROFILE $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "3. PROFILE FAIL ($code): $msg"
}

# 4. WASTE TYPES
try {
  $r = Invoke-WebRequest "$b/waste-types" -UseBasicParsing -ErrorAction Stop
  Write-Host "4. WASTE-TYPES $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "4. WASTE-TYPES FAIL ($code): $msg"
}

# 5. SERVICE AREAS
try {
  $r = Invoke-WebRequest "$b/service-areas" -UseBasicParsing -ErrorAction Stop
  Write-Host "5. SERVICE-AREAS $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "5. SERVICE-AREAS FAIL ($code): $msg"
}

# 6. REPORTS/MINE
try {
  $r = Invoke-WebRequest "$b/reports/mine" -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "6. REPORTS/MINE $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "6. REPORTS/MINE FAIL ($code): $msg"
}

# 7. REWARDS/BALANCE
try {
  $r = Invoke-WebRequest "$b/rewards/balance" -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "7. REWARDS/BALANCE $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "7. REWARDS/BALANCE FAIL ($code): $msg"
}

# 8. NOTIFICATIONS
try {
  $r = Invoke-WebRequest "$b/notifications" -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "8. NOTIFICATIONS $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "8. NOTIFICATIONS FAIL ($code): $msg"
}

# 9. REFRESH TOKEN
$body = '{"refreshToken":"' + $ref + '"}'
try {
  $r = Invoke-WebRequest "$b/auth/refresh" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction Stop
  Write-Host "9. REFRESH $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "9. REFRESH FAIL ($code): $msg"
}

# 10. ADMIN BLOCK (should return 403)
try {
  $r = Invoke-WebRequest "$b/admin/users" -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "10. ADMIN-BLOCK $($r.StatusCode): UNEXPECTED SUCCESS"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 403) {
    Write-Host "10. ADMIN-BLOCK 403: Correctly blocked"
  } else {
    Write-Host "10. ADMIN-BLOCK ($code): Unexpected"
  }
}

# 11. LOGOUT
$body = '{"refreshToken":"' + $ref + '"}'
try {
  $r = Invoke-WebRequest "$b/auth/logout" -Method POST -ContentType "application/json" -Body $body -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "11. LOGOUT $($r.StatusCode): $(($r.Content|ConvertFrom-Json).message)"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $msg = try { ($_.ErrorDetails.Message|ConvertFrom-Json).message } catch { $_.Exception.Message }
  Write-Host "11. LOGOUT FAIL ($code): $msg"
}

Write-Host ""
Write-Host "=== DONE ==="
