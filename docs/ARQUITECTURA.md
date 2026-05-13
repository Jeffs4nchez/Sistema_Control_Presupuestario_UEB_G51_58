# Arquitectura del Sistema

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────┐
│        React 19 Frontend (SPA)          │
│  (http://localhost:5173)                │
└─────────────────────┬───────────────────┘
                      │ HTTP/HTTPS
                      │ JSON
                      ▼
┌─────────────────────────────────────────┐
│     Laravel 11 API REST                 │
│  (http://localhost:8000/api)            │
│                                         │
│  ├─ Autenticación (Sanctum)             │
│  ├─ Validación de requests              │
│  ├─ Lógica de negocio                   │
│  └─ Respuestas JSON                     │
└─────────────────────┬───────────────────┘
                      │ Query
                      ▼
┌─────────────────────────────────────────┐
│   PostgreSQL 15 (Base de datos)         │
│   (localhost:5432)                      │
└─────────────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación

```
Cliente (React)            Backend (Laravel)
    │                            │
    ├─ POST /auth/login ────────>│
    │  (email, password)         │
    │                            ├─ Validar credenciales
    │                            ├─ Generar token Sanctum
    │                            │
    │<──── {token, user} ────────┤
    │                            │
    ├─ GET /api/presupuestos ──>│ (con header Authorization)
    │                            ├─ Verificar token
    │                            ├─ Autorizar usuario
    │                            ├─ Devolver datos
    │                            │
    │<──── {presupuestos} ──────┤
    │                            │
```

---

## 📁 Estructura de Carpetas - BACKEND

### `/app`
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php         # Login, registro, logout
│   │   ├── PresupuestoController.php  # CRUD presupuestos
│   │   ├── ReporteController.php      # Reportes
│   │   └── UsuarioController.php      # Gestión de usuarios
│   ├── Middleware/
│   │   ├── Authenticate.php
│   │   ├── VerifyApiToken.php
│   │   └── RateLimiter.php
│   └── Requests/
│       ├── LoginRequest.php           # Validación login
│       ├── PresupuestoRequest.php     # Validación presupuesto
│       └── UserRequest.php
├── Models/
│   ├── User.php
│   ├── Presupuesto.php
│   ├── Departamento.php
│   └── Reporte.php
├── Services/
│   ├── PresupuestoService.php         # Lógica de negocio
│   ├── ReporteService.php
│   └── AuthService.php
├── Exceptions/
│   ├── PresupuestoException.php
│   └── AuthenticationException.php
└── Traits/
    ├── HasPermissions.php
    └── ApiResponse.php
```

### `/routes`
```
routes/
└── api.php

// Estructura esperada:
- POST   /auth/login
- POST   /auth/logout
- GET    /auth/me
- GET    /presupuestos
- POST   /presupuestos
- GET    /presupuestos/{id}
- PUT    /presupuestos/{id}
- DELETE /presupuestos/{id}
- GET    /reportes
```

### `/database`
```
database/
├── migrations/
│   ├── 2024_01_01_create_users_table.php
│   ├── 2024_01_02_create_presupuestos_table.php
│   ├── 2024_01_03_create_departamentos_table.php
│   └── 2024_01_04_create_reportes_table.php
├── seeders/
│   ├── DatabaseSeeder.php
│   ├── UserSeeder.php
│   └── DepartamentoSeeder.php
└── factories/
    ├── UserFactory.php
    └── PresupuestoFactory.php
```

---

## 📁 Estructura de Carpetas - FRONTEND

### `/src/components`
```
components/
├── Layout/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── Footer.jsx
├── Auth/
│   ├── LoginForm.jsx
│   └── LogoutButton.jsx
├── Presupuesto/
│   ├── PresupuestoList.jsx
│   ├── PresupuestoForm.jsx
│   ├── PresupuestoTable.jsx
│   └── PresupuestoDetail.jsx
├── Dashboard/
│   └── Dashboard.jsx
└── Common/
    ├── Loading.jsx
    ├── ErrorAlert.jsx
    └── SuccessAlert.jsx
```

### `/src/pages`
```
pages/
├── HomePage.jsx
├── LoginPage.jsx
├── DashboardPage.jsx
├── PresupuestosPage.jsx
├── ReportesPage.jsx
└── NotFoundPage.jsx
```

### `/src/services`
```
services/
├── api.js                  # Cliente HTTP base con Axios
├── authService.js          # Operaciones de autenticación
├── presupuestoService.js   # CRUD presupuestos
└── reporteService.js       # Obtener reportes
```

### `/src/context`
```
context/
├── AuthContext.jsx         # Contexto de autenticación
├── PresupuestoContext.jsx  # Contexto de presupuestos
└── NotificationContext.jsx # Notificaciones
```

---

## 🔄 Ciclo de Vida - Login

1. **Frontend:** Usuario completa formulario de login
2. **Frontend:** `authService.login(email, password)`
3. **Backend:** POST `/api/auth/login` recibe credenciales
4. **Backend:** Valida email/password en tabla `users`
5. **Backend:** Genera token Sanctum con `createToken()`
6. **Backend:** Devuelve `{token, user}`
7. **Frontend:** Guarda token en localStorage
8. **Frontend:** Configura header `Authorization: Bearer {token}`
9. **Frontend:** Redirige a Dashboard

---

## 🛡️ Seguridad

### Backend
- ✅ Validación de inputs con `Requests`
- ✅ Autenticación con Sanctum
- ✅ CORS configurado
- ✅ Rate limiting en login
- ✅ Hashing de contraseñas con bcrypt
- ✅ Tokens con expiración

### Frontend
- ✅ Tokens en localStorage (+ httpOnly si es posible)
- ✅ Validación de formularios
- ✅ Manejo de errores seguro
- ✅ Logout limpia tokens

---

## 📡 Endpoints principales (v1)

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Datos del usuario actual

### Presupuestos CRUD
- `GET /api/presupuestos` - Listar
- `POST /api/presupuestos` - Crear
- `GET /api/presupuestos/{id}` - Detalles
- `PUT /api/presupuestos/{id}` - Actualizar
- `DELETE /api/presupuestos/{id}` - Eliminar

---

## 🧪 Testing

### Backend (PHPUnit)
```bash
php artisan test
```

### Frontend (Vitest)
```bash
npm run test
```

---

## 🚀 Deployment en VPS

1. Clonar repo en servidor
2. Configurar `.env` en backend
3. `composer install --no-dev`
4. `php artisan migrate --force`
5. Configurar Nginx/Apache
6. `npm run build` en frontend
7. Servir `frontend/dist/` con Nginx
8. Laravel API en puerto privado

---

## 🔧 Herramientas auxiliares

- **Postman/Insomnia:** Testing de API
- **DBeaver:** Gestión de PostgreSQL
- **DevTools React:** Debug de componentes
- **Network Tab:** Debugging de requests
