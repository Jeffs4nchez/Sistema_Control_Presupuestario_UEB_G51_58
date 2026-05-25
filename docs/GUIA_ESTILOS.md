# Guía de Estilos Visual — Sistema de Control Presupuestario UEB

Stack: **React 19 + Vite + TailwindCSS + Framer Motion + Lucide Icons**

---

## 1. Identidad Visual

### Institución
- **UEB** — Universidad Estatal de Bolívar
- Sistema institucional de control presupuestario
- Tono: profesional, confiable, gubernamental

### Filosofía de diseño
- **Glassmorphism suave** sobre fondos sólidos oscuros (sidebar)
- **Tarjetas limpias** sobre fondo claro en el área de contenido
- **Animaciones fluidas** pero discretas (no distraen del trabajo)
- **Tipografía clara** para datos numéricos y tablas

---

## 2. Paleta de Colores

### Colores primarios UEB (definidos en `tailwind.config.js`)

```js
colors: {
  ueb: {
    navy:    '#1a3a5c',   // Azul marino — sidebar, encabezados principales
    blue:    '#2e6ca4',   // Azul institucional — botones primarios, links
    light:   '#54b3e0',   // Azul claro — acentos, iconos activos, glow
    red:     '#ff0000',   // Rojo — alertas críticas, eliminar
    'red-dk':'#8b0f0f',   // Rojo oscuro — hover de elementos destructivos
    bg:      '#f0f4f8',   // Fondo página — área de contenido principal
    white:   '#FFFFFF',   // Blanco — tarjetas, modales
  }
}
```

### Variables CSS globales

```css
:root {
  /* Fondos */
  --page-bg:          #f0f4f8;
  --card-bg:          #ffffff;
  --sidebar-bg:       linear-gradient(180deg, #0a1929 0%, #1a3a5c 100%);

  /* Texto */
  --text-heading:     #1a3a5c;
  --text-body:        #374151;
  --text-muted:       #6b7280;
  --text-on-dark:     #ffffff;
  --text-accent:      #54b3e0;

  /* Bordes */
  --border-card:      rgba(26, 58, 92, 0.08);
  --border-sidebar:   rgba(84, 179, 224, 0.10);

  /* Estados semánticos */
  --color-success:    #059669;
  --color-warning:    #d97706;
  --color-danger:     #dc2626;
  --color-info:       #2e6ca4;

  /* Fuente */
  --font-primary:     'Montserrat', system-ui, sans-serif;
}
```

### Uso de colores por contexto

| Contexto | Color |
|----------|-------|
| Botón primario (Guardar, Crear) | `#2e6ca4` ueb-blue |
| Botón peligroso (Eliminar, Anular) | `#8b0f0f` ueb-red-dk |
| Botón secundario (Cancelar) | Gris neutro `#6b7280` |
| Estado activo / seleccionado | `#54b3e0` ueb-light |
| Texto encabezados | `#1a3a5c` ueb-navy |
| Texto de tablas / body | `#374151` gray-700 |
| Texto auxiliar / etiquetas | `#6b7280` gray-500 |
| Badge ACTIVO / LIQUIDADA | bg `#d1fae5` · texto `#065f46` |
| Badge INACTIVO / ANULADA | bg `#fee2e2` · texto `#991b1b` |
| Badge EMITIDA | bg `#dbeafe` · texto `#1e40af` |

---

## 3. Tipografía

### Fuente principal
**Montserrat** (Google Fonts) — usada en todo el sistema.

```html
<!-- En index.html -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Escala tipográfica

| Uso | Tamaño | Peso |
|-----|--------|------|
| Título de página `h1` | `16–18px` | 700 |
| Subtítulo de sección | `14px` | 700 |
| Etiqueta de campo | `12px` | 600 |
| Valor en tabla | `13px` | 400–500 |
| Texto auxiliar / muted | `11–12px` | 400–500 |
| Badge / tag | `10–11px` | 700 |
| Número KPI grande | `28–36px` | 800 |
| Grupo en sidebar | `9.5px` | 700 |
| Item de sidebar | `12.5px` | 400–700 |

---

## 4. Componentes UI

### 4.1 Tarjeta base (Card)

```jsx
<div style={{
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid rgba(26,58,92,0.08)',
  boxShadow: '0 2px 12px rgba(26,58,92,0.06)',
  padding: '24px',
}}>
  {/* contenido */}
