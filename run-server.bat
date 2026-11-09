@echo off
echo ========================================================
echo Starting OurThings Spring Boot Server on port 8080...
echo ========================================================

set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.2.1"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0server"

if exist "target\ourthings-server-1.0.0.jar" (
    java -jar target\ourthings-server-1.0.0.jar
) else (
    echo Building and running via Maven...
    call "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.2\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" spring-boot:run
)

