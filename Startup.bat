@echo off
echo doas -su mylife.root
echo :: Welcome user.

rem check requirements
if not exist "node_modules" (
    echo Installing requirements...
    npm install
)

rem check if package.json exists
if not exist "package.json" (
    echo package.json file not found. Please create a package.json file and try again.
    exit /b
)

echo :: Entering terminal...

npm start --silent

echo Goodbye, the user!