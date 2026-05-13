/**
 * EJEMPLOS DE COMPONENTES CON TEMA UEB INTEGRADO
 * 
 * Este archivo contiene ejemplos de cómo usar el sistema de temas
 * en diferentes componentes de la aplicación.
 * 
 * Usa estos como referencia para aplicar el tema a otros componentes.
 */

import { theme } from '../config/theme';
import { Button, Input, Card, Alert, Badge, Flex, Grid } from './ThemeComponents';

// ============================================================================
// EJEMPLO 1: NAVBAR / HEADER
// ============================================================================

export const NavbarExample = () => {
  return (
    <nav style={{
      background: theme.colors.primary,
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      boxShadow: theme.shadow.md,
      fontFamily: theme.typography.fontFamily
    }}>
      <Flex gap="xl" justify="space-between" align="center">
        {/* Logo */}
        <h1 style={{
          color: theme.colors.secondary,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          margin: 0
        }}>
          SNC
        </h1>

        {/* Menú */}
        <Flex gap="xl">
          {['Inicio', 'Reportes', 'Configuración'].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: theme.colors.secondary,
                textDecoration: 'none',
                fontSize: theme.typography.fontSize.base,
                transition: theme.transition.normal,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.border.radiusSmall,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme.colors.accent.blue;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              {item}
            </a>
          ))}
        </Flex>

        {/* Usuario */}
        <div style={{
          color: theme.colors.secondary,
          fontSize: theme.typography.fontSize.sm
        }}>
          👤 Usuario
        </div>
      </Flex>
    </nav>
  );
};

// ============================================================================
// EJEMPLO 2: SIDEBAR
// ============================================================================

export const SidebarExample = () => {
  return (
    <aside style={{
      background: theme.colors.primary,
      color: theme.colors.secondary,
      width: theme.components.sidebar.width.expanded,
      padding: theme.spacing.lg,
      boxShadow: theme.shadow.md,
      minHeight: '100vh',
      fontFamily: theme.typography.fontFamily
    }}>
      <h2 style={{
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: theme.spacing.xl,
        margin: `0 0 ${theme.spacing.xl} 0`
      }}>
        Menú Principal
      </h2>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {['Dashboard', 'Presupuestos', 'Reportes', 'Configuración'].map((item) => (
          <a
            key={item}
            href="#"
            style={{
              color: theme.colors.secondary,
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              borderRadius: theme.border.radiusSmall,
              textDecoration: 'none',
              transition: theme.transition.normal,
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.colors.accent.blue;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
};

// ============================================================================
// EJEMPLO 3: DASHBOARD CARD
// ============================================================================

export const DashboardCardExample = () => {
  return (
    <Card
      title="Presupuesto Total"
      subtitle="Estado actual del año fiscal"
      padding="lg"
      shadow="md"
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md
      }}>
        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: theme.spacing.lg
        }}>
          {/* Ejecutado */}
          <div style={{
            background: theme.colors.success.light,
            padding: theme.spacing.md,
            borderRadius: theme.border.radiusMd,
            borderLeft: `4px solid ${theme.colors.state.success}`
          }}>
            <p style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
              margin: '0 0 8px 0'
            }}>
              Ejecutado
            </p>
            <p style={{
              color: theme.colors.success.text,
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              margin: 0
            }}>
              $125,400
            </p>
          </div>

          {/* Disponible */}
          <div style={{
            background: theme.colors.info.light,
            padding: theme.spacing.md,
            borderRadius: theme.border.radiusMd,
            borderLeft: `4px solid ${theme.colors.state.info}`
          }}>
            <p style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
              margin: '0 0 8px 0'
            }}>
              Disponible
            </p>
            <p style={{
              color: theme.colors.info.text,
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              margin: 0
            }}>
              $74,600
            </p>
          </div>
        </div>

        {/* Botón */}
        <Button fullWidth>Ver Detalles</Button>
      </div>
    </Card>
  );
};

// ============================================================================
// EJEMPLO 4: FORMULARIO COMPLETO
// ============================================================================