</div>
```

**Variante elevada** (modal, panel destacado):
```js
boxShadow: '0 8px 32px rgba(26,58,92,0.12)'
```

---

### 4.2 Botones

**Primario:**
```jsx
<button style={{
  background: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'var(--font-primary)',
  transition: 'all 0.18s ease',
}}>
  Guardar Certificación
</button>
```

**Peligroso (Eliminar / Anular):**
```jsx
<button style={{
  background: 'rgba(139,15,15,0.08)',
  color: '#8b0f0f',
  border: '1px solid rgba(139,15,15,0.20)',
  borderRadius: '10px',
  padding: '8px 16px',
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-primary)',
}}>
  Anular
</button>
```

**Secundario (Cancelar):**
```jsx
<button style={{
  background: 'rgba(107,114,128,0.08)',
  color: '#374151',
  border: '1px solid rgba(107,114,128,0.20)',
  borderRadius: '10px',
  padding: '8px 16px',
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-primary)',
}}>
  Cancelar
</button>
```

**Icono + texto (acción secundaria):**
```jsx
import { Download } from 'lucide-react';

<button style={{
  display: 'flex', alignItems: 'center', gap: '6px',
  background: 'rgba(46,108,164,0.08)',
  color: '#2e6ca4',
  border: '1px solid rgba(46,108,164,0.20)',
  borderRadius: '8px',
  padding: '7px 14px',
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer',
}}>
  <Download size={14} />
  Exportar CSV
</button>
```

---

### 4.3 Campos de formulario

```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
  <label style={{
    fontSize: '12px',
    fontWeight: 600,
    color: '#1a3a5c',
    letterSpacing: '0.01em',
  }}>
    Programa *
  </label>
  <select style={{
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(26,58,92,0.18)',
    background: '#fff',
    fontSize: '13px',
    color: '#374151',
    fontFamily: 'var(--font-primary)',
    outline: 'none',
    transition: 'border-color 0.18s',
  }}
    onFocus={(e) => e.target.style.borderColor = '#54b3e0'}
    onBlur={(e)  => e.target.style.borderColor = 'rgba(26,58,92,0.18)'}
  >
    <option value="">Seleccione...</option>
  </select>
</div>
```

**Input numérico (montos):**
```jsx
<input
  type="number"
  step="0.01"
  min="0"
  placeholder="0.00"
  style={{
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(26,58,92,0.18)',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1a3a5c',
    textAlign: 'right',
    fontFamily: 'var(--font-primary)',
    outline: 'none',
  }}
/>
```

---

### 4.4 Badges de estado

```jsx
const badgeStyles = {
  EMITIDA:   { bg: '#dbeafe', color: '#1e40af' },
  LIQUIDADA: { bg: '#d1fae5', color: '#065f46' },
  ANULADA:   { bg: '#f3f4f6', color: '#6b7280' },
  ACTIVO:    { bg: '#d1fae5', color: '#065f46' },
  INACTIVO:  { bg: '#fee2e2', color: '#991b1b' },
};

