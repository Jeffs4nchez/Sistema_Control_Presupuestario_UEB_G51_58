import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet, List, DollarSign, X } from "lucide-react"

const CARD   = 'rgba(255,255,255,0.90)'
const BORDER = 'rgba(46,108,164,0.14)'
const BG     = '#f8fafd'
const ACCENT = '#2e6ca4'
const GREEN  = '#059669'
const RED    = '#b91c1c'
const GOLD   = '#d97706'
const TEXT   = '#1a3a5c'
const MUTED  = '#5a7a9f'

export default function CedulaPresupuestariaUpload() {
  const [file,           setFile]           = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)
  const [success,        setSuccess]        = useState(false)
  const [summary,        setSummary]        = useState(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768)

  useEffect(() => {
    fetchSummary()
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const fetchSummary = async () => {
    try {
      const token = Cookies.get("auth_token")
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/cedula-presupuestaria/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setSummary(data.data)
    } catch (err) { console.error(err) }
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
      const token = Cookies.get("auth_token")
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/cedula-presupuestaria/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true); setFile(null); setShowUploadForm(false)
        setTimeout(() => setSuccess(false), 5000); fetchSummary()
      } else { setError(data.message || 'Error al cargar el archivo') }
    } catch (err) { setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error')) }
    finally { setLoading(false) }
  }

  const handleUpload = (e) => { e.preventDefault(); if (file) uploadFile(file) }

  const P = isMobile ? '20px' : '28px'
  const summaryItems = summary ? [
    { label: 'Registros',       value: summary.registros_count      || 0, icon: <List size={20} />,            color: ACCENT },
    { label: 'Certificaciones', value: summary.certificaciones_count || 0, icon: <FileSpreadsheet size={20} />, color: GREEN  },
    { label: 'Monto Total',     value: '$' + (summary.monto_total   || 0), icon: <DollarSign size={20} />,      color: GOLD   },
  ] : []

  return (
    <div style={{ minHeight: '100%', background: 'var(--page-bg)', padding: P, fontFamily: 'var(--font-primary)' }}>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
          Cargar Cédula Presupuestaria
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>Importar datos desde archivo CSV</p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: RED, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><AlertCircle size={14} /> {error}</div>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: RED, cursor: 'pointer' }}><X size={14} /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.22)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: GREEN, fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <CheckCircle size={14} /> Archivo cargado exitosamente
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '28px', marginBottom: '20px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(26,58,92,0.10)' }}
      >
        <AnimatePresence mode="wait">
          {!showUploadForm ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(46,108,164,0.10)', border: '1px solid rgba(46,108,164,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <Upload size={28} color={ACCENT} />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: TEXT }}>Importar Archivo CSV</h2>
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: MUTED }}>Carga un archivo CSV con la cédula presupuestaria</p>
              <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(26,58,92,0.30)' }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowUploadForm(true)}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-primary)', boxShadow: '0 4px 16px rgba(26,58,92,0.25)' }}
              >
                Seleccionar Archivo
              </motion.button>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <label htmlFor="cedula-file-input"
                style={{ border: '2px dashed rgba(46,108,164,0.35)', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', background: 'rgba(46,108,164,0.05)', cursor: 'pointer', display: 'block', transition: 'all 0.18s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,108,164,0.08)'; e.currentTarget.style.borderColor = 'rgba(46,108,164,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(46,108,164,0.05)'; e.currentTarget.style.borderColor = 'rgba(46,108,164,0.35)' }}
              >
                <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} id="cedula-file-input" />
                <FileText size={36} style={{ color: ACCENT, margin: '0 auto 12px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: file ? TEXT : MUTED }}>
                  {file ? file.name : 'Haz clic para seleccionar un archivo CSV'}
                </p>
                {file && <p style={{ margin: '6px 0 0', fontSize: '12px', color: GREEN }}>✓ Archivo seleccionado</p>}
              </label>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <motion.button whileHover={file && !loading ? { scale: 1.02, boxShadow: '0 8px 24px rgba(26,58,92,0.30)' } : {}} whileTap={file && !loading ? { scale: 0.98 } : {}}
                  type="submit" disabled={!file || loading}
                  style={{ padding: '10px 24px', background: (!file || loading) ? 'rgba(26,58,92,0.08)' : 'linear-gradient(135deg, #1a3a5c, #2e6ca4)', color: (!file || loading) ? MUTED : '#fff', border: 'none', borderRadius: '10px', cursor: (!file || loading) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-primary)', opacity: (!file || loading) ? 0.7 : 1, boxShadow: (!file || loading) ? 'none' : '0 4px 16px rgba(26,58,92,0.25)', transition: 'all 0.18s ease' }}
                >
                  {loading ? 'Cargando...' : 'Subir Archivo'}
                </motion.button>
                <button type="button" onClick={() => { setShowUploadForm(false); setFile(null); setError(null) }}
                  style={{ padding: '10px 20px', background: 'rgba(26,58,92,0.06)', color: MUTED, border: '1px solid rgba(26,58,92,0.12)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-primary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = TEXT }}
                  onMouseLeave={e => { e.currentTarget.style.color = MUTED }}
                >
                  Cancelar
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {summary && summaryItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '22px', backdropFilter: 'blur(12px)', boxShadow: '0 2px 16px rgba(26,58,92,0.06)' }}
        >
          <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Resumen Actual</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
            {summaryItems.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.06 }}
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', textAlign: 'center', borderTop: `3px solid ${item.color}` }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: item.color }}>
                  {item.icon}
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: MUTED, fontWeight: 600 }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: TEXT }}>{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
