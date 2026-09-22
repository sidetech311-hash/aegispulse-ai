# AegisPulse AI - Unified Local Development Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         Launching AegisPulse AI SecOps Platform          " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start FastAPI Backend in background job or new window
Write-Host "[1/2] Launching Python FastAPI Backend on port 8000..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); py -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

# 2. Start Vite Frontend in new window
Write-Host "[2/2] Launching Vite React Frontend on port 5173..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); & 'C:\Program Files\nodejs\npm.cmd' run dev" -PassThru

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "AegisPulse AI Services Started!" -ForegroundColor Green
Write-Host "Frontend Website & SOC Console : http://localhost:5173" -ForegroundColor Cyan
Write-Host "FastAPI Interactive API Docs   : http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
