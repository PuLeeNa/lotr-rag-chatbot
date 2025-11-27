# LOTR RAG Chatbot Startup Script
Write-Host "🧙‍♂️ Starting LOTR RAG Chatbot..." -ForegroundColor Cyan
Write-Host ""

# Start Ollama
Write-Host "Starting Ollama service..." -ForegroundColor Yellow
Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
Start-Sleep -Seconds 3
Write-Host "✓ Ollama service started" -ForegroundColor Green
Write-Host ""

# Start Next.js
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
npm run dev
