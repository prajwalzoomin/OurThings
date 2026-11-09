@echo off
echo ========================================================
echo Starting OurThings Vite Development Server on port 5173...
echo ========================================================

cd /d "%~dp0client"
"C:\Users\prajwal\tools\node-v20.18.0-win-x64\node.exe" node_modules\vite\bin\vite.js --port 5173

