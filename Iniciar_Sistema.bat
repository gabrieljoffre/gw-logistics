@echo off
:: Solicita privilegios de administrador
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Solicitando Permissao de Administrador para atualizar o motor...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

title Servidor Independente GW Logistics
color 0A

echo =======================================================
echo          SISTEMA DE ENTREGAS - REINICIALIZACAO
echo =======================================================
echo.
echo [1] Fechando qualquer Motor antigo travado...
taskkill /F /IM node.exe >nul 2>&1
echo Fechado com sucesso!
echo.

echo [2] Liberando a porta 3001 no Firewall do Windows...
netsh advfirewall firewall add rule name="GW_Logistics" dir=in action=allow protocol=TCP localport=3001 >nul
echo Porta 3001 livre!
echo.

echo [3] Descobrindo o IP deste notebook...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set _IP=%%a
set _IP=%_IP: =%

echo Seu IP Interno: %_IP%
echo.

echo [4] Iniciando o Servidor Unificado Atualizado...
cd backend
start "GW Motor" cmd /k "npx tsx src/server.ts"
cd ..

echo.
echo =======================================================
echo SISTEMA TOTALMENTE OPERACIONAL E ATUALIZADO!
echo.
echo PARA VOCE ACESSAR NESTE COMPUTADOR:
echo - http://localhost:3001
echo.
echo PARA SEUS COLEGAS ACESSAREM DA REDE:
echo - http://%_IP%:3001
echo =======================================================
echo.
echo A tela preta do "GW Motor" precisa ficar aberta.
pause
