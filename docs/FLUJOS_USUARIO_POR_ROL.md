# Flujos de Usuario por Rol — Sistema de Control Presupuestario UEB

## 1. Definición de Roles

El sistema maneja **4 roles** diferenciados por el campo `cargo` del usuario. Cada rol determina qué módulos puede ver y qué acciones puede ejecutar.

| Rol | Cargo en BD | Descripción |
|-----|-------------|-------------|
| **Administrador** | `Administrador` | Gestión total del sistema y usuarios |
| **Director Financiero** | `Director Financiero` | Supervisión, aprobaciones y reportes ejecutivos |
| **Analista Presupuestario** | `Analista Presupuestario` | Operaciones presupuestarias (certificar, liquidar) |
| **Auditor** | `Auditor` | Consulta de registros y auditoría, solo lectura |

---

## 2. Matriz de Acceso por Módulo

| Módulo | Administrador | Director Financiero | Analista | Auditor |
|--------|:---:|:---:|:---:|:---:|
| Inicio / Dashboard | ✅ | ✅ | ✅ | ✅ |
| Estructura Presupuestaria (carga) | ✅ | ✅ | ✅ | ❌ |
| Estructura Presupuestaria (ver) | ✅ | ✅ | ✅ | ✅ |
| Cédula Presupuestaria | ✅ | ✅ | ✅ | ✅ |
| Presupuesto Disponible | ✅ | ✅ | ✅ | ✅ |
| Certificación (crear/editar) | ✅ | ✅ | ✅ | ❌ |
| Certificación (ver/imprimir) | ✅ | ✅ | ✅ | ✅ |
| Liquidaciones (crear/anular) | ✅ | ✅ | ✅ | ❌ |
| Liquidaciones (ver) | ✅ | ✅ | ✅ | ✅ |
| Entidad Requirente (CRUD) | ✅ | ✅ | ✅ | ❌ |
| Reportes (exportar CSV/PDF) | ✅ | ✅ | ✅ | ✅ |
| Auditoría | ✅ | ✅ | ❌ | ✅ |
| Gestión de Usuarios | ✅ | ❌ | ❌ | ❌ |

---

## 3. Flujos Detallados por Rol

---

### ROL 1: Administrador

**Responsabilidad:** Gestionar usuarios, configurar el sistema y mantener el control total.

#### Flujo Principal — Gestión de Usuarios

```
[Login]
    │
    ▼
[Dashboard / Inicio]
    │
    ├── [Gestión de Usuarios]
    │       │
    │       ├── Ver listado de usuarios activos/inactivos
    │       ├── [Crear usuario]
    │       │       │── Ingresar: nombres, apellidos, correo institucional, cargo
    │       │       │── El sistema genera contraseña temporal
    │       │       └── Usuario creado → correo de bienvenida enviado
    │       │
    │       ├── [Editar usuario]
    │       │       └── Modificar datos excepto contraseña
    │       │
    │       └── [Desactivar usuario]
    │               └── Cambiar estado a INACTIVO (no eliminar)
    │
    └── [Acceso a todos los demás módulos]
```

#### Flujo Secundario — Primer Ingreso al Sistema

```
[Recibe correo con credenciales temporales]
    │
    ▼
[Login con contraseña temporal]
    │
    ▼
[Sistema detecta contrasena_temporal = true]
    │
    ▼
[Modal obligatorio: "Debe cambiar su contraseña"]
    │
    ▼
[Ingresa nueva contraseña + confirmación]
    │
    ▼
[Dashboard habilitado completamente]
```

---

### ROL 2: Director Financiero

**Responsabilidad:** Supervisar operaciones, revisar certificaciones, consultar reportes ejecutivos.

#### Flujo Principal — Supervisión Diaria

```
[Login]
    │
    ▼
[Dashboard / Inicio]
    │   (Ve KPIs: total certificado, liquidado, presupuesto disponible)
    │
    ├── [Presupuesto Disponible]
    │       └── Consultar saldo por programa/actividad/fuente
    │
    ├── [Certificación]
    │       ├── Ver lista de certificaciones (todas)
    │       ├── Filtrar por fecha / estado / entidad
    │       ├── Ver detalle de certificación
    │       └── Imprimir / exportar certificación
    │
    ├── [Liquidaciones]
    │       ├── Ver lista de liquidaciones
    │       └── Ver detalle y estado
    │
    ├── [Reportes]
    │       ├── Exportar reporte de certificaciones (CSV)
    │       ├── Exportar reporte de liquidaciones (CSV)
    │       └── Exportar reporte de presupuesto (CSV)
    │
    └── [Auditoría]
            └── Revisar historial de cambios por certificación
```

#### Flujo — Revisión de Certificación Específica

```
[Lista de Certificaciones]
    │
    ▼
[Seleccionar certificación]
    │
    ▼
[Ver detalle: monto, items, entidad requirente, estado]
    │
    ├── [Imprimir certificación] → PDF listo para firma
    └── [Revisar auditoría] → Ver quién y cuándo la creó/modificó
```

---

### ROL 3: Analista Presupuestario

