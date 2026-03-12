@echo off
setlocal EnableDelayedExpansion

:: ── Load .env ───────────────────────────────────────────────────────────────
set "DOTENV=%~dp0.env"
if exist "%DOTENV%" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%DOTENV%") do (
        if not "%%A"=="" if not "%%B"=="" (
            set "%%A=%%B"
        )
    )
)

:: ── Find Maven in .m2/wrapper/dists ─────────────────────────────────────────
set "MVN_CMD="
set "DIST_DIR=%USERPROFILE%\.m2\wrapper\dists"

for /d %%v in ("%DIST_DIR%\apache-maven-3.9.12\*") do (
    if exist "%%v\bin\mvn.cmd" set "MVN_CMD=%%v\bin\mvn.cmd"
)

:: Fallback: any apache-maven in dists
if not defined MVN_CMD (
    for /d %%p in ("%DIST_DIR%\apache-maven-*") do (
        for /d %%v in ("%%p\*") do (
            if exist "%%v\bin\mvn.cmd" set "MVN_CMD=%%v\bin\mvn.cmd"
        )
    )
)

:: Fallback: mvn on PATH
if not defined MVN_CMD (
    where mvn >nul 2>&1 && set "MVN_CMD=mvn"
)

if not defined MVN_CMD (
    echo [ERROR] Maven not found. Please run mvnw.cmd once to download it, or install Maven manually.
    exit /b 1
)

echo [mvnw] Using: %MVN_CMD%
"%MVN_CMD%" %*
