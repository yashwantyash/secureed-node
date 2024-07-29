@echo off
echo Starting the Node.js application...

:: Navigate to the project directory
cd /d "C:\path\to\your\nodejs\project"

:: Check if node_modules exists, if not install dependencies
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Start the server
echo Starting the server...
start npm start

:: Wait a few seconds to ensure the server starts
timeout /t 5 /nobreak > nul

:: Open the default web browser and navigate to the specified URL
echo Opening the default web browser...
start http://localhost:3000

pause
