# Sistema de Control Presupuestario G51-58

Aplicación institucional de control presupuestario desarrollada con **Laravel 12** (backend) + **React 19** (frontend) + **PostgreSQL**.

## 📋 Estructura del Proyecto

```
sistema_control_presupuestario_g51_58/
├── backend/              # API REST con Laravel 12
├── frontend/             # SPA con React 19
├── docs/                 # Documentación
├── docker-compose.yml    # Orquestación de contenedores
└── README.md             # Este archivo
```

## 🚀 Requisitos Previos

- **PHP 8.3+**
- **Node.js 22+**
- **PostgreSQL 18.3+**
- **Composer**
- **npm o yarn**
- **Docker 4.69.0+** (opcional, para producción)

## ⚡ Inicio Rápido

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Autenticación

- **Sistema:** Laravel Sanctum (tokens)
- **Endpoints:** `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Headers requeridos:** `Authorization: Bearer {token}`

## 📦 Stack Tecnológico

### Backend
- Laravel 11
- PostgreSQL 18.3
- Laravel Sanctum (Auth)
- Laravel Passport (opcional OAuth)
- PHPUnit (Testing)

### Frontend
- React 19.1
- Vite
- Axios (HTTP Client)
- React Router
- TailwindCSS (opcional)

## 🐳 Docker (Para después)

```bash
docker-compose up -d
```

## 📚 Documentación

Ver carpeta `docs/` para guías detalladas.

## 👥 Equipo

Proyecto Titulación G51-58

## 📝 Licencia

Institucional
