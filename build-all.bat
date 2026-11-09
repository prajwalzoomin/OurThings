@echo off
echo ========================================================
echo Building OurThings Full Stack Application
echo ========================================================

set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.2.1"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo 1. Building React Client...
cd /d "%~dp0client"
call "C:\Users\prajwal\tools\node-v20.18.0-win-x64\npm.cmd" run build
if %errorlevel% neq 0 (
    echo Client build failed.
    exit /b %errorlevel%
)

echo 2. Syncing Client Assets to Spring Boot Static Resources...
cd /d "%~dp0"
powershell -NoProfile -Command "Remove-Item -Recurse -Force 'server\src\main\resources\static'; Copy-Item -Path 'client\dist' -Destination 'server\src\main\resources\static' -Recurse -Force"

echo 3. Building and Packaging Spring Boot Server JAR...
cd /d "%~dp0server"
call "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.2\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" clean package
if %errorlevel% neq 0 (
    echo Server build failed.
    exit /b %errorlevel%
)

echo ========================================================
echo Build Succeeded! Run run-server.bat to start application.
echo ========================================================
