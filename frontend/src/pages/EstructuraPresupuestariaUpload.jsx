import { useState, useEffect } from "react"
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../config/theme'
import { Upload, FileText, CheckCircle, AlertCircle, BarChart3, Layers, GitBranch, Activity, Package } from "lucide-react"

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

export default function EstructuraPresupuestariaUpload() {
  const { token } = useAuth()
  const [file,           setFile]           = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)
  const [success,        setSuccess]        = useState(false)
  const [summary,        setSummary]        = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768)

  useEffect(() => {
    if (token) fetchSummary()
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [token])

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/estructura-presupuestaria/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.status === 'success' || data.success) setSummary(data.data || data)
    } catch (err) {
      console.error(err)
    } finally {
      setSummaryLoading(false)
    }
  }

  const validateFile = (f) => {
    if (f && f.name.endsWith('.csv')) { setFile(f); setError(null); return true }
    setError('Por favor selecciona un archivo CSV válido'); setFile(null); return false
  }

  const handleFileChange = (e) => { const f = e.target.files?.[0]; if (f) validateFile(f) }

  const uploadFile = async (fileToUpload) => {
    setLoading(true); setError(null); setSuccess(false)
    try {
      const formData = new FormData()
      formData.append('csv_file', fileToUpload)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/estructura-presupuestaria/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success || data.status === 'success') {
        setSuccess(true); setFile(null); setShowUploadForm(false)
        setTimeout(() => setSuccess(false), 5000)
        fetchSummary()
      } else {
        setError(data.message || 'Error al cargar el archivo')
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally { setLoading(false) }
  }

  const handleUpload = (e) => { e.preventDefault(); if (file) uploadFile(file) }

  const P = isMobile ? '20px' : '28px'
  const summaryItems = summary ? [
    { label: 'Programas',    value: summary.programas_count    || 0, icon: <BarChart3 size={18} />,  color: ACCENT },
    { label: 'Subprogramas', value: summary.subprogramas_count || 0, icon: <Layers size={18} />,     color: theme.colors.accent.teal },
    { label: 'Proyectos',    value: summary.proyectos_count    || 0, icon: <GitBranch size={18} />,  color: theme.colors.accent.gold },
    { label: 'Actividades',  value: summary.actividades_count  || 0, icon: <Activity size={18} />,   color: theme.colors.accent.green },
    { label: 'Items',        value: summary.items_count        || 0, icon: <Package size={18} />,    color: theme.colors.accent.red },
  ] : []

  return (
    <div style={{ background: theme.colors.dark['900'], minHeight: '100%', padding: P, fontFamily: theme.typography.fontFamily }}>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
          Cargar Estructura Presupuestaria
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>Importar datos presupuestarios desde archivo CSV</p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.35)', borderRadius: theme.border.radiusMd, padding: '10px 14px', marginBottom: '16px', color: '#ff6b7a', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: theme.border.radiusMd, padding: '10px 14px', marginBottom: '16px', color: '#34d399', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <CheckCircle size={15} /> Archivo cargado exitosamente
        </div>
      )}

      {/* Upload card */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '24px', marginBottom: '20px' }}>
        {!showUploadForm ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: theme.border.radiusMd, background: `${ACCENT}1a`, border: `1px solid ${ACCENT}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: ACCENT }}>
              <Upload size={24} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: TEXT }}>Importar Archivo CSV</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: MUTED }}>Carga un archivo CSV con la estructura presupuestaria</p>
            <button
              onClick={() => setShowUploadForm(true)}
              style={{ padding: '9px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily, transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e90d4' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT }}
            >
              Seleccionar Archivo
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label htmlFor="file-input" style={{
              border: `2px dashed ${ACCENT}55`,
              borderRadius: theme.border.radiusMd,
              padding: '28px 20px',
              textAlign: 'center',
              background: `${ACCENT}08`,
              cursor: 'pointer',
              display: 'block',
              transition: 'all 0.15s ease',
            }}>
              <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} id="file-input" />
              <FileText size={32} style={{ color: ACCENT, margin: '0 auto 10px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: file ? TEXT : MUTED }}>
                {file ? file.name : 'Haz clic para seleccionar un archivo CSV'}
              </p>
              {!file && <p style={{ margin: '4px 0 0', fontSize: '12px', color: MUTED }}>Solo archivos .csv</p>}
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="submit" disabled={!file || loading}
                style={{ padding: '9px 20px', background: (!file || loading) ? ELEV : ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: (!file || loading) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, opacity: (!file || loading) ? 0.6 : 1, fontFamily: theme.typography.fontFamily }}
              >
                {loading ? 'Cargando...' : 'Subir Archivo'}
              </button>
              <button
                type="button" onClick={() => { setShowUploadForm(false); setFile(null); setError(null) }}
                style={{ padding: '9px 20px', background: ELEV, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontFamily: theme.typography.fontFamily }}
                onMouseEnter={(e) => { e.currentTarget.style.color = TEXT }}
                onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Summary */}
      {summaryLoading ? (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
          Cargando resumen...
        </div>
      ) : summaryItems.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Resumen Actual
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '10px' }}>
            {summaryItems.map((item, idx) => (
              <div key={idx} style={{ background: ELEV, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ color: item.color, display: 'flex' }}>{item.icon}</span>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: MUTED }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEXT }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
