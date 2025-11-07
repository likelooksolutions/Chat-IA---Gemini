@echo off
setlocal enabledelayedexpansion
set "PROJECT_DIR=%~dp0"

if not exist "%PROJECT_DIR%" (
    mkdir "%PROJECT_DIR%"
    echo Pasta "%PROJECT_DIR%" criada.
)

cd /d "%PROJECT_DIR%"

echo ============================================
echo   Iniciando instalação do Chat IA Gemini...
echo ============================================

:: Verifica se o Node.js está instalado
echo Verificando instalação do Node.js...
node -v >nul 2>&1
IF ERRORLEVEL 1 (
    echo ERRO: Node.js não está instalado ou não está no PATH.
    echo Por favor, instale o Node.js antes de continuar.
    pause
    exit /b
)

:: Instala dependências
echo Instalando dependências do projeto...
call npm install

IF ERRORLEVEL 1 (
    echo ERRO: Falha ao instalar dependências via npm.
    pause
    exit /b
)

:: Inicia o servidor
echo Iniciando o servidor Node.js...
node server.cjs

IF ERRORLEVEL 1 (
    echo ERRO: Falha ao iniciar o servidor.
    pause
    exit /b
)

echo Servidor encerrado.
pause
