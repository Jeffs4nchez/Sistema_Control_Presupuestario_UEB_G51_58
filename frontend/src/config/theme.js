/**
 * GUÍA DE ESTILOS VISUAL - UEB Sistema de Control Presupuestario
 *
 * Paleta institucional basada en el azul navy #003358 de la
 * Universidad Estatal de Bolívar.
 */

export const theme = {

  // ── COLORES ──────────────────────────────────────────────────────────────

  colors: {

    // Institucional UEB
    primary:      '#003358',   // Azul navy institucional
    primaryLight: '#0055a0',   // Azul medio (variante clara)
    primaryDark:  '#001f3f',   // Azul muy oscuro (casi negro-azul)
    secondary:    '#ffffff',   // Blanco

    // Acentos — todos compatibles con el azul navy
    accent: {
      red:   '#C41E3A',        // Rojo institucional UEB
      blue:  '#1a7bbf',        // Azul claro (variante luminosa del primario)
      gold:  '#C9922A',        // Dorado — complemento clásico del navy
      teal:  '#0891b2',        // Teal — contraste frío
      green: '#10b981',        // Verde éxito
      amber: '#D97706',        // Ámbar — advertencias / hover de warning
    },

    // Modo oscuro — tonos navy oscuros usados en el interior del sistema
    dark: {
      950: '#060d1a',          // Fondo más profundo
      900: '#0a1628',          // Fondos principales
      800: '#0f1f38',          // Cards / sidebars
      700: '#162844',          // Bordes
      600: '#1e3354',          // Elementos elevados
      500: '#264060',          // Hover / activo
    },

    // Estados semánticos
    state: {
      success: '#10b981',      // Verde esmeralda
      error:   '#C41E3A',      // Rojo UEB
      warning: '#D97706',      // Ámbar
      info:    '#1a7bbf',      // Azul claro
    },

    // Texto
    text: {
      primary:   '#001F3F',    // Azul muy oscuro — texto principal
      secondary: '#3D5A80',    // Azul grisáceo — texto secundario
      tertiary:  '#6B7280',    // Gris medio
      light:     '#9CA3AF',    // Gris claro
      muted:     '#D1D5DB',    // Gris muy claro / deshabilitado
      inverse:   '#ffffff',    // Blanco — sobre fondos oscuros
      error:     '#C41E3A',    // Rojo — mensajes de error
    },

    // Escala de grises con tinte navy sutil
    gray: {
      '100': '#F4F6FA',
      '200': '#E6EAF2',
      '300': '#CDD4E3',
      '400': '#9AAFC8',
      '500': '#6B85A0',
      '600': '#4A6080',
      '700': '#2E4060',
      '800': '#1a2d45',
      '900': '#0d1b2e',
    },

    // Inputs (formularios en modo claro — login)
    input: {
      background: '#E8F0FE',   // Azul muy claro
      border:     '#C5D5EA',   // Borde azul suave
      focus:      '#003358',   // Foco navy
      disabled:   '#F3F6FB',   // Deshabilitado
    },

    // Paletas de estado completas (fondo + borde + texto)
    error: {
      background: '#FEE2E2',
      border:     '#FCA5A5',
      text:       '#C41E3A',
      light:      '#FECACA',
    },
    success: {
      background: '#D1FAE5',
      border:     '#10b981',
      text:       '#065f46',
      light:      '#ECFDF5',
    },
    warning: {
      background: '#FEF3C7',
      border:     '#D97706',
      text:       '#92400e',
      light:      '#FFFBEB',
    },
    info: {
      background: '#DBEAFE',
      border:     '#1a7bbf',
      text:       '#1e3a8a',
      light:      '#EFF6FF',
    },
  },

  // ── TIPOGRAFÍA ───────────────────────────────────────────────────────────

  typography: {
    fontFamily:    '"Argentum Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyAlt: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    fontSize: {
      xs:   '12px',
      sm:   '13px',
      md:   '14px',
      base: '15px',
      lg:   '16px',
      xl:   '18px',
      '2xl':'20px',
      '3xl':'22px',
      '4xl':'24px',
      '5xl':'28px',
      '6xl':'32px',
      '7xl':'36px',
    },

    fontWeight: {
      light:     300,
      normal:    400,
      medium:    500,
      semibold:  600,
      bold:      700,
      extrabold: 800,
    },

    lineHeight: {
      tight:   1.2,
      normal:  1.5,
      relaxed: 1.75,
      loose:   2,
    },
  },

  // ── ESPACIADOS ───────────────────────────────────────────────────────────

  spacing: {
    xs:   '0.25rem',   //  4px
    sm:   '0.5rem',    //  8px
    md:   '1rem',      // 16px
    lg:   '1.5rem',    // 24px
    xl:   '2rem',      // 32px
    '2xl':'2.5rem',    // 40px
    '3xl':'3rem',      // 48px
    '4xl':'4rem',      // 64px
    '5xl':'5rem',      // 80px
    '6xl':'6rem',      // 96px
  },

  // ── BORDES ───────────────────────────────────────────────────────────────

  border: {
    radius:     '13px',
    radiusSmall: '4px',
    radiusMd:    '8px',
    radiusLg:   '16px',
    radiusFull: '9999px',
  },

  // ── SOMBRAS ──────────────────────────────────────────────────────────────

  shadow: {
    sm:    '0 2px 4px rgba(0, 51, 88, 0.12)',
    md:    '0 4px 8px rgba(0, 51, 88, 0.2)',
    lg:    '0px 0px 25px 0px rgba(0, 31, 63, 0.45)',
    xl:    '0 20px 25px -5px rgba(0, 51, 88, 0.15)',
    drop:  '0 4px 12px rgba(0, 51, 88, 0.2)',
    inner: 'inset 0 2px 4px rgba(0, 51, 88, 0.08)',
    none:  'none',
  },

  // ── TRANSICIONES ─────────────────────────────────────────────────────────

  transition: {
    fast:   'all 0.2s ease',
    normal: 'all 0.3s ease',
    slow:   'all 0.5s ease',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // ── BREAKPOINTS ──────────────────────────────────────────────────────────

  breakpoints: {
    mobile:    640,
    tablet:    768,
    desktop:  1024,
    wide:     1200,
    ultrawide:1400,
  },

  // ── COMPONENTES ──────────────────────────────────────────────────────────

  components: {
    login: {
      containerDesktop: { maxWidth: '1150px', minHeight: '400px' },
      containerMobile:  { maxWidth: '100%', minHeight: '550px', margin: '0 0.25rem' },
      logoMaxWidth:     { desktop: '767px', mobile: '280px' },
    },
    button: {
      height:  { sm: '32px', md: '40px', lg: '48px' },
      padding: { sm: '0.5rem 1rem', md: '0.75rem 1.5rem', lg: '1rem 2rem' },
    },
    card: {
      padding: { sm: '1rem', md: '1.5rem', lg: '2rem' },
    },
    sidebar: {
      width: { collapsed: '80px', expanded: '280px' },
    },
  },

  // ── Z-INDEX ──────────────────────────────────────────────────────────────

  zIndex: {
    hide:    -1,
    base:     0,
    dropdown:100,
    sticky:  500,
    fixed:   800,
    modal:   900,
    popover: 950,
    tooltip: 1000,
    loading: 9999,
  },
};

// ── HELPERS ────────────────────────────────────────────────────────────────

export const getResponsive = (desktopValue, mobileValue, isMobile) =>
  isMobile ? mobileValue : desktopValue;

export const createGradient = (colors, angle = 110, isMobile = false) => {
  const gradientAngle = isMobile ? 180 : angle;
  return `linear-gradient(${gradientAngle}deg, ${colors.start} ${colors.startPercent}%, ${colors.end} ${colors.endPercent}%)`;
};

export const getStateStyle = (state = 'default') => {
  const map = {
    success: theme.colors.state.success,
    error:   theme.colors.state.error,
    warning: theme.colors.state.warning,
    info:    theme.colors.state.info,
    default: theme.colors.primary,
  };
  return map[state] || map.default;
};
