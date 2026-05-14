import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { theme } from '../config/theme'
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react"

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
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
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

export default function CedulaPresupuestariaData() {
  const [data,       setData]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState("")
  const [page,       setPage]       = useState(1)
  const [pagination, setPagination] = useState(null)
  const [limit,      setLimit]      = useState(50)
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768)

  useEffect(() => {
    fetchData()
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [page, limit])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = Cookies.get("auth_token")
      const res = await fetch(
        `http://localhost:8000/api/cedula-presupuestaria/data?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const result = await res.json()
      if (result.success) { setData(result.data); setPagination(result.pagination) }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData() }

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '-') return "—"
    const n = parseFloat(value)
    if (isNaN(n)) return "—"
    return `$${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const calcularSaldoDisponible = (item) => {
    const asignado   = parseFloat(item.asignado)   || 0
    const modificado = parseFloat(item.modificado) || 0
    const certificado = parseFloat(item.certificado) || 0
    const codificado = asignado + modificado
    const saldo = Math.max(0, codificado - certificado)
    return `$${saldo.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const P = isMobile ? '20px' : '28px'

  const colColors = {
    asignado:   theme.colors.accent.green,
    modificado: theme.colors.accent.gold,
    codificado: ACCENT,
    certificado: theme.colors.accent.teal,
    saldo:      theme.colors.accent.red,
  }

  return (
    <div style={{ background: theme.colors.dark['900'], minHeight: '100%', padding: P, fontFamily: theme.typography.fontFamily }}>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
          Cédula Presupuestaria — Datos
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>Visualiza los items con sus valores financieros</p>
      </div>

      {/* Filters */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Filter size={14} style={{ color: MUTED }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filtros</span>
          {pagination && <span style={{ marginLeft: 'auto', fontSize: '12px', color: MUTED }}>{pagination.total || 0} registros</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={LABEL_S}>Por Página</label>
            <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1) }} style={{ ...INPUT_S }}>
              {[25, 50, 100, 200].map(n => <option key={n} value={n} style={{ background: CARD }}>{n} registros</option>)}
            </select>
          </div>
          <form onSubmit={handleSearch} style={{ display: 'contents' }}>
            <div>
              <label style={LABEL_S}>Buscar</label>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Código o descripción..." style={{ ...INPUT_S, paddingLeft: '28px' }} />
              </div>
            </div>
            <button
              type="submit"
              style={{ padding: '8px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily, whiteSpace: 'nowrap', alignSelf: 'flex-end' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e90d4' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT }}
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, overflow: 'hidden', marginBottom: '14px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>Cargando datos...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>No hay datos disponibles</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1100px' }}>
              <thead>
                <tr style={{ background: ELEV, borderBottom: `1px solid ${BORDER}` }}>
                  {['Programa', 'Actividad', 'Fuente', 'Item', 'Descripción del Item', 'Asignado', 'Modificado', 'Codificado', 'Certificado', 'Saldo Disponible'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i >= 5 ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id_item || idx} style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = ELEV }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '9px 12px', color: MUTED, fontFamily: 'monospace', fontSize: '11px' }}>{item.cod_programa || '—'}</td>
                    <td style={{ padding: '9px 12px', color: MUTED, fontFamily: 'monospace', fontSize: '11px' }}>{(item.cod_actividad || '—').slice(-3)}</td>
                    <td style={{ padding: '9px 12px', color: MUTED, fontFamily: 'monospace', fontSize: '11px' }}>{item.cod_fuente || '—'}</td>
                    <td style={{ padding: '9px 12px', color: ACCENT, fontWeight: 700, fontFamily: 'monospace', fontSize: '11px' }}>{item.cod_item}</td>
                    <td style={{ padding: '9px 12px', color: TEXT, maxWidth: '200px', whiteSpace: 'normal' }}>{item.nombre_item}</td>
                    <td style={{ padding: '9px 12px', color: colColors.asignado, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.asignado)}</td>
                    <td style={{ padding: '9px 12px', color: colColors.modificado, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.modificado)}</td>
                    <td style={{ padding: '9px 12px', color: colColors.codificado, textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency((parseFloat(item.asignado) || 0) + (parseFloat(item.modificado) || 0))}
                    </td>
                    <td style={{ padding: '9px 12px', color: colColors.certificado, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.certificado)}</td>
                    <td style={{ padding: '9px 12px', color: colColors.saldo, textAlign: 'right', fontWeight: 700 }}>{calcularSaldoDisponible(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (pagination.last_page > 1) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: MUTED }}>
            Página {pagination.current_page} de {pagination.last_page} ({pagination.total} registros)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: page === 1 ? ELEV : ACCENT, color: page === 1 ? MUTED : '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: page === 1 ? 'default' : 'pointer', fontSize: '13px', opacity: page === 1 ? 0.5 : 1, fontFamily: theme.typography.fontFamily }}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={page === pagination.last_page}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: page === pagination.last_page ? ELEV : ACCENT, color: page === pagination.last_page ? MUTED : '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: page === pagination.last_page ? 'default' : 'pointer', fontSize: '13px', opacity: page === pagination.last_page ? 0.5 : 1, fontFamily: theme.typography.fontFamily }}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
