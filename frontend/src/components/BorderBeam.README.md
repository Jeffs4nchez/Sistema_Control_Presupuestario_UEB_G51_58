# BorderBeam - Componente Reutilizable

Un componente animado profesional que dibuja un borde luminoso que fluye alrededor de cualquier elemento rectangular con esquinas redondeadas.

## Características

✨ **Completamente reutilizable** - Funciona con cualquier contenedor
🎨 **Totalmente personalizable** - Colores, velocidad, tamaño, grosor
⚡ **Altamente optimizado** - Usa CSS animations y offset-path
🎯 **Efectos avanzados** - Soporte para múltiples beams con delay (efecto chase)
🔧 **Sin dependencias externas** - Solo React y CSS puro

## Propiedades

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `size` | number | 200 | Ancho del beam (tamaño del gradiente en px) |
| `duration` | number | 15 | Duración de una vuelta completa en segundos |
| `borderWidth` | number | 1.5 | Grosor del borde en px |
| `colorFrom` | string | var(--color-primary) | Color inicial del gradiente |
| `colorTo` | string | var(--color-secondary) | Color final del gradiente |
| `delay` | number | 0 | Retraso antes de iniciar (segundos) |
| `anchor` | number | 90 | Punto de anclaje del beam (0-100%) |
| `className` | string | '' | Clases CSS adicionales |

## Requisitos del Contenedor

El contenedor padre **DEBE** cumplir estas reglas:

```jsx
<div style={{
  position: 'relative',      // ✅ Requerido
  overflow: 'hidden',         // ✅ Requerido
  borderRadius: '1rem',       // ✅ Puede ser cualquier valor
}}>
  <BorderBeam />
  {/* Tu contenido aquí */}
</div>
```

## Uso Básico

```jsx
import { BorderBeam } from '@/components/BorderBeam';

function MiCard() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '28rem',
      background: 'var(--gradient-bg-blur)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      <BorderBeam 
        size={250}
        duration={12}
        colorFrom="var(--color-primary)"
        colorTo="var(--color-secondary)"
        borderWidth={2}
      />
      <h2>Mi Contenido</h2>
    </div>
  );
}
```

## Ejemplos Avanzados

### Efecto "Chase" - Múltiples Beams

```jsx
<div style={{ position: 'relative', overflow: 'hidden', borderRadius: '1rem' }}>
  {/* Primer beam - comienza inmediatamente */}
  <BorderBeam 
    size={200}
    duration={10}
    delay={0}
  />
  
  {/* Segundo beam - comienza 5s después */}
  <BorderBeam 
    size={200}
    duration={10}
    delay={5}
  />
</div>
```

### Animación Lenta y Elegante

```jsx
<BorderBeam 
  size={150}
  duration={20}      // Muy lento
  colorFrom="#ffd700" // Dorado
  colorTo="#ffa500"   // Naranja
  borderWidth={1}
/>
```

### Animación Rápida y Energética

```jsx
<BorderBeam 
  size={300}
  duration={5}        // Muy rápido
  colorFrom="#ff1744" // Rojo vivo
  colorTo="#ff6f00"   // Naranja vivo
  borderWidth={2.5}
/>
```

## Cómo Funciona la Magia

### 1. `offset-path: rect(...round...)`
Define un camino rectangular que sigue los bordes redondeados del contenedor.

### 2. `offset-distance: 100%`
La animación CSS mueve el beam a lo largo de este camino.

### 3. `mask` y `border`
Crea el efecto de "borde luminoso" sin necesidad de degradar el rendimiento.

### 4. `border-radius: inherit`
El beam hereda automáticamente las esquinas redondeadas del padre.

## Variables CSS Globales

El componente usa estas variables que se pueden personalizar en `index.css`:

```css
:root {
  --color-primary: #b71c1c;
  --color-secondary: #506690;
  --radius-lg: 1rem;
  --transition-normal: 0.3s;
}
```

## Compatibilidad

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 15+
✅ Edge 90+

Los navegadores más antiguos simplemente no mostrarán la animación, pero el contenido seguirá siendo visible.

## Tips de Rendimiento

- Usa `delay` para evitar múltiples beams animándose simultáneamente
- Aumenta `duration` para animaciones más suaves y menos demandantes
- Usa `borderWidth` de 1-2px para mejor rendimiento visual
- Los beams no usan JavaScript: son puras CSS animations

## Archivos Relacionados

- `src/components/BorderBeam.jsx` - Componente principal
- `src/components/BorderBeam.examples.jsx` - Ejemplos de uso
- `src/utils/cn.js` - Utilidad para mezclar clases
- `src/index.css` - Variables CSS globales