**Responsabilidad:** Ejecutar las operaciones presupuestarias: cargar estructura, crear certificaciones, registrar liquidaciones.

#### Flujo Principal — Ciclo Completo de Certificación

```
[Login]
    │
    ▼
[Verificar presupuesto disponible]
    │   (¿Hay saldo suficiente para la operación?)
    │
    ▼
[Certificación → Crear nueva]
    │
    ├── Paso 1: Seleccionar Programa
    │       └── (desplegable en cascada)
    ├── Paso 2: Seleccionar Subprograma
    ├── Paso 3: Seleccionar Proyecto
    ├── Paso 4: Seleccionar Actividad
    ├── Paso 5: Seleccionar Fuente de Financiamiento
    ├── Paso 6: Seleccionar Ubicación Geográfica
    ├── Paso 7: Seleccionar Item(s) y monto
    │       └── Sistema valida monto disponible en tiempo real
    ├── Paso 8: Seleccionar Entidad Requirente
    │       └── (o crear nueva entidad si no existe)
    ├── Paso 9: Ingresar datos adicionales
    │       └── (organismo, naturaleza de prestación, observaciones)
    │
    ▼
[Sistema valida: monto ≤ presupuesto disponible]
    │
    ├── ✅ VÁLIDO → Certificación guardada → Nº de certificación asignado
    └── ❌ INVÁLIDO → Alerta: "Monto supera saldo disponible"
```

#### Flujo — Registro de Liquidación

```
[Liquidaciones → Crear nueva]
    │
    ├── Seleccionar certificación base
    ├── Seleccionar item(s) de la certificación
    ├── Ingresar monto a liquidar
    │       └── Sistema valida monto ≤ monto certificado
    │
    ▼
[Liquidación registrada]
    │
    └── Opción: Anular liquidación (si fue un error)
            └── Requiere confirmación: "¿Está seguro de anular?"
```

#### Flujo — Carga de Datos Presupuestarios

```
[Estructura Presupuestaria]
    │
    ├── Cargar archivo Excel/CSV de estructura
    │       └── Sistema procesa y normaliza datos
    ├── Ver datos cargados en tabla interactiva
    └── (Si hay error) → Mensaje de error específico por fila

[Cédula Presupuestaria]
    │
    ├── Cargar archivo de cédula
    └── Ver resumen de partidas presupuestarias
```

---

### ROL 4: Auditor

**Responsabilidad:** Revisar registros, consultar historial de operaciones, generar reportes de control.

#### Flujo Principal — Auditoría de Operaciones

```
[Login]
    │
    ▼
[Dashboard / Inicio]
    │   (Vista de solo lectura: KPIs y estadísticas)
    │
    ├── [Auditoría]
    │       ├── Ver log completo de eventos del sistema
    │       ├── Filtrar por: fecha, usuario, tipo de acción
    │       ├── Ver historial de cambios por certificación específica
    │       └── (Solo lectura, no puede modificar nada)
    │
    ├── [Certificación] → Solo ver / imprimir
    ├── [Liquidaciones] → Solo ver
    ├── [Presupuesto Disponible] → Solo consultar
    ├── [Cédula Presupuestaria] → Solo ver
    └── [Reportes] → Exportar para análisis externo
```

---

## 4. Flujos Comunes (Todos los Roles)

### Flujo — Recuperación de Contraseña

```
[Pantalla Login]
    │
    ▼
["¿Olvidó su contraseña?"]
    │
    ▼
[Ingresar correo institucional]
    │
    ▼
[Sistema envía email con enlace de recuperación]
    │
    ▼
[Clic en enlace → Pantalla restablecer contraseña]
    │
    ▼
[Ingresar nueva contraseña + confirmación]
    │
    ▼
[Contraseña actualizada → Redirigir al Login]
```

### Flujo — Cambio de Contraseña (desde perfil)

```
[Avatar de usuario en sidebar o header]
    │
    ▼
[Modal: Cambiar contraseña]
    │
    ├── Ingresar contraseña actual
    ├── Ingresar nueva contraseña
    └── Confirmar nueva contraseña
            │
            ▼
        [Contraseña actualizada exitosamente]
```

---

## 5. Estados de Certificación

```
BORRADOR → EMITIDA → LIQUIDADA (parcial o total)
                   → ANULADA
```

| Estado | Descripción | Quién puede cambiarla |
|--------|-------------|----------------------|
| `EMITIDA` | Certificación registrada y válida | Analista, Director |
| `LIQUIDADA` | Se ha registrado liquidación sobre ella | Sistema automático |
| `ANULADA` | Cancelada (no elimina, marca como inválida) | Analista, Director |

---

## 6. Validaciones de Negocio Críticas

1. **Monto certificado ≤ Presupuesto disponible** por item/fuente/actividad
2. **Monto liquidado ≤ Monto certificado** en la certificación referenciada
3. **No eliminar**, solo desactivar usuarios (estado: INACTIVO)
4. **Token de sesión** expira según configuración de Sanctum
5. **Contraseña temporal** obliga cambio en primer ingreso
6. **Auditoría automática** registra toda operación de creación, edición y anulación
