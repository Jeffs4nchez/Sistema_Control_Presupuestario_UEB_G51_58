@echo off
REM Script de Setup para Sistema de Control Presupuestario (Windows)
REM Este script configura tanto el backend (Laravel) como el frontend (React)

echo.
echo 🚀 Iniciando setup del Sistema de Control Presupuestario...
echo.

REM Configurar Backend
echo 📦 Configurando Backend (Laravel)...
cd backend

REM Copiar .env si no existe
if not exist .env (
    echo 📋 Creando archivo .env...
    copy .env.example .env
)

REM Generar APP_KEY
echo 🔑 Generando APP_KEY...
php artisan key:generate

REM Instalar dependencias PHP
echo 📚 Instalando dependencias PHP...
composer install

REM Instalar Sanctum
echo 🔐 Configurando Sanctum...
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

REM Ejecutar migraciones
echo 🗄️  Ejecutando migraciones...
php artisan migrate --force

REM Volver al directorio principal
cd ..

REM Configurar Frontend
echo.
echo ⚛️  Configurando Frontend (React)...
cd frontend

REM Instalar dependencias Node
echo 📚 Instalando dependencias Node...
call npm install

REM Volver al directorio principal
cd ..

echo.
echo ✅ Setup completado!
echo.
echo 📝 Próximos pasos:
echo.
echo 1. En una terminal PowerShell/CMD, ejecuta:
echo    cd backend ^&^& php artisan serve
echo.
echo 2. En otra terminal PowerShell/CMD, ejecuta:
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Accede a: http://localhost:5173
echo.
echo 4. Prueba con las siguientes credenciales:
echo    Email: test@example.com
echo    Contraseña: password123
echo.
echo 🎉 ¡Listo para usar!
echo.
pause
