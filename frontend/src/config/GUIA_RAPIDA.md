# 🚀 GUÍA RÁPIDA - Empezar a Usar el Tema

## ⚡ 5 Minutos para Entender el Sistema

### Paso 1: Importa el Tema
```jsx
import { theme } from '../config/theme';
```

### Paso 2: Usa los Colores
```jsx
<div style={{ 
  background: theme.colors.primary,        // Azul UEB
  color: theme.colors.secondary,           // Blanco
  padding: theme.spacing.lg                // 24px
}}>
  Contenido
</div>
```

### Paso 3: Repite en Todo
```jsx
// Botón
<button style={{
  background: theme.colors.primary,
  color: theme.colors.secondary,
  padding: theme.components.button.padding.md,
  borderRadius: theme.border.radiusSmall,
  fontFamily: theme.typography.fontFamily
}}>
  Click
</button>

// Card
<div style={{
  background: theme.colors.secondary,
  padding: theme.spacing.lg,
  borderRadius: theme.border.radiusMd,
  boxShadow: theme.shadow.md
}}>
  Tarjeta
</div>
```

---

## 🎯 Hoja de Trucos

### Colores Más Usados
```javascript
theme.colors.primary           // #003358 Azul (principal)
theme.colors.secondary         // #ffffff Blanco (texto)
theme.colors.state.success     // Verde
theme.colors.state.error       // Rojo
theme.colors.state.warning     // Amarillo
theme.colors.state.info        // Azul claro
theme.colors.text.primary      // Texto principal
theme.colors.gray['300']       // Gris claro (bordes)
```

### Espaciados Rápidos
```javascript
theme.spacing.sm    // 8px   (pequeño)
theme.spacing.md    // 16px  (normal)
theme.spacing.lg    // 24px  (grande)
theme.spacing.xl    // 32px  (muy grande)
```

### Tamaños de Texto
```javascript
theme.typography.fontSize.sm      // 13px (labels)
theme.typography.fontSize.base    // 15px (body)
theme.typography.fontSize.lg      // 16px (subtitle)
theme.typography.fontSize['2xl']  // 20px (título)
```

### Bordes y Sombras
```javascript
theme.border.radiusSmall    // 4px   (inputs)
theme.border.radiusMd       // 8px   (cards)
theme.border.radiusLg       // 16px  (modales)

theme.shadow.sm             // Sombra pequeña
theme.shadow.md             // Sombra normal
theme.shadow.lg             // Sombra grande
```

---

## 🧩 Componentes Reutilizables (LO MEJOR)

En lugar de hacer estilos inline, usa los componentes:

```jsx
import { Button, Input, Card, Alert, Badge } from '../components/ThemeComponents';

// ✅ MÁS FÁCIL Y CONSISTENTE

<Button variant="primary">Guardar</Button>

<Input 
  label="Email"
  error="El email es requerido"
/>

<Card title="Mi Card">
  Contenido aquí
</Card>

<Alert type="success" title="¡Listo!">
  Se guardó correctamente
</Alert>

<Badge variant="success">Activo</Badge>
```

---

## 📋 Checklist de Aplicación

Cuando apliques el tema a un componente:

- [ ] Importar theme: `import { theme } from '../config/theme';`
- [ ] Cambiar `background` a `theme.colors.*`
- [ ] Cambiar `color` a `theme.colors.text.*`
- [ ] Cambiar `padding` a `theme.spacing.*`
- [ ] Cambiar `borderRadius` a `theme.border.*`
- [ ] Cambiar `boxShadow` a `theme.shadow.*`
- [ ] Cambiar `fontSize` a `theme.typography.fontSize.*`
- [ ] Cambiar `fontWeight` a `theme.typography.fontWeight.*`
- [ ] Agregar `fontFamily: theme.typography.fontFamily`
- [ ] Testear en desktop y mobile
- [ ] Verificar que la funcionalidad sigue igual

---

## 🎨 Ejemplos Rápidos

