# Implementaciones Pendientes — Sistema de Control Presupuestario G51-58

Este documento describe las funcionalidades que se agregarán al sistema según las historias de usuario HU-08, HU-09, HU-14 y HU-15. **No se modifica nada existente; solo se añaden nuevos archivos y rutas.**

---

## HU-14 — Anulación de Liquidaciones (Soft Delete)

**Descripción:** En lugar de eliminar físicamente una liquidación, se cambia su estado a `'ANULADA'` y se registra el motivo. El registro queda en la base de datos para auditoría.

### Backend
| Archivo | Acción | Descripción |
|---|---|---|
| `backend/database/migrations/2026_05_14_000001_add_anulacion_to_liquidaciones_table.php` | NUEVO | Agrega columnas `motivo_anulacion` (nullable string 255) e `id_usuario_anulacion` (nullable FK a usuarios) a la tabla `liquidaciones` |
| `backend/app/Http/Controllers/LiquidacionController.php` | NUEVO método `anular()` | Cambia `estado = 'ANULADA'`, guarda `motivo_anulacion` e `id_usuario_anulacion` sin eliminar el registro |
| `backend/routes/api.php` | NUEVA ruta | `PATCH /api/liquidaciones/{id}/anular` dentro del grupo protegido |

### Frontend
| Archivo | Acción | Descripción |
|---|---|---|
| `frontend/src/pages/Liquidaciones.jsx` | NUEVO modal de anulación | Reemplaza el botón de eliminar por un modal que pide motivo de anulación; muestra liquidaciones anuladas con badge distinto |

---

## HU-08 — Gestión de Entidades Requirientes (CRUD Completo)

**Descripción:** Pantalla para crear, listar, editar y eliminar entidades requirientes (organismos que solicitan certificaciones presupuestarias).

### Backend
| Archivo | Acción | Descripción |
|---|---|---|
| `backend/app/Http/Controllers/EntidadRequirienteController.php` | NUEVO | CRUD completo: `index`, `store`, `show`, `update`, `destroy` |
| `backend/routes/api.php` | NUEVAS rutas | `GET/POST /api/entidades-requirientes` y `GET/PUT/DELETE /api/entidades-requirientes/{id}` dentro del grupo protegido |

### Frontend
| Archivo | Acción | Descripción |
|---|---|---|
| `frontend/src/pages/EntidadRequiriente.jsx` | NUEVO | Tabla con columnas: Nombre Entidad, Responsable, Correo, Memorando, Acciones (Editar / Eliminar). Modales para crear y editar. Confirmación para eliminar. |
| `frontend/src/App.jsx` | NUEVA ruta | `<Route path="entidad-requirente" element={<EntidadRequiriente />} />` dentro del dashboard |
| `frontend/src/pages/Dashboard.jsx` | NUEVO ítem en menú | "Entidad Requirente" con ícono `Building2`, apuntando a `/dashboard/entidad-requirente` |

---

## HU-09 — Consulta de Presupuesto Disponible

**Descripción:** Pantalla que muestra el saldo disponible por partida presupuestaria. Fórmula: `Saldo = Codificado (asignado/modificado) − Certificado (suma de certificacion_items.monto)`.

### Backend
| Archivo | Acción | Descripción |
|---|---|---|
| `backend/app/Http/Controllers/PresupuestoController.php` | NUEVO | Endpoint que consulta `items` con sus `certificacion_items`, calcula saldo y devuelve listado con alertas de saldo bajo |
| `backend/routes/api.php` | NUEVA ruta | `GET /api/presupuesto-disponible` (pública para el frontend) |

### Frontend
| Archivo | Acción | Descripción |
|---|---|---|
| `frontend/src/pages/PresupuestoDisponible.jsx` | NUEVO | Tarjetas de resumen (Total Ítems, Total Codificado, Total Certificado, Saldo Total). Tabla con filas coloreadas en rojo cuando saldo ≤ 0. Filtros por Programa/Actividad/Fuente. |
| `frontend/src/App.jsx` | NUEVA ruta | `<Route path="presupuesto-disponible" element={<PresupuestoDisponible />} />` |
| `frontend/src/pages/Dashboard.jsx` | NUEVO ítem en menú | "Presupuesto Disponible" con ícono `PieChart`, apuntando a `/dashboard/presupuesto-disponible` |

---

## HU-15 — Reportes PDF y CSV

**Descripción:** Pantalla de reportes que permite exportar datos del sistema en formato CSV y PDF (usando `window.print()` como el módulo de Certificación existente).

### Backend
| Archivo | Acción | Descripción |
|---|---|---|
| `backend/app/Http/Controllers/ReporteController.php` | NUEVO | Endpoints CSV: certificaciones (`/api/reportes/certificaciones/csv`), liquidaciones (`/api/reportes/liquidaciones/csv`), presupuesto disponible (`/api/reportes/presupuesto/csv`). Genera la respuesta con headers `Content-Type: text/csv`. |
| `backend/routes/api.php` | NUEVAS rutas | `GET /api/reportes/certificaciones/csv`, `GET /api/reportes/liquidaciones/csv`, `GET /api/reportes/presupuesto/csv` dentro del grupo protegido |

### Frontend
| Archivo | Acción | Descripción |
|---|---|---|
| `frontend/src/pages/Reportes.jsx` | NUEVO | Página con botones de descarga CSV y PDF para: Certificaciones, Liquidaciones y Presupuesto Disponible. PDF usa `window.print()` con estilos de impresión. |
| `frontend/src/App.jsx` | NUEVA ruta | `<Route path="reportes" element={<Reportes />} />` |
| `frontend/src/pages/Dashboard.jsx` | NUEVO ítem en menú | "Reportes" con ícono `FileDown`, apuntando a `/dashboard/reportes` |

---

## Orden de Implementación

1. HU-14 migration → HU-14 `anular()` en LiquidacionController → HU-14 ruta → HU-14 frontend
2. HU-08 EntidadRequirienteController → HU-08 rutas → HU-08 frontend
3. HU-09 PresupuestoController → HU-09 ruta → HU-09 frontend
4. HU-15 ReporteController → HU-15 rutas → HU-15 frontend

## Resumen de archivos nuevos

**Backend (4 nuevos archivos + 1 migración):**
- `migrations/2026_05_14_000001_add_anulacion_to_liquidaciones_table.php`
- `Controllers/EntidadRequirienteController.php`
- `Controllers/PresupuestoController.php`
- `Controllers/ReporteController.php`

**Frontend (4 nuevas páginas):**
- `pages/EntidadRequiriente.jsx`
- `pages/PresupuestoDisponible.jsx`
- `pages/Reportes.jsx`

**Modificaciones mínimas (solo AGREGAR líneas):**
- `routes/api.php` — agregar nuevas rutas
- `Controllers/LiquidacionController.php` — agregar método `anular()`
- `App.jsx` — agregar 3 rutas
- `Dashboard.jsx` — agregar 3 ítems al menú
- `pages/Liquidaciones.jsx` — agregar modal de anulación
