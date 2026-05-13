# Guía Rápida de Desarrollo

## 🚀 Inicio Rápido (Primera vez)

### Terminal 1 - Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Terminal 3 - PostgreSQL
Si usas Docker:
```bash
docker run -d \
  --name presupuestario_db \
  -e POSTGRES_DB=control_presupuestario \
  -e POSTGRES_USER=presupuestario \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  postgres:15-alpine
```

---

## 📋 URLs después de iniciar

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Aplicación React |
| Backend API | http://localhost:8000 | API Laravel |
| PostgreSQL | localhost:5432 | Base de datos |

---

## 🔑 Usuario de prueba (después de seed)

```
Email: admin@test.com
Password: password
```

---

## 📝 Crear un nuevo feature (Backend)

### 1. Crear Migración
```bash
php artisan make:migration create_presupuestos_table
```

### 2. Crear Modelo
```bash
php artisan make:model Presupuesto -m
```

### 3. Crear Controlador
```bash
php artisan make:controller Api/PresupuestoController --api
```

### 4. Crear Request (validación)
```bash
php artisan make:request PresupuestoRequest
```

### 5. Registrar ruta en `routes/api.php`
```php
Route::apiResource('presupuestos', PresupuestoController::class);
```

---

## 📝 Crear un nuevo componente (Frontend)

### Estructura recomendada
```
src/components/MiComponente/
├── MiComponente.jsx        # Componente principal
├── MiComponente.module.css  # Estilos
└── useMiComponente.js       # Hook personalizado (if needed)
```

### Template:
```jsx
// src/components/MiComponente/MiComponente.jsx
export function MiComponente() {
  return (
    <div className="mi-componente">
      <h1>Mi Componente</h1>
    </div>
  )
}
```

---

## 🧪 Testing

### Backend
```bash
php artisan test
# o con coverage
php artisan test --coverage
```

### Frontend
```bash
npm run test
npm run test -- --coverage
```

---

## 🐛 Debugging

### Backend
1. Agregar `dd()` o `dump()` para debug
2. Ver logs en `storage/logs/laravel.log`

### Frontend
1. Abrir DevTools (F12)
2. Network tab para ver requests
3. Console para errores
4. React DevTools extension

---

## 🔄 Git Workflow

```bash
# Crear rama para nuevas features
git checkout -b feature/nombre-feature

# Después de cambios
git add .
git commit -m "feat: descripción corta"
git push origin feature/nombre-feature

# En GitHub: Abrir Pull Request
```

---

## 📚 Estructura de commits

```
feat: Nueva característica
fix: Corrección de bug
docs: Documentación
style: Formato de código
refactor: Refactorización
test: Nuevas pruebas
chore: Tasks de configuración
```

---

## ⚡ Atajos útiles

### Backend (Artisan)
```bash
php artisan tinker          # REPL de Laravel
php artisan route:list      # Ver todas las rutas
php artisan make:seeder     # Crear seeder
php artisan storage:link    # Link storage → public
```

### Frontend (npm)
```bash
npm run dev                 # Desarrollo
npm run build              # Producción
npm run preview            # Preview del build
```

---

¡Listo para desarrollar! 🎉
