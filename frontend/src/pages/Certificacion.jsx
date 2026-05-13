import { useState, useEffect } from "react"
import { theme } from '../config/theme'
import { FileText, Plus } from 'lucide-react'
import CrearCertificacion from "./CrearCertificacion"
import ListaCertificaciones from "./ListaCertificaciones"

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

export default function Certificacion() {
  const [activeTab, setActiveTab] = useState("lista")
  const [refresh,   setRefresh]   = useState(0)
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const handleCertificadoCreado = () => {
    setRefresh(p => p + 1)
    setActiveTab("lista")
  }

  const tabs = [
    { id: 'lista', label: 'Lista de Certificados', icon: <FileText size={15} /> },
    { id: 'crear', label: 'Crear Certificado',     icon: <Plus size={15} /> },
  ]

  const P = isMobile ? '20px' : '28px'

  return (
    <div style={{ minHeight: '100%', background: theme.colors.dark['900'], fontFamily: theme.typography.fontFamily }}>

      {/* Page header */}
      <div style={{
        padding: `24px ${P} 0`,
        background: CARD,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            width: '38px', height: '38px',
            borderRadius: theme.border.radiusMd,
            background: `${ACCENT}1a`,
            border: `1px solid ${ACCENT}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: ACCENT,
          }}>
            <FileText size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
              Gestión de Certificados
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>
              Crear y gestionar certificados presupuestarios
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                  color: active ? '#fff' : MUTED,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 400,
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                  fontFamily: theme.typography.fontFamily,
                  marginBottom: '-1px',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = TEXT }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = MUTED }}
              >
                <span style={{ color: active ? ACCENT : 'inherit', display: 'flex' }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: P }}>
        {activeTab === "lista" && <ListaCertificaciones refresh={refresh} />}
        {activeTab === "crear" && <CrearCertificacion onCreated={handleCertificadoCreado} />}
      </div>
    </div>
  )
}
