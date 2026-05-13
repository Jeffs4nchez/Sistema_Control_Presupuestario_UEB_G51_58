# 🚀 Guía Rápida de Inicio - Sistema de Control Presupuestario

## ⚡ Quick Start (5 minutos)

### 1️⃣ Terminal 1: Backend (Laravel)

```powershell
cd backend
php artisan serve
```

El backend estará disponible en: **http://localhost:8000**

### 2️⃣ Terminal 2: Frontend (Next.js)

```powershell
cd frontend
npm install  # Primera vez
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

## ✅ Credenciales de Prueba

Después de completar la instalación, puedes registrar una cuenta nueva o usar:

```
Email: test@example.com
Contraseña: password123
```

> **Nota**: Para crear este usuario de prueba, ejecuta:
> ```bash
> cd backend
> php artisan tinker
> User::create(['name'=>'Test','email'=>'test@example.com','password'=>bcrypt('password123')])
> ```

## 🔗 Flujo de Autenticación

```
Usuario
   ↓
1. Accede a http://localhost:3000
   ↓
2. Se redirige a /login (no autenticado)
   ↓
3. Ingresa credenciales
   ↓
4. Frontend envía POST a http://localhost:8000/api/login
   ↓
5. Backend valida y retorna token JWT
   ↓
6. Frontend guarda token en cookies
   ↓
7. Redirige a /dashboard
   ↓
8. Dashboard carga datos desde /api/me
```

## 📝 Estructura de Carpetas

```
proyecto/
├── backend/
│   ├── app/
│   │   └── Http/Controllers/AuthController.php  ← Rutas de auth
│   ├── routes/
│   │   └── api.php                             ← Rutas API
│   ├── config/
│   │   ├── cors.php                            ← CORS configurado
│   │   └── auth.php                            ← Configuración auth
│   ├── artisan
│   ├── composer.json
│   └── .env                                     ← Variables de entorno
│
└── frontend/
    ├── app/
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── layout.tsx                           ← AuthProvider aquí
    │   └── page.tsx
    ├── contexts/
    │   └── AuthContext.tsx                      ← Lógica de auth
    ├── components/
    │   ├── ProtectedRoute.tsx
    │   └── ui/                                  ← Componentes Radix UI
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── .env.local                               ← NEXT_PUBLIC_API_URL
```

## 🔐 Sistema de Autenticación

### Backend (Laravel + Sanctum)

- **POST /api/login** - Inicia sesión y obtiene token
- **POST /api/register** - Registra nuevo usuario
- **GET /api/me** - Obtiene datos del usuario actual
- **POST /api/logout** - Cierra sesión

### Frontend (Next.js + Context API)

- `useAuth()` - Hook para acceder al contexto
- `<ProtectedRoute>` - Componente para proteger rutas
- `localStorage` - Almacena token y datos del usuario
- `js-cookie` - Maneja cookies del navegador

## 🛠️ Configuración CORS

El CORS ya está configurado para desarrollo. En `backend/config/cors.php`:

```php
'allowed_origins' => [
    'localhost:3000',
    'localhost:5173',
    '127.0.0.1:3000',
    '127.0.0.1:5173'
],
'supports_credentials' => true,
```

## 📚 Variables de Entorno

### Backend (.env)

```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## ✨ Próximos Pasos

1. ✅ **Backend**: Rutas de autenticación
2. ✅ **Frontend**: Login, Register, Dashboard
3. ⬜ **Next**: Crear rutas de presupuestos
4. ⬜ **Next**: Crear sistema de reportes
5. ⬜ **Next**: Implementar roles y permisos
6. ⬜ **Next**: Auditoría de cambios

## 🐛 Troubleshooting

### Error: "Can't reach backend"
```bash
# Verificar que backend está corriendo
curl http://localhost:8000/api/hola-mundo

# Verificar CORS en backend
# cd backend && cat config/cors.php
```

### Error: "Token inválido"
```javascript
// Limpiar datos locales en consola
localStorage.clear()
document.cookie.split(";").forEach(c => document.cookie=c.replace(/^ +/, "").replace(/=.*/, "=;expires="+new Date().toUTCString()+";path=/"))
```

### Puerto ya en uso
```bash
# Frontend en puerto diferente
cd frontend && npm run dev -- -p 3001

# Backend en puerto diferente
cd backend && php artisan serve --port=8001
```

## 📞 Contacto

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**© 2026 UEB - Sistema de Control Presupuestario**