const Badge = ({ estado }) => {
  const s = badgeStyles[estado] ?? badgeStyles.ANULADA;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '10.5px',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {estado}
    </span>
  );
};
```

---

### 4.5 Tarjetas KPI (Inicio / Dashboard)

```jsx
const KpiCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(26,58,92,0.08)',
    boxShadow: '0 2px 12px rgba(26,58,92,0.06)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  }}>
    <div style={{
      width: '44px', height: '44px',
      borderRadius: '12px',
      background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: '#1a3a5c', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  </div>
);
```

---

### 4.6 Tabla de datos

```jsx
<div style={{ overflowX: 'auto' }}>
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
    <thead>
      <tr style={{ background: 'rgba(26,58,92,0.04)' }}>
        <th style={{
          padding: '10px 14px',
          textAlign: 'left',
          fontWeight: 700,
          color: '#1a3a5c',
          fontSize: '11px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          borderBottom: '2px solid rgba(26,58,92,0.08)',
          fontFamily: 'var(--font-primary)',
        }}>
          Nº Certificación
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr
          key={item.id}
          style={{
            borderBottom: '1px solid rgba(26,58,92,0.06)',
            background: i % 2 === 0 ? '#fff' : 'rgba(240,244,248,0.5)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(84,179,224,0.07)'}
          onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : 'rgba(240,244,248,0.5)'}
        >
          <td style={{ padding: '10px 14px', color: '#374151' }}>
            {item.numero}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### 4.7 Modal

```jsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,25,47,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />
      {/* Contenedor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          width: '480px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(26,58,92,0.25)',
          zIndex: 201,
          fontFamily: 'var(--font-primary)',
        }}
      >
        {/* Encabezado del modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a3a5c' }}>
            Título del modal
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={18} />
          </button>
        </div>
        {/* contenido */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

### 4.8 Mensajes de feedback

```jsx
// Éxito
<div style={{
  background: '#d1fae5', border: '1px solid #6ee7b7',
  color: '#065f46', borderRadius: '10px',
  padding: '12px 16px', fontSize: '13px', fontWeight: 500,
  display: 'flex', alignItems: 'center', gap: '8px',
}}>
  <CheckCircle2 size={16} />
  Certificación creada exitosamente.
</div>

// Error
<div style={{
  background: '#fee2e2', border: '1px solid #fca5a5',
  color: '#991b1b', borderRadius: '10px',
  padding: '12px 16px', fontSize: '13px', fontWeight: 500,
  display: 'flex', alignItems: 'center', gap: '8px',
}}>
  <AlertCircle size={16} />
  El monto supera el presupuesto disponible.
</div>

// Advertencia
<div style={{
  background: '#fef3c7', border: '1px solid #fcd34d',
  color: '#92400e', borderRadius: '10px',
  padding: '12px 16px', fontSize: '13px', fontWeight: 500,
  display: 'flex', alignItems: 'center', gap: '8px',
}}>
  <AlertCircle size={16} />
  Esta certificación ya tiene liquidaciones asociadas.
</div>
```

---

## 5. Iconografía

Usar exclusivamente **Lucide React** (ya instalado).

| Módulo / Acción | Icono |
|-----------------|-------|
| Inicio | `LayoutDashboard` |
| Usuarios | `Users` |
| Estructura Presupuestaria | `FileText` |
| Ver datos | `Table2` |
| Cédula Presupuestaria | `CheckCircle2` |
| Presupuesto Disponible | `PieChart` |
| Certificación | `TrendingUp` |
| Liquidaciones | `BarChart2` |
| Entidad Requirente | `Building2` |
| Reportes | `FileDown` |
| Auditoría | `Clock` |
| Cerrar sesión | `LogOut` |
| Cambiar contraseña | `KeyRound` |
| Crear / Agregar | `Plus` |
| Editar | `Pencil` |
| Eliminar / Anular | `Trash2` |
| Imprimir | `Printer` |
| Descargar | `Download` |
| Buscar | `Search` |
| Alerta / Error | `AlertCircle` |
| Éxito | `CheckCircle2` |
| Cerrar modal | `X` |
| Menú mobile | `Menu` |

**Tamaños estándar:**

| Contexto | Tamaño |
|----------|--------|
| Sidebar | `size={16}` |
| Botones | `size={14}` |
| Header / KPI | `size={20}` |
| Decorativo grande | `size={24}` |

---

## 6. Espaciado y Layout

### Estructura de una página estándar

```jsx
<div style={{ padding: '24px', maxWidth: '1400px' }}>

  {/* Encabezado de sección */}
  <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a3a5c', margin: 0 }}>
        Certificaciones
      </h2>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
        Gestión de certificaciones presupuestarias
      </p>
    </div>
    {/* Botón de acción principal */}
    <button>+ Nueva Certificación</button>
  </div>

  {/* Grid de KPIs */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  }}>
    {/* <KpiCard /> × 4 */}
  </div>

  {/* Tarjeta principal con tabla */}
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(26,58,92,0.08)',
    overflow: 'hidden',
  }}>
    {/* barra de filtros + tabla */}
  </div>

