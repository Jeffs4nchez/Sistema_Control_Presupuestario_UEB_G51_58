import { useState, useEffect } from "react"
import { theme } from '../config/theme'
import { BarChart2, Upload, Eye } from 'lucide-react'
import CedulaPresupuestariaUpload from "./CedulaPresupuestariaUpload"
import CedulaPresupuestariaData from "./CedulaPresupuestariaData"

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ACCENT = theme.colors.accent.blue
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

export default function CedulaPresupuestaria() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const tabs = [
    { id: 'upload', label: 'Cargar Datos', icon: <Upload size={15} /> },
    { id: 'data',   label: 'Ver Datos',    icon: <Eye size={15} /> },
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
            background: `${ACCENT}1a`, border: `1px solid ${ACCENT}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: ACCENT,
          }}>
            <BarChart2 size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
              Cédula Presupuestaria
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Cargar y visualizar datos de la cédula presupuestaria</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '10px 16px',
                  background: 'none', border: 'none',
                  borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                  color: active ? '#fff' : MUTED,
                  cursor: 'pointer', fontSize: '13px',
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
        {activeTab === 'upload' && <CedulaPresupuestariaUpload />}
        {activeTab === 'data'   && <CedulaPresupuestariaData />}
      </div>
    </div>
  )
}
