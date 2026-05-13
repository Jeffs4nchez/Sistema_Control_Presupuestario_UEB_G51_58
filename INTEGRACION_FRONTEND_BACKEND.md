# 🔐 Guía de Integración Frontend-Backend

## Status: ✅ Listo para Pruebas

El frontend ahora está completamente integrado con el backend. Todo lo que necesitas es ejecutar las migraciones.

---

## 📋 Pasos para Activar

### 1. Ejecutar Migraciones (IMPORTANTE ⚠️)

En la carpeta del backend, ejecuta:

```bash
cd backend
php artisan migrate
```

Esto agregará la columna `api_token` a la tabla `usuarios` para guardar y validar tokens.

### 2. Verificar que el Backend está corriendo

```bash
php artisan serve --port=8000
```

Deberías ver:
```
INFO  Server running on [http://127.0.0.1:8000]
```

### 3. Verificar que el Frontend está corriendo

```bash
cd frontend
npm run dev
# o
pnpm dev
```

Deberías ver:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

### 4. Revisar que la BD está conectada

Verifica en el archivo `.env` del backend que los datos de conexión son correctos:

```bash
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=control_presupuestario
DB_USERNAME=presupuestario
DB_PASSWORD=secret
```

---

## 🧪 Probar el Login

### Credenciales de Prueba

El backend ya tiene un usuario de prueba en el seeder:

- **Email**: `test@example.com`
- **Contraseña**: `password123`

### Pasos para Probar

1. Abre el navegador: `http://localhost:5173/login`
2. Ingresa:
   - Email: `test@example.com`
   - Contraseña: `password123`
3. Haz clic en "Acceder"

### Qué Debería Pasar

✅ Si las credenciales son correctas → Te redirige a `/dashboard`  
❌ Si hay error → Verás el mensaje de error abajo del formulario

---

## 🔍 Debugging

### Ver logs del backend

```bash
tail -f backend/storage/logs/laravel.log
```

### Ver respuesta del API

Abre la consola del navegador (F12) y ve Network:
- Busca POST `/api/login`
- Verifica que la respuesta sea status 200 con el token

### Errores Comunes

| Error | Solución |
|-------|----------|
| `Usuario no encontrado` | El seeder no corrió. Ejecuta: `php artisan db:seed` |
| `Contraseña incorrecta` | La contraseña es sensible a mayúsculas/minúsculas |
| `CORS error` | El backend CORS está mal configurado. Verifica `config/cors.php` |
| `Cannot GET /api/login` | El backend no está corriendo. Ejecuta: `php artisan serve` |

---

## 📁 Archivos Actualizados

✅ **Frontend**:
- `frontend/.env.local` - Configuración de URL del API
- `frontend/src/pages/Login.jsx` - Limpiado para usar tema
- `frontend/src/config/theme.js` - Sistema de temas ya existía

✅ **Backend**:
- `backend/app/Http/Controllers/AuthController.php` - Mejorado para guardar/validar tokens
- `backend/database/migrations/2025_05_07_000001_add_api_token_to_usuarios_table.php` - Nueva migración

---

## 🚀 Flujo de Login

```
1. Usuario ingresa email + contraseña
   ↓
2. Frontend POST /api/login
   ↓
3. Backend valida credenciales
   ↓
4. Backend genera token y lo guarda en BD
   ↓
5. Backend retorna token al frontend
   ↓
6. Frontend guarda token en cookie
   ↓
7. Frontend hace GET /api/me con token
   ↓
8. Backend valida token y retorna usuario
   ↓
9. Frontend redirige a /dashboard
```

---

## 📝 Notas Importantes

- El `.env.local` ya está creado con `VITE_API_URL=http://localhost:8000/api`
- El AuthContext ya maneja cookies con expiración de 7 días
- Los tokens se guardan en la BD para validación
- Todos los errores se muestran en el formulario

---

## ✨ Próximos Pasos (Opcionales)

- Implementar refresh tokens
- Agregar validación más robusta en backend
- Crear middleware de autenticación en rutas protegidas
- Implementar logout

---

**¿Dudas?** Revisa los logs del backend o la consola del navegador (F12).