</div>
```

### Tokens de espaciado

| Nombre | Valor | Uso |
|--------|-------|-----|
| xs | `4px` | Entre elementos muy juntos |
| sm | `8px` | Entre icono y texto |
| md | `12–16px` | Entre campos de formulario |
| lg | `24px` | Entre secciones de página |
| xl | `32px` | Padding de tarjetas y modales |

### Tokens de borde redondeado

| Nombre | Valor | Uso |
|--------|-------|-----|
| sm | `8px` | Inputs, selects, botones pequeños |
| md | `10–12px` | Botones principales |
| lg | `16px` | Tarjetas |
| xl | `20px` | Modales |
| full | `9999px` | Badges, avatares, pills |

---

## 7. Animaciones (Framer Motion)

### Transición de página

```jsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>
```

### Lista con stagger (tarjetas aparecen en cascada)

```jsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.div key={i.id} variants={item}>...</motion.div>
  ))}
</motion.div>
```

### Hover / tap en botones

```jsx
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
```

### Modal (entrada + salida)

```jsx
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
transition={{ type: 'spring', stiffness: 300, damping: 28 }}
```

---

## 8. Patrones de UX

### Carga de datos
- Usar `<Skeleton />` mientras carga, nunca tabla vacía sin indicar estado.
- Spinner pequeño dentro de un select si está cargando opciones dependientes.

### Formularios en cascada (Certificación)
- Deshabilitar selectores hijos hasta que el padre tenga valor.
- Limpiar hijos cuando cambia el padre:
```js
const handleProgramaChange = (val) => {
  setPrograma(val);
  setSubprograma('');
  setProyecto('');
  setActividad('');
};
```

### Confirmación de acción destructiva
```
┌─────────────────────────────────────────┐
│  ¿Anular esta certificación?            │
│                                         │
│  Esta acción no se puede revertir.      │
│  La certificación quedará marcada como  │
│  ANULADA y liberará el monto reservado. │
│                                         │
│        [Cancelar]  [Anular]             │
└─────────────────────────────────────────┘
```
El botón de acción destructiva va siempre en rojo, a la derecha.

### Formato de montos
```js
const formatMonto = (value) =>
  `$ ${Number(value).toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
// Resultado: $ 12,450.00
```

### Mensajes de error de API
- Mostrar `error.response?.data?.message` si existe.
- Fallback: `"Error al procesar la solicitud. Intente nuevamente."`
- Nunca mostrar stack traces al usuario.

---

## 9. Responsive

| Breakpoint | Ancho | Comportamiento |
|-----------|-------|----------------|
| Mobile | < 768px | Sidebar oculto (drawer), 1 columna en grids |
| Tablet | 768–1024px | Sidebar colapsado (solo íconos), 2 columnas |
| Desktop | > 1024px | Sidebar expandido, grid completo (4 columnas KPI) |

```jsx
// Detección de mobile (patrón ya usado en Dashboard.jsx)
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handle = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handle);
  return () => window.removeEventListener('resize', handle);
}, []);
```

---

## 10. Checklist de consistencia visual

Antes de entregar cualquier pantalla nueva, verificar:

- [ ] Usa `font-family: var(--font-primary)` (Montserrat) en todos los textos
- [ ] Colores tomados de la paleta UEB, sin colores arbitrarios
- [ ] Botones con `border-radius` mínimo de `10px`
- [ ] Inputs cambian borde a `#54b3e0` en focus
- [ ] Filas de tabla con hover highlight
- [ ] Badges de estado con color correcto según valor
- [ ] Acciones destructivas protegidas con modal de confirmación
- [ ] Montos formateados con `$` y 2 decimales (`es-EC`)
- [ ] Mensajes de éxito en verde, errores en rojo, advertencias en amarillo
- [ ] Transición de entrada de página con Framer Motion
- [ ] Iconos de Lucide React en tamaño apropiado (14–20px)
- [ ] Sidebar activo refleja la ruta actual
- [ ] Layout responsive probado en mobile (< 768px)