### Botón Principal
```jsx
<button style={{
  background: theme.colors.primary,
  color: theme.colors.secondary,
  padding: theme.components.button.padding.md,
  borderRadius: theme.border.radiusSmall,
  border: 'none',
  cursor: 'pointer',
  fontFamily: theme.typography.fontFamily
}}>
  Acceder
</button>
```

### Tarjeta Éxito
```jsx
<div style={{
  background: theme.colors.success.light,
  border: `2px solid ${theme.colors.state.success}`,
  borderRadius: theme.border.radiusMd,
  padding: theme.spacing.lg
}}>
  ✓ Éxito
</div>
```

### Alerta Error
```jsx
<div style={{
  background: theme.colors.error.light,
  border: `2px solid ${theme.colors.state.error}`,
  borderRadius: theme.border.radiusSmall,
  padding: theme.spacing.md,
  color: theme.colors.error.text
}}>
  ❌ Error al procesar
</div>
```

### Input Validado
```jsx
<input style={{
  background: theme.colors.input.background,
  border: `2px solid ${fieldError ? theme.colors.state.error : theme.colors.input.border}`,
  borderRadius: theme.border.radiusSmall,
  padding: theme.spacing.md,
  fontFamily: theme.typography.fontFamily
}}/>
```

---

## 🔄 Responsive

Para hacer componentes responsive:

```jsx
import { getResponsive } from '../config/theme';

// En el componente
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

// Usar:
const padding = getResponsive(
  theme.spacing.lg,   // Desktop
  theme.spacing.md,   // Mobile
  isMobile
);

<div style={{ padding }}>
  Contenido responsive
</div>
```

---

## 📁 Archivos Importantes

```
frontend/src/config/
├── theme.js                    ← Tema centralizado
├── README.md                   ← Documentación completa
├── APLICAR_TEMA.md            ← Cómo aplicar
└── RESUMEN.md                 ← Resumen general

frontend/src/components/
├── ThemeComponents.jsx         ← Componentes listos
└── ExamplesWithTheme.jsx      ← Ejemplos prácticos
```

---

## ❓ Preguntas Comunes

**P: ¿Puedo hacer cambios sin tocar el tema?**  
R: No. Usa siempre el tema para consistencia.

**P: ¿Dónde está el color X?**  
R: En `theme.colors.*`. Ver [theme.js](./theme.js)

**P: ¿Cómo cambio un color globalmente?**  
R: Edita `theme.js` y ¡listo! Todos los componentes se actualizan.

**P: ¿Puedo usar CSS externo?**  
R: No recomendado. Usa inline styles con theme.

**P: ¿Y Dark Mode?**  
R: La estructura está lista. Crea otro theme.js oscuro.

---

## 🎯 Orden de Aplicación Recomendado

1. **Navbar/Header** (estructura principal)
2. **Sidebar** (navegación lateral)
3. **Formularios** (inputs, buttons)
4. **Dashboard Cards** (contenido principal)
5. **Tablas** (listados)
6. **Modales** (popups)
7. **Alertas** (notificaciones)
8. **Footer** (pie)

---

## 🚀 EMPEZAR AHORA

### Opción A: Componentes Reutilizables (RECOMENDADO)
```jsx
import { Button, Card, Input, Alert } from '../components/ThemeComponents';

export const MiComponente = () => (
  <Card title="Mi Card">
    <Input label="Email" />
    <Button>Enviar</Button>
  </Card>
);
```

### Opción B: Tema Directo
```jsx
import { theme } from '../config/theme';

export const MiComponente = () => (
  <div style={{
    background: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.border.radiusMd
  }}>
    Contenido
  </div>
);
```

---

## 📞 Necesitas Ayuda?

- **¿Colores?** → Ver [theme.js - colors](./theme.js)
- **¿Tipografía?** → Ver [theme.js - typography](./theme.js)
- **¿Componentes?** → Ver [ThemeComponents.jsx](../components/ThemeComponents.jsx)
- **¿Ejemplos?** → Ver [ExamplesWithTheme.jsx](../components/ExamplesWithTheme.jsx)
- **¿Guía completa?** → Ver [README.md](./README.md)

---

**¡Comenzar es más fácil de lo que parece!**

---

*Última actualización: Mayo 7, 2026*
