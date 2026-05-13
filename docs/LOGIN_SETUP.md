# Sistema de Login - Documentación

## ✅ Componentes Creados

### Backend (Laravel)

1. **AuthController** (`app/Http/Controllers/AuthController.php`)
   - `POST /api/login` - Iniciar sesión
   - `POST /api/register` - Registrarse
   - `POST /api/logout` - Cerrar sesión (requiere autenticación)
   - `GET /api/me` - Obtener usuario actual (requiere autenticación)

2. **Rutas API** (`routes/api.php`)
   - Rutas públicas: login y register
   - Rutas protegidas: logout y me

### Frontend (React)

1. **Componentes de Páginas**
   - `src/pages/Login.jsx` - Página de inicio de sesión
   - `src/pages/Register.jsx` - Página de registro
   - `src/pages/Dashboard.jsx` - Panel de control (ruta protegida)

2. **Componentes Auxiliares**
   - `src/components/ProtectedRoute.jsx` - Protección de rutas autenticadas

3. **Estilos**
   - `src/styles/Login.css`
   - `src/styles/Register.css`
   - `src/styles/Dashboard.css`

## 🚀 Instalación

### Backend

1. Asegúrate de que Sanctum esté instalado (debe venir por defecto en Laravel 11):

```bash
cd backend
php artisan sanctum:install
```

2. Ejecuta las migraciones:

```bash
php artisan migrate
```

3. Inicia el servidor:

```bash
php artisan serve
```

### Frontend

1. Instala las dependencias:

```bash
cd frontend
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## 🔐 Pruebas

### 1. Crear un usuario de prueba

Puedes hacerlo a través de la API:

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

O crear uno desde la shell de Tinker:

```bash
php artisan tinker
User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => Hash::make('password123')
])
```

### 2. Probar el login

Accede a `http://localhost:5173` (frontend) y prueba con las credenciales:
- Email: juan@example.com
- Contraseña: password123

## 📋 Flujo de Autenticación

1. Usuario ingresa email y contraseña en el formulario de login
2. Frontend envía POST a `/api/login`
3. Backend valida credenciales y retorna token si son válidas
4. Frontend guarda el token en localStorage
5. Todas las solicitudes posteriores incluyen el token en el header `Authorization: Bearer {token}`
6. Si el usuario no está autenticado, se redirige a `/login`

## 🔑 Tokens

- Los tokens se almacenan en `localStorage` bajo la clave `auth_token`
- El usuario también se guarda en `localStorage` bajo la clave `user`
- Los tokens expiran según la configuración de Sanctum
- Al cerrar sesión, el token se invalida en el servidor

## ⚙️ Variables de Entorno Necesarias

En `backend/.env`:

```env
APP_NAME="Control Presupuestario"
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sistema_presupuestario
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

## 🐛 Posibles Errores

### Error CORS

Si obtienes errores de CORS, asegúrate de tener el middleware CORS correctamente configurado en `config/cors.php`.

### Token no reconocido

Si el token no se reconoce, verifica:
- Que el token se envíe en el header correcto: `Authorization: Bearer {token}`
- Que Sanctum esté instalado: `php artisan sanctum:install`
- Que hayas ejecutado las migraciones: `php artisan migrate`

## 📝 Próximos Pasos

- [ ] Implementar recuperación de contraseña
- [ ] Agregar validación de email
- [ ] Implementar roles y permisos
- [ ] Agregar autenticación de dos factores (2FA)
- [ ] Crear API para gestión de entidades presupuestarias
