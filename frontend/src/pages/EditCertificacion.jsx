import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Check, AlertCircle, Edit2 } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const CARD   = 'rgba(255,255,255,0.97)'
const BORDER = 'rgba(46,108,164,0.14)'
const BG     = '#f8fafd'
const ACCENT = '#2e6ca4'
const GREEN  = '#059669'
const RED    = '#b91c1c'
const GOLD   = '#d97706'
const TEXT   = '#1a3a5c'
const MUTED  = '#5a7a9f'

const INPUT = {
  width: '100%', padding: '8px 11px', background: BG,
  border: '1px solid rgba(46,108,164,0.22)', color: TEXT,
  borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px',
  fontFamily: 'var(--font-primary)', outline: 'none',
}

const LABEL = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: MUTED, marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.05em',
}

const FIELD = { marginBottom: '14px' }

const focusIn  = e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }
const focusOut = e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }

export default function EditCertificacion({ certId, onClose, onSaved }) {
  const [form,      setForm]      = useState(null)
  const [items,     setItems]     = useState([])
  const [entidades, setEntidades] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [itemMsg,   setItemMsg]   = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const token = Cookies.get("auth_token")
        const [certRes, entRes] = await Promise.all([
          axios.get(`${API_BASE}/certificacion/${certId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/certificacion/entidades-requirientes`),
        ])
        const d = certRes.data.data
        setForm({
          descripcion:            d.descripcion            || "",
          unid_ejecutora:         d.unid_ejecutora          || "",
          des_u_ejecutora:        d.des_u_ejecutora         || "",
          clase_registro:         d.clase_registro          || "",
          clase_gasto:            d.clase_gasto             || "",
          tipo_doc_respaldo:      d.tipo_doc_respaldo       || "",
          clase_doc_respaldo:     d.clase_doc_respaldo      || "",
          seccion_memorando:      d.seccion_memorando       || "",
          estado:                 d.estado                  || "APROBADO",
          id_entidad_requiriente: d.id_entidad_requiriente ? String(d.id_entidad_requiriente) : "",
        })
        setItems((d.items || []).map(it => ({ ...it, montoEdit: String(it.monto ?? "") })))
        setEntidades(entRes.data.data)
      } catch { setError("No se pudo cargar el certificado.") }
      finally { setLoading(false) }
    })()
  }, [certId])

  const handleSave = async () => {
    if (!form.descripcion?.trim())     return setError("Descripción es requerida")
    if (!form.unid_ejecutora?.trim())  return setError("Unidad Ejecutora es requerida")
    if (!form.des_u_ejecutora?.trim()) return setError("Descripción Unidad Ejecutora es requerida")
    if (!form.id_entidad_requiriente)  return setError("Entidad Requiriente es requerida")
    setSaving(true); setError("")
    try {
      const token = Cookies.get("auth_token")
      await axios.put(`${API_BASE}/certificacion/${certId}`, form, { headers: { Authorization: `Bearer ${token}` } })
      onSaved(); onClose()
    } catch (err) { setError(err.response?.data?.message || "Error al guardar") }
    finally { setSaving(false) }
  }

  const handleGuardarMonto = async (it) => {
    const monto = parseFloat(it.montoEdit)
    if (!it.montoEdit || isNaN(monto) || monto <= 0) { setItemMsg("El monto debe ser mayor a 0"); return }
    try {
      const token = Cookies.get("auth_token")
      const verfRes = await axios.get(`${API_BASE}/certificacion/verificar-monto/${it.id_item}/${it.id_fuente}`)
      if (verfRes.data.success) {
        const tope = verfRes.data.data.disponible_final + parseFloat(it.monto)
        if (monto > tope) { setItemMsg(`Máximo: $${tope.toLocaleString("es-EC", { minimumFractionDigits: 2 })}`); return }
      }
      await axios.patch(`${API_BASE}/certificacion/${certId}/item/${it.id_certificacion_item}`, { monto }, { headers: { Authorization: `Bearer ${token}` } })
      setItems(prev => prev.map(i => i.id_certificacion_item === it.id_certificacion_item ? { ...i, monto, montoEdit: String(monto) } : i))
      setItemMsg("Monto actualizado"); setTimeout(() => setItemMsg(""), 2500)
    } catch (err) { setItemMsg(err.response?.data?.message || "Error al actualizar monto") }
  }

  const handleEliminarItem = async (it) => {
    if (!confirm(`¿Eliminar el item "${it.item?.nombre_item ?? it.id_item}"?`)) return
    try {
      const token = Cookies.get("auth_token")
      await axios.delete(`${API_BASE}/certificacion/${certId}/item/${it.id_certificacion_item}`, { headers: { Authorization: `Bearer ${token}` } })
      setItems(prev => prev.filter(i => i.id_certificacion_item !== it.id_certificacion_item))
      setItemMsg("Item eliminado"); setTimeout(() => setItemMsg(""), 2000)
    } catch (err) { setItemMsg(err.response?.data?.message || "Error al eliminar item") }
  }

  const totalItems = items.reduce((s, i) => s + parseFloat(i.monto || 0), 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,25,47,0.50)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        onClick={e => e.stopPropagation()}
        style={{ background: CARD, border: '1px solid rgba(255,255,255,0.95)', borderRadius: '20px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(10,25,47,0.25)', fontFamily: 'var(--font-primary)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit2 size={16} color="#54b3e0" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Editar Certificado</span>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.10)', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} />
          </motion.button>
        </div>

        <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1 }}>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: RED, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><AlertCircle size={14} /> <span>{error}</span></div>
                <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: RED, cursor: 'pointer' }}><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div style={{ color: MUTED, textAlign: 'center', padding: '48px', fontSize: '13px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid rgba(46,108,164,0.15)', borderTopColor: ACCENT, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              Cargando...
            </div>
          ) : form && (
            <>
              {/* Datos Generales */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${BORDER}`, paddingBottom: '8px', marginBottom: '16px' }}>
                  Datos Generales
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  {[
                    { label: 'Descripción General *',         key: 'descripcion' },
                    { label: 'Sección / Memorando',           key: 'seccion_memorando' },
                    { label: 'Unidad Ejecutora *',            key: 'unid_ejecutora' },
                    { label: 'Descripción Unidad Ejecutora *', key: 'des_u_ejecutora' },
                    { label: 'Clase de Registro',             key: 'clase_registro' },
                    { label: 'Clase de Gasto',                key: 'clase_gasto' },
                    { label: 'Tipo de Documento Respaldo',    key: 'tipo_doc_respaldo' },
                    { label: 'Clase de Documento Respaldo',   key: 'clase_doc_respaldo' },
                  ].map(({ label, key }) => (
                    <div key={key} style={FIELD}>
                      <label style={LABEL}>{label}</label>
                      <input style={INPUT} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  ))}
                  <div style={{ ...FIELD, gridColumn: 'span 2' }}>
                    <label style={LABEL}>Entidad Requiriente *</label>
                    <select style={{ ...INPUT, cursor: 'pointer' }} value={form.id_entidad_requiriente}
                      onChange={e => setForm({ ...form, id_entidad_requiriente: e.target.value })}
                      onFocus={focusIn} onBlur={focusOut}
                    >
                      <option value="">-- Seleccionar --</option>
                      {entidades.map(en => (
                        <option key={en.id_entidad_requiriente} value={String(en.id_entidad_requiriente)}>{en.nombre_entidad}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${BORDER}`, paddingBottom: '8px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Items del Certificado
                  </div>
                  {itemMsg && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '12px', fontWeight: 600, color: itemMsg.startsWith('Error') || itemMsg.startsWith('Máximo') || itemMsg.startsWith('El monto') ? RED : GREEN }}>
                      {itemMsg}
                    </motion.span>
                  )}
                </div>

                {items.length === 0 ? (
                  <div style={{ color: MUTED, fontSize: '13px', padding: '20px', background: BG, borderRadius: '10px', textAlign: 'center', border: `1px solid ${BORDER}` }}>Sin items</div>
                ) : (
                  <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                    <table className="ueb-table" style={{ minWidth: '700px', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          {['PG','SP','PY','ACT','ITEM','UBG','FTE','ORG','N.Prest','Descripción','Monto',''].map(h => (
                            <th key={h} style={{ textAlign: h === 'Monto' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it) => (
                          <tr key={it.id_certificacion_item}>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{it.programa?.cod_programa ?? '-'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{String(it.subprograma?.cod_subprograma ?? '').slice(-2) || '-'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{String(it.proyecto?.cod_proyecto ?? '').slice(-3) || '-'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{String(it.actividad?.cod_actividad ?? '').slice(-3) || '-'}</td>
                            <td style={{ fontFamily: 'monospace', color: ACCENT, fontWeight: 700, fontSize: '11px' }}>{it.item?.cod_item ?? '-'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{it.ubicacion?.cod_ubicacion ?? '-'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{it.fuente?.cod_fuente ?? '-'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{it.organismo?.cod_organismo ?? '-'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{it.naturaleza?.cod_naturaleza ?? '-'}</td>
                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.item?.nombre_item ?? '-'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <input type="number" step="0.01" value={it.montoEdit}
                                onChange={e => setItems(prev => prev.map(i => i.id_certificacion_item === it.id_certificacion_item ? { ...i, montoEdit: e.target.value } : i))}
                                style={{ width: '90px', padding: '4px 6px', background: BG, border: '1px solid rgba(46,108,164,0.22)', color: GREEN, borderRadius: '6px', fontSize: '12px', textAlign: 'right', fontFamily: 'var(--font-primary)', outline: 'none' }}
                                onFocus={focusIn} onBlur={focusOut}
                              />
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => handleGuardarMonto(it)} title="Guardar monto"
                                  style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.30)', borderRadius: '6px', color: GREEN, cursor: 'pointer' }}
                                >
                                  <Check size={12} />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEliminarItem(it)} title="Eliminar item"
                                  style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(185,28,28,0.10)', border: '1px solid rgba(185,28,28,0.25)', borderRadius: '6px', color: RED, cursor: 'pointer' }}
                                >
                                  <Trash2 size={12} />
                                </motion.button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: `2px solid ${BORDER}`, background: 'rgba(240,244,248,0.80)' }}>
                          <td colSpan={10} style={{ padding: '8px 14px', textAlign: 'right', color: MUTED, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Total</td>
                          <td style={{ padding: '8px 14px', textAlign: 'right', color: GREEN, fontWeight: 700, fontSize: '13px' }}>
                            ${totalItems.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${BORDER}` }}>
                <motion.button whileHover={!saving ? { scale: 1.02, boxShadow: '0 8px 24px rgba(26,58,92,0.30)' } : {}} whileTap={!saving ? { scale: 0.98 } : {}}
                  onClick={handleSave} disabled={saving}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: saving ? 'rgba(26,58,92,0.08)' : 'linear-gradient(135deg, #1a3a5c, #2e6ca4)', color: saving ? MUTED : '#fff', border: 'none', borderRadius: '10px', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-primary)', boxShadow: saving ? 'none' : '0 4px 16px rgba(26,58,92,0.25)', transition: 'all 0.18s ease' }}
                >
                  <Save size={15} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                </motion.button>
                <button onClick={onClose}
                  style={{ padding: '10px 20px', background: 'rgba(26,58,92,0.06)', color: MUTED, border: '1px solid rgba(26,58,92,0.12)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font-primary)', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.color = TEXT }}
                  onMouseLeave={e => { e.currentTarget.style.color = MUTED }}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
