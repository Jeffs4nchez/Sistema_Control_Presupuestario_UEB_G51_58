import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Search, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useFiscalYear } from '../contexts/FiscalYearContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const inputStyle = {
  padding: '8px 11px',
  background: '#f8fafd',
  border: '1px solid rgba(46,108,164,0.22)',
  borderRadius: '8px',
  color: '#1a3a5c',
  fontSize: '13px',
  fontFamily: 'var(--font-primary)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
}

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  color: '#5a7a9f',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  fontFamily: 'var(--font-primary)',
}

function fmt(v) {
  const n = parseFloat(v) || 0
  return n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
}

function SaldoBar({ codificado, certificado }) {
  const pct = codificado > 0 ? Math.min(100, (certificado / codificado) * 100) : 0
  const color = pct >= 100 ? '#b91c1c' : pct >= 75 ? '#d97706' : '#059669'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '100px' }}>
      <div style={{ flex: 1, height: '5px', background: 'rgba(26,58,92,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '3px' }}
        />
      </div>
      <span style={{ fontSize: '10px', color, fontWeight: 700, minWidth: '30px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

export default function PresupuestoDisponible() {
  const { selectedCedula } = useFiscalYear()
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
      const qParams = {
        search:    params.search    ?? search,
        programa:  params.programa  ?? fPrograma,
        actividad: params.actividad ?? fActividad,
        fuente:    params.fuente    ?? fFuente,
      }
      if (selectedCedula) qParams.id_cedula_presupuestaria = selectedCedula.id_cedula_presupuestaria
      const q = new URLSearchParams(qParams).toString()
      const res  = await fetch(`${API}/presupuesto-disponible?${q}`)
      const json = await res.json()
      if (json.success) {
        setItems(json.data)
        setTotales(json.totales)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, fPrograma, fActividad, fFuente, selectedCedula])

  useEffect(() => { fetchData() }, [selectedCedula?.id_cedula_presupuestaria])

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

  const focusStyle = (e) => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }
  const blurStyle  = (e) => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }

  const summaryCards = totales ? [
    { label: 'Total Ítems',       value: totales.total_items,   color: '#2e6ca4', raw: true },
    { label: 'Total Codificado',  value: fmt(totales.total_codificado),   color: '#1a3a5c' },
    { label: 'Total Certificado', value: fmt(totales.total_certificado),  color: '#d97706' },
    { label: 'Saldo Total',       value: fmt(totales.total_saldo),        color: '#059669' },
    { label: 'Ítems Sin Saldo',   value: totales.items_sin_saldo, color: '#b91c1c', raw: true },
  ] : []

  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100%', padding: '28px', fontFamily: 'var(--font-primary)' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PieChart size={18} color="#059669" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
              Presupuesto Disponible
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              Saldo por partida: Codificado − Certificado
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      {totales && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {summaryCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 120, damping: 18 }}
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.95)',
                borderRadius: '14px',
                boxShadow: '0 4px 20px rgba(26,58,92,0.08)',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: card.raw ? '24px' : '16px', fontWeight: 800, color: card.color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {card.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(26,58,92,0.08)',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={labelStyle}>Buscar ítem</label>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#8fa3c0', pointerEvents: 'none' }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Código o nombre..." style={{ ...inputStyle, paddingLeft: '28px' }} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Programa</label>
              <input type="text" value={fPrograma} onChange={(e) => setPrograma(e.target.value)} placeholder="Código de programa..." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label style={labelStyle}>Actividad</label>
              <input type="text" value={fActividad} onChange={(e) => setActividad(e.target.value)} placeholder="Código de actividad..." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fuente</label>
              <input type="text" value={fFuente} onChange={(e) => setFuente(e.target.value)} placeholder="Código de fuente..." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              style={{
                padding: '8px 18px',
                background: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                fontFamily: 'var(--font-primary)',
                boxShadow: '0 4px 14px rgba(26,58,92,0.25)',
              }}
            >
              Filtrar
            </motion.button>
            <button
              type="button"
              onClick={handleReset}
              title="Limpiar filtros"
              style={{
                padding: '8px 10px', background: 'rgba(26,58,92,0.06)', color: 'var(--text-muted)',
                border: '1px solid rgba(26,58,92,0.12)', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,58,92,0.10)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(26,58,92,0.06)'; }}
            >
              <RefreshCw size={13} />
            </button>
            {!loading && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                {items.length} partida{items.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </form>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(26,58,92,0.10)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(46,108,164,0.12)', borderTopColor: '#2e6ca4', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cargando partidas...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <PieChart size={36} color="rgba(26,58,92,0.15)" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No se encontraron partidas presupuestarias.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f4f8', borderBottom: '2px solid rgba(26,58,92,0.08)' }}>
                  {['Código', 'Nombre Ítem', 'Programa', 'Actividad', 'Fuente', 'Codificado', 'Certificado', 'Saldo', 'Avance', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 14px',
                      textAlign: i >= 5 && i <= 7 ? 'right' : 'left',
                      fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <motion.tr
                    key={`${item.id_item}-${item.cod_fuente ?? idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02, type: 'spring', stiffness: 200, damping: 25 }}
                    style={{
                      borderBottom: '1px solid rgba(26,58,92,0.07)',
                      background: item.sin_saldo ? 'rgba(139,15,15,0.04)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = item.sin_saldo ? 'rgba(139,15,15,0.08)' : 'rgba(240,244,248,0.85)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = item.sin_saldo ? 'rgba(139,15,15,0.04)' : 'transparent'; }}
                  >
                    <td style={{ padding: '10px 14px', fontSize: '11px', fontFamily: 'monospace', color: '#2e6ca4', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {item.cod_item}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-heading)', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.nombre_item}>
                      {item.nombre_item}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.cod_programa || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.cod_actividad || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.cod_fuente || '—'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: 'var(--text-heading)', fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{fmt(item.codificado)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: '#d97706', fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{fmt(item.certificado)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', fontWeight: 800, color: item.sin_saldo ? '#b91c1c' : '#059669', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(item.saldo)}
                    </td>
                    <td style={{ padding: '10px 14px', minWidth: '110px' }}>
                      <SaldoBar codificado={item.codificado} certificado={item.certificado} />
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {item.sin_saldo
                        ? <AlertTriangle size={14} color="#b91c1c" title="Sin saldo disponible" />
                        : <CheckCircle2 size={14} color="#059669" title="Saldo disponible" />
                      }
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
