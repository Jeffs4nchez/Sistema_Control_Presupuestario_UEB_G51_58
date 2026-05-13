import { BorderBeam } from '../components/BorderBeam';

/**
 * EJEMPLOS DE USO DEL BORDERBEAM
 * 
 * Propiedades disponibles:
 * - size: Tamaño del beam (ancho del gradiente) - default: 200
 * - duration: Duración en segundos de una vuelta completa - default: 15
 * - borderWidth: Grosor del borde - default: 1.5
 * - colorFrom: Color inicial del gradiente - default: var(--color-primary)
 * - colorTo: Color final del gradiente - default: var(--color-secondary)
 * - delay: Retraso antes de iniciar en segundos - default: 0
 * - anchor: Punto de anclaje del beam (0-100%) - default: 90
 * - className: Clases CSS adicionales
 */

/**
 * REGLAS IMPORTANTES
 * 1. El contenedor DEBE tener position: relative (o se hereda)
 * 2. El contenedor DEBE tener overflow: hidden
 * 3. El contenedor puede tener cualquier border-radius, el beam lo hereda
 */

// Ejemplo 1: BorderBeam básico (como en Login.jsx)
export function BasicBorderBeamExample() {
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
      <h2>Mi Card con BorderBeam</h2>
      <p>El borde se anima automáticamente</p>
    </div>
  );
}

// Ejemplo 2: Múltiples beams con efecto "chase" (uno siguiendo al otro)
export function MultipleBeamExample() {
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
      {/* Primer beam - comienza inmediatamente */}
      <BorderBeam 
        size={200}
        duration={10}
        colorFrom="#b71c1c"
        colorTo="#506690"
        borderWidth={2}
        delay={0}
      />
      
      {/* Segundo beam - comienza 5 segundos después para efecto de persecución */}
      <BorderBeam 
        size={200}
        duration={10}
        colorFrom="#506690"
        colorTo="#b71c1c"
        borderWidth={2}
        delay={5}
      />
      
      <h2>Card con efecto "Chase"</h2>
      <p>Dos beams siguiéndose mutuamente</p>
    </div>
  );
}

// Ejemplo 3: BorderBeam con colores personalizados
export function CustomColorsBorderBeamExample() {
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
        duration={8}
        colorFrom="#00ff88"  // Verde neon
        colorTo="#0088ff"    // Azul neon
        borderWidth={3}
      />
      <h2>Card Neon</h2>
      <p>Colores personalizados para un estilo diferente</p>
    </div>
  );
}

// Ejemplo 4: BorderBeam lento y elegante
export function SlowBorderBeamExample() {
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
        size={150}
        duration={20}      // Muy lento para efecto elegante
        colorFrom="#ffd700" // Dorado
        colorTo="#ffa500"   // Naranja
        borderWidth={1}     // Más delgado
      />
      <h2>Card Premium</h2>
      <p>Animación lenta y elegante</p>
    </div>
  );
}

// Ejemplo 5: BorderBeam rápido y energético
export function FastBorderBeamExample() {
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
        size={300}
        duration={5}        // Muy rápido para efecto energético
        colorFrom="#ff1744" // Rojo vivo
        colorTo="#ff6f00"   // Naranja vivo
        borderWidth={2.5}   // Más grueso
      />
      <h2>Card Energética</h2>
      <p>Animación rápida y viva</p>
    </div>
  );
}
