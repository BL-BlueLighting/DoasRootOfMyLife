@echo off
echo DoasRootOfMylife
echo Hold down... We are launching...

rem check requirements
if not exist "node_modules" (
    echo Installing requirements...
    npm install
)

rem check if node is installed
if not defined NODE_PATH (
    echo Node.js is not installed. Please install Node.js and try again.
    exit /b
)

rem check if npm is installed
if not defined npm (
    echo npm is not installed. Please install npm and try again.
    exit /b
)

rem check if package.json exists
if not exist "package.json" (
    echo package.json file not found. Please create a package.json file and try again.
    exit /b
)

echo All requirements are met. Starting the application...

npm start

echo Goodbye, the user!