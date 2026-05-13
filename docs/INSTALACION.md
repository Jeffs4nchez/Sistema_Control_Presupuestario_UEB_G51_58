# Guía de Instalación - Sistema de Control Presupuestario

## 1️⃣ Instalación del Backend (Laravel 11)

### Paso 1: Crear proyecto Laravel
```bash
cd backend
composer install
```

### Paso 2: Configurar el ambiente
```bash
cp .env.example .env
php artisan key:generate
```

### Paso 3: Configurar base de datos (PostgreSQL)
Edita `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=control_presupuestario
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

### Paso 4: Ejecutar migraciones
```bash
php artisan migrate
php artisan db:seed
```

### Paso 5: Generar clave de Sanctum
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Paso 6: Iniciar servidor
```bash
php artisan serve
```

✅ Backend en: `http://127.0.0.1:8000`

---

## 2️⃣ Instalación del Frontend (React 19)

### Paso 1: Instalar dependencias
```bash
cd frontend
npm install
```

### Paso 2: Configurar variables de entorno
Crear `.env.local`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Paso 3: Iniciar servidor de desarrollo
```bash
npm run dev
```

✅ Frontend en: `http://127.0.0.1:5173`

---

## 3️⃣ Estructura de Carpetas Backend

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # Controladores del API
│   │   ├── Middleware/       # Middlewares, autenticación
│   │   └── Requests/         # Validación de requests
│   ├── Models/               # Modelos Eloquent
│   ├── Services/             # Lógica de negocio
│   └── Exceptions/           # Excepciones personalizadas
├── routes/
│   └── api.php               # Rutas del API
├── database/
│   ├── migrations/           # Migraciones
│   ├── seeders/              # Seeders
│   └── factories/            # Factories para testing
├── tests/                    # Tests automatizados
├── config/                   # Configuración
└── storage/                  # Archivos temporales
```

---

## 4️⃣ Estructura de Carpetas Frontend

```
frontend/
├── src/
│   ├── components/           # Componentes React
│   ├── pages/                # Páginas/vistas
│   ├── services/             # Servicios HTTP (API)
│   ├── hooks/                # Custom hooks
│   ├── context/              # Context API
│   ├── utils/                # Utilidades
│   └── App.jsx               # App principal
├── public/                   # Assets estáticos
├── vite.config.js            # Config de Vite
└── package.json              # Dependencias
```

---

## 🔄 Flujo de Autenticación

1. **Login:** `POST /api/auth/login` → Recibe `token`
2. **Guardar:** Token en localStorage/sessionStorage
3. **Usar:** Enviar en header `Authorization: Bearer {token}`
4. **Logout:** `POST /api/auth/logout` → Borra sesión

---

## 🗄️ Base de Datos

### Conexión PostgreSQL
```bash
psql -U presupuestario -d control_presupuestario
```

### Crear base de datos (si no existe)
```sql
CREATE DATABASE control_presupuestario;
CREATE USER presupuestario WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE control_presupuestario TO presupuestario;
```

---

## ✅ Verificación

- [ ] Backend funciona: `php artisan serve`
- [ ] Frontend funciona: `npm run dev`
- [ ] PostgreSQL conecta
- [ ] Las rutas API responden
- [ ] Autenticación funciona

---

## ❓ Troubleshooting

### Error de conexión PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
psql --version
```

### Error de permiso en node_modules
```bash
npm install --legacy-peer-deps
```

### Error 419 Unknown Status (CSRF)
Verificar que `.env` tiene `APP_KEY` generada

---

¡Listo para desarrollar! 🚀