export const FormExample = () => {
  const [formData, setFormData] = React.useState({
    nombre: '',
    email: '',
    presupuesto: '',
    tipo: ''
  });

  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Card title="Nuevo Presupuesto" padding="lg">
      {submitted && (
        <Alert type="success" title="¡Éxito!" closeable>
          El presupuesto ha sido creado correctamente.
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <Input
          label="Nombre del Presupuesto"
          placeholder="Ej: Presupuesto 2026"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />

        <Input
          label="Email de Contacto"
          type="email"
          placeholder="correo@ueb.edu.ec"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Monto Total ($)"
          type="number"
          placeholder="0.00"
          value={formData.presupuesto}
          onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
        />

        {/* Select */}
        <div>
          <label style={{
            display: 'block',
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: theme.spacing.sm,
            fontFamily: theme.typography.fontFamily
          }}>
            Tipo de Presupuesto
          </label>
          <select style={{
            width: '100%',
            padding: theme.spacing.md,
            borderRadius: theme.border.radiusSmall,
            border: `2px solid ${theme.colors.input.border}`,
            background: theme.colors.input.background,
            fontSize: theme.typography.fontSize.base,
            fontFamily: theme.typography.fontFamily,
            color: theme.colors.text.primary
          }}>
            <option value="">Selecciona un tipo</option>
            <option value="operativo">Operativo</option>
            <option value="capital">Capital</option>
            <option value="investigacion">Investigación</option>
          </select>
        </div>

        {/* Botones */}
        <Flex gap="md" justify="flex-end">
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary" type="submit">Guardar</Button>
        </Flex>
      </form>
    </Card>
  );
};

// ============================================================================
// EJEMPLO 5: TABLA CON TEMA
// ============================================================================

export const TableExample = () => {
  const data = [
    { id: 1, presupuesto: 'Presupuesto 2026', monto: '$200,000', estado: 'Vigente', porcentaje: 62 },
    { id: 2, presupuesto: 'Presupuesto 2025', monto: '$180,000', estado: 'Finalizado', porcentaje: 100 },
    { id: 3, presupuesto: 'Presupuesto 2024', monto: '$150,000', estado: 'Archivado', porcentaje: 100 },
  ];

  return (
    <Card title="Presupuestos Registrados" padding="md">
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: theme.typography.fontFamily
        }}>
          <thead>
            <tr style={{
              background: theme.colors.primary,
              color: theme.colors.secondary
            }}>
              <th style={{
                padding: theme.spacing.md,
                textAlign: 'left',
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.sm,
                borderBottom: `2px solid ${theme.colors.gray['300']}`
              }}>
                Presupuesto
              </th>
              <th style={{
                padding: theme.spacing.md,
                textAlign: 'right',
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.sm,
                borderBottom: `2px solid ${theme.colors.gray['300']}`
              }}>
                Monto
              </th>
              <th style={{
                padding: theme.spacing.md,
                textAlign: 'center',
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.sm,
                borderBottom: `2px solid ${theme.colors.gray['300']}`
              }}>
                Estado
              </th>
              <th style={{
                padding: theme.spacing.md,
                textAlign: 'center',
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.sm,
                borderBottom: `2px solid ${theme.colors.gray['300']}`
              }}>
                Progreso
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  background: idx % 2 === 0 ? theme.colors.secondary : theme.colors.gray['100'],
                  borderBottom: `1px solid ${theme.colors.gray['200']}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.gray['200'];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = idx % 2 === 0 ? theme.colors.secondary : theme.colors.gray['100'];
                }}
              >
                <td style={{
                  padding: theme.spacing.md,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.sm
                }}>
                  {row.presupuesto}
                </td>
                <td style={{
                  padding: theme.spacing.md,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.sm,
                  textAlign: 'right',
                  fontWeight: theme.typography.fontWeight.semibold
                }}>
                  {row.monto}
                </td>
                <td style={{
                  padding: theme.spacing.md,
                  textAlign: 'center'
                }}>
                  <Badge variant={row.estado === 'Vigente' ? 'success' : 'gray'}>
                    {row.estado}
                  </Badge>
                </td>
                <td style={{
                  padding: theme.spacing.md,
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: theme.colors.gray['200'],
                    borderRadius: theme.border.radiusFull,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${row.porcentaje}%`,
                      background: row.porcentaje === 100 ? theme.colors.state.success : theme.colors.state.warning,
                      transition: theme.transition.normal
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ============================================================================
// EJEMPLO 6: MODAL / DIALOG
// ============================================================================

export const ModalExample = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: theme.zIndex.modal,
      fontFamily: theme.typography.fontFamily
    }}>
      <div style={{
        background: theme.colors.secondary,
        borderRadius: theme.border.radiusLg,
        boxShadow: theme.shadow.xl,
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: theme.colors.primary,
          color: theme.colors.secondary,
          padding: theme.spacing.lg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold
          }}>
            Confirmar Eliminación
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.secondary,
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: theme.spacing.lg
        }}>
          <p style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.base,
            margin: `0 0 ${theme.spacing.md} 0`
          }}>
            ¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.
          </p>

          <Alert type="warning" title="Advertencia">
            Se eliminarán también todos los movimientos asociados.
          </Alert>
        </div>

        {/* Footer */}
        <div style={{
          padding: theme.spacing.lg,
          background: theme.colors.gray['100'],
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'flex-end',
          borderTop: `1px solid ${theme.colors.gray['200']}`
        }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger">Eliminar</Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EJEMPLO 7: STATS/KPI CARDS
// ============================================================================

export const StatsExample = () => {
  const stats = [
    {
      label: 'Presupuesto Total',
      value: '$1,250,000',
      icon: '💰',
      color: 'primary'
    },
    {
      label: 'Gastado',
      value: '$875,400',
      icon: '📊',
      color: 'success'
    },
    {
      label: 'Disponible',
      value: '$374,600',
      icon: '✅',
      color: 'info'
    },
    {
      label: 'En Revisión',
      value: '$45,200',
      icon: '⏳',
      color: 'warning'
    }
  ];

  return (
    <Grid columns={4} gap="lg">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          padding="md"
          shadow="sm"
          style={{
            textAlign: 'center',
            borderTop: `4px solid ${
              stat.color === 'primary' ? theme.colors.primary :
              stat.color === 'success' ? theme.colors.state.success :
              stat.color === 'info' ? theme.colors.state.info :
              theme.colors.state.warning
            }`
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: theme.spacing.md }}>
            {stat.icon}
          </div>
          <p style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
            margin: `0 0 ${theme.spacing.sm} 0`
          }}>
            {stat.label}
          </p>
          <p style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            margin: 0
          }}>
            {stat.value}
          </p>
        </Card>
      ))}
    </Grid>
  );
};

