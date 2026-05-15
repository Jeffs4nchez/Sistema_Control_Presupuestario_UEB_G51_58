import { useState, useEffect, useCallback } from 'react'
import { theme } from '../config/theme'
import { PieChart, Search, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const GREEN  = theme.colors.accent.green
const GOLD   = theme.colors.accent.gold
const RED    = '#ff6b7a'
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

const INPUT_S = {
  padding: '8px 11px',
  background: ELEV,
  border: `1px solid ${BORDER}`,
  borderRadius: theme.border.radiusMd,
  color: TEXT,
  fontSize: '13px',
  fontFamily: theme.typography.fontFamily,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const LABEL_S = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: MUTED,
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

function fmt(v) {
  const n = parseFloat(v) || 0
  return n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
}

function SaldoBar({ codificado, certificado }) {
  const pct = codificado > 0 ? Math.min(100, (certificado / codificado) * 100) : 0
  const color = pct >= 100 ? RED : pct >= 75 ? GOLD : GREEN
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '100px' }}>
      <div style={{ flex: 1, height: '4px', background: ELEV, borderRadius: '2px', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px' }} />
      </div>
      <span style={{ fontSize: '10px', color, fontWeight: 700, minWidth: '30px', textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

export default function PresupuestoDisponible() {
  const [items,      setItems]    = useState([])
  const [totales,    setTotales]  = useState(null)
  const [loading,    setLoading]  = useState(false)
  const [search,     setSearch]   = useState('')
  const [fPrograma,  setPrograma] = useState('')
  const [fActividad, setActividad]= useState('')
  const [fFuente,    setFuente]   = useState('')

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const q = new URLSearchParams({
        search:    params.search    ?? search,
        programa:  params.programa  ?? fPrograma,
        actividad: params.actividad ?? fActividad,
        fuente:    params.fuente    ?? fFuente,
      }).toString()
      const res  = await fetch(`${API}/presupuesto-disponible?${q}`)
      const json = await res.json()
      if (json.success) {
        setItems(json.data)
        setTotales(json.totales)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, fPrograma, fActividad, fFuente])

  useEffect(() => { fetchData() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData({ search, programa: fPrograma, actividad: fActividad, fuente: fFuente })
  }

  const handleReset = () => {
    setSearch('')
    setPrograma('')
    setActividad('')
    setFuente('')
    fetchData({ search: '', programa: '', actividad: '', fuente: '' })
  }

  return (
    <div style={{ background: theme.colors.dark['900'], minHeight: '100%', padding: '28px', fontFamily: theme.typography.fontFamily }}>

      {/* Título */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <PieChart size={20} color={ACCENT} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
            Presupuesto Disponible
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
          Saldo por partida: Codificado (Asignado + Modificado) − Certificado
        </p>
      </div>

      {/* Tarjetas de resumen */}
      {totales && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Ítems',      value: totales.total_items,                  color: TEXT,  raw: true },
            { label: 'Total Codificado', value: fmt(totales.total_codificado),         color: TEXT },
            { label: 'Total Certificado',value: fmt(totales.total_certificado),        color: GOLD },
            { label: 'Saldo Total',      value: fmt(totales.total_saldo),              color: GREEN },
            { label: 'Ítems Sin Saldo',  value: totales.items_sin_saldo,              color: RED,   raw: true },
          ].map((card, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: card.raw ? '24px' : '18px', fontWeight: 700, color: card.color }}>
                {card.raw ? card.value : card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '14px', marginBottom: '16px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={LABEL_S}>Buscar ítem</label>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Código o nombre..." style={{ ...INPUT_S, paddingLeft: '28px' }} />
              </div>
            </div>
            <div>
              <label style={LABEL_S}>Programa</label>
              <input type="text" value={fPrograma} onChange={(e) => setPrograma(e.target.value)} placeholder="Código de programa..." style={INPUT_S} />
            </div>
            <div>
              <label style={LABEL_S}>Actividad</label>
              <input type="text" value={fActividad} onChange={(e) => setActividad(e.target.value)} placeholder="Código de actividad..." style={INPUT_S} />
            </div>
            <div>
              <label style={LABEL_S}>Fuente</label>
              <input type="text" value={fFuente} onChange={(e) => setFuente(e.target.value)} placeholder="Código de fuente..." style={INPUT_S} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ padding: '8px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
              Filtrar
            </button>
            <button type="button" onClick={handleReset} title="Limpiar filtros" style={{ padding: '8px 10px', background: ELEV, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={13} />
            </button>
            {!loading && <span style={{ fontSize: '12px', color: MUTED, alignSelf: 'center', marginLeft: '4px' }}>{items.length} partida(s)</span>}
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>Cargando...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            No se encontraron partidas presupuestarias.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: `${ELEV}88` }}>
                  {['Código', 'Nombre Ítem', 'Programa', 'Actividad', 'Fuente', 'Codificado', 'Certificado', 'Saldo', 'Avance', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 14px',
                      textAlign: i >= 5 && i <= 7 ? 'right' : 'left',
                      fontSize: '10px', fontWeight: 700, color: MUTED,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap', borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={`${item.id_item}-${item.cod_fuente ?? idx}`}
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      background: item.sin_saldo ? 'rgba(196,30,58,0.05)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = item.sin_saldo ? 'rgba(196,30,58,0.10)' : `${ELEV}55` }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = item.sin_saldo ? 'rgba(196,30,58,0.05)' : 'transparent' }}
                  >
                    <td style={{ padding: '10px 14px', fontSize: '11px', fontFamily: 'monospace', color: ACCENT, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {item.cod_item}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: TEXT, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.nombre_item}>
                      {item.nombre_item}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: MUTED, whiteSpace: 'nowrap' }}>{item.cod_programa || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: MUTED, whiteSpace: 'nowrap' }}>{item.cod_actividad || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: MUTED, whiteSpace: 'nowrap' }}>{item.cod_fuente || '—'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: TEXT, whiteSpace: 'nowrap' }}>{fmt(item.codificado)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: GOLD, whiteSpace: 'nowrap' }}>{fmt(item.certificado)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: item.sin_saldo ? RED : GREEN, whiteSpace: 'nowrap' }}>
                      {fmt(item.saldo)}
                    </td>
                    <td style={{ padding: '10px 14px', minWidth: '110px' }}>
                      <SaldoBar codificado={item.codificado} certificado={item.certificado} />
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {item.sin_saldo
                        ? <AlertTriangle size={14} color={RED} title="Sin saldo disponible" />
                        : <CheckCircle2 size={14} color={GREEN} title="Saldo disponible" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
