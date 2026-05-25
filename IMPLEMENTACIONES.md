# Implementaciones — Sistema de Control Presupuestario G51-58

Estado actualizado al **2026-05-23**. Todas las historias de usuario han sido implementadas.

---

## HU-14 — Anulación de Liquidaciones (Soft Delete) ✅

**Descripción:** En lugar de eliminar físicamente una liquidación, se cambia su estado a `'ANULADA'` y se registra el motivo. El registro queda en la base de datos para auditoría.

### Backend
| Archivo | Estado | Descripción |
|---|---|---|
| `backend/database/migrations/2025_01_02_000018_create_liquidaciones_table.php` | Incluido en migración original | Columnas `motivo_anulacion` (nullable string 255) e `id_usuario_anulacion` (nullable FK a usuarios) ya presentes en la tabla `liquidaciones` |
| `backend/app/Http/Controllers/LiquidacionController.php` | Implementado | Método `anular()` en línea 173: cambia `estado = 'ANULADA'`, guarda `motivo_anulacion` e `id_usuario_anulacion` sin eliminar el registro |
| `backend/routes/api.php` | Implementado | `PATCH /api/liquidaciones/{id}/anular` dentro del grupo protegido (línea 98) |

### Frontend
| Archivo | Estado | Descripción |
|---|---|---|
| `frontend/src/pages/Liquidaciones.jsx` | Implementado | Modal de anulación con textarea para motivo, badge `ANULADA` en rojo, muestra motivo debajo del nombre. Botón de eliminar reemplazado por anulación. |

---

## HU-08 — Gestión de Entidades Requirientes (CRUD Completo) ✅

**Descripción:** Pantalla para crear, listar, editar y eliminar entidades requirientes (organismos que solicitan certificaciones presupuestarias).

### Backend
| Archivo | Estado | Descripción |
|---|---|---|
| `backend/app/Http/Controllers/EntidadRequirienteController.php` | Implementado | CRUD completo: `index`, `store`, `show`, `update`, `destroy` |
| `backend/routes/api.php` | Implementado | `GET/POST /api/entidades-requirientes` y `GET/PUT/DELETE /api/entidades-requirientes/{id}` dentro del grupo protegido (líneas 101–105) |

### Frontend
| Archivo | Estado | Descripción |
|---|---|---|
| `frontend/src/pages/EntidadRequiriente.jsx` | Implementado | Tabla con columnas: Nombre Entidad, Responsable, Correo, Memorando, Acciones (Editar / Eliminar). Modales para crear y editar. Confirmación para eliminar. |
| `frontend/src/App.jsx` | Implementado | `<Route path="entidad-requirente" element={<EntidadRequiriente />} />` dentro del dashboard |
| `frontend/src/pages/Dashboard.jsx` | Implementado | Ítem "Entidad Requirente" con ícono `Building2` apuntando a `/dashboard/entidad-requirente` |

---

## HU-09 — Consulta de Presupuesto Disponible ✅

**Descripción:** Pantalla que muestra el saldo disponible por partida presupuestaria. Fórmula: `Saldo = Codificado − Certificado`.

### Backend
| Archivo | Estado | Descripción |
|---|---|---|
| `backend/app/Http/Controllers/PresupuestoController.php` | Implementado | Endpoint que consulta `items` con sus `certificacion_items`, calcula saldo y devuelve listado con alertas de saldo bajo |
| `backend/routes/api.php` | Implementado | `GET /api/presupuesto-disponible` ruta pública (línea 122) |

### Frontend
| Archivo | Estado | Descripción |
|---|---|---|
| `frontend/src/pages/PresupuestoDisponible.jsx` | Implementado | Tarjetas de resumen (Total Ítems, Total Codificado, Total Certificado, Saldo Total). Tabla con filas coloreadas en rojo cuando saldo ≤ 0. Filtros por Programa/Actividad/Fuente. |
| `frontend/src/App.jsx` | Implementado | `<Route path="presupuesto-disponible" element={<PresupuestoDisponible />} />` |
| `frontend/src/pages/Dashboard.jsx` | Implementado | Ítem "Presupuesto Disponible" con ícono `PieChart` apuntando a `/dashboard/presupuesto-disponible` |

---

## HU-15 — Reportes PDF y CSV ✅

**Descripción:** Pantalla de reportes que permite exportar datos del sistema en formato CSV y PDF.

### Backend
| Archivo | Estado | Descripción |
|---|---|---|
| `backend/app/Http/Controllers/ReporteController.php` | Implementado | Endpoints CSV: `certificacionesCsv`, `liquidacionesCsv`, `presupuestoCsv`. Endpoints JSON adicionales: `certificacionesJson`, `liquidacionesJson`, `presupuestoJson`. |
| `backend/routes/api.php` | Implementado | `GET /api/reportes/certificaciones/csv`, `/liquidaciones/csv`, `/presupuesto/csv` y equivalentes JSON dentro del grupo protegido (líneas 108–118) |

### Frontend
| Archivo | Estado | Descripción |
|---|---|---|
| `frontend/src/pages/Reportes.jsx` | Implementado | Página con botones de descarga CSV y PDF para: Certificaciones, Liquidaciones y Presupuesto Disponible. |
| `frontend/src/pages/ReportePrint.jsx` | Implementado | Componente de impresión con estilos `window.print()`. |
| `frontend/src/App.jsx` | Implementado | `<Route path="reportes" element={<Reportes />} />` |
| `frontend/src/pages/Dashboard.jsx` | Implementado | Ítem "Reportes" con ícono `FileDown` apuntando a `/dashboard/reportes` |

---

## Resumen

| Historia | Descripción | Estado |
|---|---|---|
| HU-14 | Anulación de Liquidaciones | ✅ Completo |
| HU-08 | Gestión de Entidades Requirientes | ✅ Completo |
| HU-09 | Consulta de Presupuesto Disponible | ✅ Completo |
| HU-15 | Reportes PDF y CSV | ✅ Completo |