// ============================================================================
// EJEMPLO 8: FOOTER
// ============================================================================

export const FooterExample = () => {
  return (
    <footer style={{
      background: theme.colors.primary,
      color: theme.colors.secondary,
      padding: theme.spacing.xl,
      marginTop: theme.spacing['4xl'],
      fontFamily: theme.typography.fontFamily
    }}>
      <Grid columns={3} gap="xl" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Columna 1 */}
        <div>
          <h4 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.lg
          }}>
            Sistema
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><a href="#" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>Inicio</a></li>
            <li><a href="#" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>Documentación</a></li>
            <li><a href="#" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>API</a></li>
          </ul>
        </div>

        {/* Columna 2 */}
        <div>
          <h4 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.lg
          }}>
            Soporte
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><a href="#" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>Centro de Ayuda</a></li>
            <li><a href="#" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>Contacto</a></li>
            <li><a href="#" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>Reportar Error</a></li>
          </ul>
        </div>

        {/* Columna 3 */}
        <div>
          <h4 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.lg
          }}>
            Institución
          </h4>
          <p style={{
            fontSize: theme.typography.fontSize.sm,
            margin: 0
          }}>
            © 2026 Universidad Especializada en Beneficio<br />
            Sistema de Control Presupuestario
          </p>
        </div>
      </Grid>

      {/* Línea divisoria */}
      <div style={{
        borderTop: `1px solid rgba(255, 255, 255, 0.2)`,
        marginTop: theme.spacing.xl,
        paddingTop: theme.spacing.lg,
        textAlign: 'center',
        fontSize: theme.typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        Todos los derechos reservados
      </div>
    </footer>
  );
};
