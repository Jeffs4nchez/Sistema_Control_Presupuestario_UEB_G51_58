#!/bin/bash

# Script de Setup para Sistema de Control Presupuestario
# Este script configura tanto el backend (Laravel) como el frontend (React)

echo "🚀 Iniciando setup del Sistema de Control Presupuestario..."

# Configurar Backend
echo ""
echo "📦 Configurando Backend (Laravel)..."
cd backend

# Copiar .env si no existe
if [ ! -f .env ]; then
    echo "📋 Creando archivo .env..."
    cp .env.example .env
fi

# Generar APP_KEY
echo "🔑 Generando APP_KEY..."
php artisan key:generate

# Instalar dependencias PHP
echo "📚 Instalando dependencias PHP..."
composer install

# Instalar Sanctum
echo "🔐 Configurando Sanctum..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Ejecutar migraciones
echo "🗄️  Ejecutando migraciones..."
php artisan migrate --force

# Volver al directorio principal
cd ..

# Configurar Frontend
echo ""
echo "⚛️  Configurando Frontend (React)..."
cd frontend

# Instalar dependencias Node
echo "📚 Instalando dependencias Node..."
npm install

# Volver al directorio principal
cd ..

echo ""
echo "✅ Setup completado!"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. En una terminal, ejecuta:"
echo "   cd backend && php artisan serve"
echo ""
echo "2. En otra terminal, ejecuta:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Accede a: http://localhost:5173"
echo ""
echo "4. Prueba con las siguientes credenciales:"
echo "   Email: test@example.com"
echo "   Contraseña: password123"
echo ""
echo "🎉 ¡Listo para usar!"
