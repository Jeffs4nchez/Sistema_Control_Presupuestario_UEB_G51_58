import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle, AlertCircle, Trash2, ClipboardList, Package, X, Building2 } from 'lucide-react'

const CARD   = 'rgba(255,255,255,0.90)'
const BORDER = 'rgba(46,108,164,0.14)'
const BG     = '#f8fafd'
const ACCENT = '#2e6ca4'
const GREEN  = '#059669'
const RED    = '#b91c1c'
const GOLD   = '#d97706'
const TEXT   = '#1a3a5c'
const MUTED  = '#5a7a9f'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const INPUT_S = {
  width: '100%', padding: '8px 10px',
  background: BG, border: '1px solid rgba(46,108,164,0.22)',
  borderRadius: '8px', color: TEXT, fontSize: '13px',
  fontFamily: 'var(--font-primary)', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
}

const LABEL_S = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: MUTED, marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

const SECTION_S = {
  background: CARD, border: `1px solid ${BORDER}`,
  borderRadius: '12px', padding: '20px', marginBottom: '16px',
  backdropFilter: 'blur(12px)', boxShadow: '0 2px 16px rgba(26,58,92,0.06)',
}

const focusIn  = e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }
const focusOut = e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }

export default function CrearCertificacion({ onCreated }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState("")
  const [currentCertificadoId, setCurrentCertificadoId] = useState(null)

  const [certificado, setCertificado] = useState({
    descripcion: "", unid_ejecutora: "", des_u_ejecutora: "", clase_registro: "",
    clase_gasto: "", tipo_doc_respaldo: "", clase_doc_respaldo: "",
    seccion_memorando: "", id_entidad_requiriente: "", id_cedula_presupuestaria: "",
  })

  const [programas,    setProgramas]    = useState([])
  const [subprogramas, setSubprogramas] = useState([])
  const [proyectos,    setProyectos]    = useState([])
  const [actividades,  setActividades]  = useState([])
  const [fuentes,      setFuentes]      = useState([])
  const [ubicaciones,  setUbicaciones]  = useState([])
  const [items,        setItems]        = useState([])
  const [organismos,   setOrganismos]   = useState([])
  const [naturalezas,  setNaturalezas]  = useState([])
  const [entidades,    setEntidades]    = useState([])
  const [cedulas,      setCedulas]      = useState([])

  const [itemForm, setItemForm] = useState({
    id_programa: "", id_subprograma: "", id_proyecto: "", id_actividad: "",
    id_fuente: "", id_ubicacion: "", id_item: "", id_organismo: "", id_naturaleza: "",
    monto: "", descripcion: "",
  })

  const [itemsAgregados,  setItemsAgregados]  = useState([])
  const [montoDisponible, setMontoDisponible] = useState(null)

  const [showModalEntidad, setShowModalEntidad] = useState(false)
  const [showModalCedula,  setShowModalCedula]  = useState(false)
  const [formEntidad, setFormEntidad] = useState({
    nombre_entidad: "", responsable_entidad: "", correo_institucional: "",
  })

  useEffect(() => { cargarDatosIniciales() }, [])

  const cargarDatosIniciales = async () => {
    try {
      const [progRes, orgRes, natRes, entRes, cedActualRes] = await Promise.all([
        axios.get(`${API_BASE}/certificacion/programas`),
        axios.get(`${API_BASE}/certificacion/organismos`),
        axios.get(`${API_BASE}/certificacion/naturalezas`),
        axios.get(`${API_BASE}/certificacion/entidades-requirientes`),
        axios.get(`${API_BASE}/certificacion/cedula-actual`),
      ])
      setProgramas(progRes.data.data)
      setOrganismos(orgRes.data.data)
      setNaturalezas(natRes.data.data)
      setEntidades(entRes.data.data)
      const cedulaActual = cedActualRes.data.data
      setCertificado(prev => ({ ...prev, id_cedula_presupuestaria: cedulaActual.id_cedula_presupuestaria }))
    } catch (err) {
      console.error("Error:", err)
      setError("Error al cargar datos iniciales")
    }
  }

  const handleCrearEntidad = async (e) => {
    e.preventDefault()
    try {
      const token = Cookies.get("auth_token")
      const res = await axios.post(`${API_BASE}/certificacion/entidades-requirientes`, formEntidad, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEntidades([...entidades, res.data.data])
      setCertificado({ ...certificado, id_entidad_requiriente: res.data.data.id_entidad_requiriente })
      setFormEntidad({ nombre_entidad: "", responsable_entidad: "", correo_institucional: "" })
      setShowModalEntidad(false)
      setSuccess("Entidad creada exitosamente")
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear entidad")
    }
  }

  const handleCrearCedula = async (e) => {
    e.preventDefault()
    try {
      const token = Cookies.get("auth_token")
      const res = await axios.post(`${API_BASE}/certificacion/cedulas-presupuestarias`, formCedula, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCedulas([...cedulas, res.data.data])
      setCertificado({ ...certificado, id_cedula_presupuestaria: res.data.data.id_cedula_presupuestaria })
      setShowModalCedula(false)
      setSuccess("Cédula creada exitosamente")
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear cédula")
    }
  }

  const handleProgramaChange = async (e) => {
    const id = e.target.value
    setItemForm({ ...itemForm, id_programa: id, id_subprograma: "", id_proyecto: "", id_actividad: "", id_ubicacion: "", id_item: "" })
    setSubprogramas([]); setProyectos([]); setActividades([]); setUbicaciones([]); setItems([])
    if (id) {
      try { const res = await axios.get(`${API_BASE}/certificacion/subprogramas/${id}`); setSubprogramas(res.data.data) }
      catch (err) { console.error("Error:", err) }
    }
  }

  const handleSubprogramaChange = async (e) => {
    const id = e.target.value
    setItemForm({ ...itemForm, id_subprograma: id, id_proyecto: "", id_actividad: "", id_ubicacion: "", id_item: "" })
    setProyectos([]); setActividades([]); setUbicaciones([]); setItems([])
    if (id) {
      try { const res = await axios.get(`${API_BASE}/certificacion/proyectos/${id}`); setProyectos(res.data.data) }
      catch (err) { console.error("Error:", err) }
    }
  }

  const handleProyectoChange = async (e) => {
    const id = e.target.value
    setItemForm({ ...itemForm, id_proyecto: id, id_actividad: "", id_ubicacion: "", id_item: "" })
    setActividades([]); setUbicaciones([]); setItems([])
    if (id) {
      try { const res = await axios.get(`${API_BASE}/certificacion/actividades/${id}`); setActividades(res.data.data) }
      catch (err) { console.error("Error:", err) }
    }
  }

  const handleActividadChange = async (e) => {
    const id = e.target.value
    setItemForm({ ...itemForm, id_actividad: id, id_fuente: "", id_ubicacion: "", id_item: "" })
    setFuentes([]); setUbicaciones([]); setItems([])
    if (id) {
      try {
        const [fRes, uRes] = await Promise.all([
          axios.get(`${API_BASE}/certificacion/fuentes/${id}`),
          axios.get(`${API_BASE}/certificacion/ubicaciones/${id}`),
        ])
        setFuentes(fRes.data.data); setUbicaciones(uRes.data.data)
      } catch (err) { console.error("Error:", err) }
    }
  }

  const handleUbicacionChange = async (e) => {
    const id = e.target.value
    setItemForm({ ...itemForm, id_ubicacion: id, id_item: "" })
    setItems([])
    if (id && itemForm.id_actividad && itemForm.id_fuente) {
      try { const res = await axios.get(`${API_BASE}/certificacion/items/${itemForm.id_actividad}/${id}/${itemForm.id_fuente}`); setItems(res.data.data) }
      catch (err) { console.error("Error:", err) }
    }
  }

  const handleFuenteChange = async (e) => {
    const id = e.target.value
    setItemForm({ ...itemForm, id_fuente: id, id_item: "" })
    setItems([]); setMontoDisponible(null)
    if (id && itemForm.id_actividad && itemForm.id_ubicacion) {
      try { const res = await axios.get(`${API_BASE}/certificacion/items/${itemForm.id_actividad}/${itemForm.id_ubicacion}/${id}`); setItems(res.data.data) }
      catch (err) { console.error("Error:", err) }
    }
  }

  const obtenerMontoDisponible = async (idItem, idFuente) => {
    try {
      const res = await axios.get(`${API_BASE}/certificacion/verificar-monto/${idItem}/${idFuente}`)
      if (res.data.success) {
        setMontoDisponible(res.data.data)
        if (!res.data.data.puede_certificar) {
          setError(`Este item no tiene saldo disponible. Codificado: $${res.data.data.codificado.toFixed(2)}, Certificado: $${res.data.data.certificado_actual.toFixed(2)}`)
        } else { setError("") }
      } else {
        setError(res.data.message || "Error al verificar monto disponible")
        setMontoDisponible(null)
      }
    } catch (err) {
      console.error("Error:", err)
      if (err.response?.status === 404) { setMontoDisponible(null) }
      else { setError(err.response?.data?.message || "Error al obtener información presupuestaria"); setMontoDisponible(null) }
    }
  }

  const validarCertificado = () => {
    const { descripcion, unid_ejecutora, des_u_ejecutora, clase_registro, clase_gasto, tipo_doc_respaldo, clase_doc_respaldo, id_entidad_requiriente } = certificado
    if (!descripcion?.trim())        return "Descripción General es requerida"
    if (!unid_ejecutora?.trim())     return "Unidad Ejecutora es requerida"
    if (!des_u_ejecutora?.trim())    return "Descripción Unidad Ejecutora es requerida"
    if (!clase_registro?.trim())     return "Clase de Registro es requerida"
    if (!clase_gasto?.trim())        return "Clase de Gasto es requerida"
    if (!tipo_doc_respaldo?.trim())  return "Tipo de Documento Respaldo es requerido"
    if (!clase_doc_respaldo?.trim()) return "Clase de Documento Respaldo es requerida"
    if (!id_entidad_requiriente)     return "Entidad Requiriente es requerida"
    return null
  }

  const validarItem = () => {
    const { id_programa, id_subprograma, id_proyecto, id_actividad, id_fuente, id_ubicacion, id_item, id_organismo, id_naturaleza, monto } = itemForm
    if (!id_programa)    return "Programa es requerido"
    if (!id_subprograma) return "Subprograma es requerido"
    if (!id_proyecto)    return "Proyecto es requerido"
    if (!id_actividad)   return "Actividad es requerida"
    if (!id_fuente)      return "Fuente es requerida"
    if (!id_ubicacion)   return "Ubicación es requerida"
    if (!id_item)        return "Item es requerido"
    if (!id_organismo)   return "Organismo es requerido"
    if (!id_naturaleza)  return "Naturaleza es requerida"
    const montoNum = parseFloat(monto)
    if (!monto || isNaN(montoNum) || montoNum <= 0) return "Monto debe ser mayor a 0"
    if (montoNum > 999999999999.99) return "Monto demasiado grande"
    return null
  }

  const handleCrearCertificado = async (e) => {
    e.preventDefault()
    setLoading(true); setError(""); setSuccess("")
    const errCert = validarCertificado()
    if (errCert) { setError(errCert); setLoading(false); return }
    if (itemsAgregados.length === 0) { setError("Debes agregar al menos un item al certificado"); setLoading(false); return }
    try {
      const token = Cookies.get("auth_token")
      if (!token) { setError("No hay token de autenticación. Por favor inicia sesión nuevamente"); setLoading(false); return }
      if (token.length !== 64) { setError(`Token inválido (longitud: ${token.length}, esperada: 64)`); setLoading(false); return }
      const dataToSend = {
        descripcion: certificado.descripcion,
        unid_ejecutora: certificado.unid_ejecutora,
        des_u_ejecutora: certificado.des_u_ejecutora,
        clase_registro: certificado.clase_registro,
        clase_gasto: certificado.clase_gasto,
        tipo_doc_respaldo: certificado.tipo_doc_respaldo,
        clase_doc_respaldo: certificado.clase_doc_respaldo,
        seccion_memorando: certificado.seccion_memorando,
        id_entidad_requiriente: parseInt(certificado.id_entidad_requiriente),
        id_cedula_presupuestaria: parseInt(certificado.id_cedula_presupuestaria),
        items: itemsAgregados.map(item => ({
          ...item,
          id_programa: parseInt(item.id_programa),   id_subprograma: parseInt(item.id_subprograma),
          id_proyecto: parseInt(item.id_proyecto),    id_actividad: parseInt(item.id_actividad),
          id_fuente: parseInt(item.id_fuente),        id_ubicacion: parseInt(item.id_ubicacion),
          id_item: parseInt(item.id_item),            id_organismo: parseInt(item.id_organismo),
          id_naturaleza: parseInt(item.id_naturaleza), monto: parseFloat(item.monto),
        })),
      }
      const res = await axios.post(`${API_BASE}/certificacion`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess("Certificado creado exitosamente")
      setTimeout(() => {
        onCreated()
        setCertificado({ descripcion: "", unid_ejecutora: "", des_u_ejecutora: "", clase_registro: "", clase_gasto: "", tipo_doc_respaldo: "", clase_doc_respaldo: "", seccion_memorando: "", id_entidad_requiriente: "", id_cedula_presupuestaria: "" })
        setItemsAgregados([])
        setCurrentCertificadoId(null)
      }, 1500)
    } catch (err) {
      console.error("Error:", err.response?.data)
      setError(err.response?.data?.message || "Error al crear certificado")
    } finally { setLoading(false) }
  }

  const handleAgregarEntidad = async () => {
    if (!formEntidad.nombre_entidad?.trim())       { setError("Nombre de entidad es requerido"); return }
    if (!formEntidad.responsable_entidad?.trim())  { setError("Responsable es requerido"); return }
    if (!formEntidad.correo_institucional?.trim()) { setError("Correo es requerido"); return }
    try {
      const token = Cookies.get("auth_token")
      const res = await axios.post(`${API_BASE}/certificacion/entidades-requirientes`, formEntidad, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const nuevaEntidad = res.data.data
      setEntidades([...entidades, nuevaEntidad])
      setCertificado({ ...certificado, id_entidad_requiriente: nuevaEntidad.id_entidad_requiriente })
      setShowModalEntidad(false)
      setFormEntidad({ nombre_entidad: "", responsable_entidad: "", correo_institucional: "" })
      setSuccess("Entidad agregada exitosamente")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Error al agregar entidad")
    }
  }

  const handleAgregarCedula = async () => {
    setShowModalCedula(false)
    setSuccess("Las cédulas se crean automáticamente (Año actual + 3 años anteriores)")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleAgregarItem = () => {
    const errItem = validarItem()
    if (errItem) { setError(errItem); return }
    if (montoDisponible) {
      const monto = parseFloat(itemForm.monto)
      const disponible = montoDisponible.disponible_final
      if (monto > disponible) {
        setError(`Monto no permitido. Disponible: $${disponible.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        return
      }
      if (disponible <= 0) {
        setError(`Este item no tiene saldo disponible. Codificado: $${montoDisponible.codificado.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        return
      }
    }
    setError("")
    const nuevoItem = {
      id_programa: itemForm.id_programa,   id_subprograma: itemForm.id_subprograma,
      id_proyecto: itemForm.id_proyecto,   id_actividad: itemForm.id_actividad,
      id_fuente: itemForm.id_fuente,       id_ubicacion: itemForm.id_ubicacion,
      id_item: itemForm.id_item,           id_organismo: itemForm.id_organismo,
      id_naturaleza: itemForm.id_naturaleza, monto: itemForm.monto,
      descripcion: itemForm.descripcion,
      programa:    programas.find(p => p.id_programa == itemForm.id_programa),
      subprograma: subprogramas.find(sp => sp.id_subprograma == itemForm.id_subprograma),
      proyecto:    proyectos.find(py => py.id_proyecto == itemForm.id_proyecto),
      actividad:   actividades.find(a => a.id_actividad == itemForm.id_actividad),
      fuente:      fuentes.find(f => f.id_fuente == itemForm.id_fuente),
      ubicacion:   ubicaciones.find(u => u.id_ubicacion == itemForm.id_ubicacion),
      item:        items.find(i => i.id_item == itemForm.id_item),
      organismo:   organismos.find(o => o.id_organismo == itemForm.id_organismo),
      naturaleza:  naturalezas.find(n => n.id_naturaleza == itemForm.id_naturaleza),
    }
    const duplicado = itemsAgregados.some(i => i.id_item === itemForm.id_item && i.id_fuente === itemForm.id_fuente)
    if (duplicado) { setError("Este item ya está agregado al certificado"); return }
    setItemsAgregados([...itemsAgregados, nuevoItem])
    setSuccess("Item agregado correctamente")
    setItemForm({ id_programa: "", id_subprograma: "", id_proyecto: "", id_actividad: "", id_fuente: "", id_ubicacion: "", id_item: "", id_organismo: "", id_naturaleza: "", monto: "", descripcion: "" })
    setMontoDisponible(null)
  }

  const handleRemoverItem = (index) => {
    if (!confirm("¿Eliminar este item?")) return
    setItemsAgregados(itemsAgregados.filter((_, i) => i !== index))
    setSuccess("Item eliminado")
  }

  const certValid  = validarCertificado() === null
  const totalMonto = itemsAgregados.reduce((sum, i) => sum + parseFloat(i.monto || 0), 0)

  const SelectField = ({ label, value, onChange, options, idKey, labelFn, disabled }) => (
    <div>
      <label style={LABEL_S}>{label}</label>
      <select
        value={value} onChange={onChange} disabled={disabled}
        style={{ ...INPUT_S, opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        onFocus={focusIn} onBlur={focusOut}
      >
        <option value="">-- Seleccionar --</option>
        {options.map(o => <option key={o[idKey]} value={o[idKey]}>{labelFn(o)}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-primary)' }}>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: RED, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}</div>
            <button onClick={() => setError("")} style={{ background: 'none', border: 'none', color: RED, cursor: 'pointer', flexShrink: 0 }}><X size={14} /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.22)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: GREEN, fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <CheckCircle size={15} /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form status panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={SECTION_S}>
        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Estado del Formulario</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${certValid ? GREEN : RED}`, borderRadius: '8px', padding: '12px' }}>
            <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: 700, color: certValid ? GREEN : RED }}>
              {certValid ? 'Datos del Certificado OK' : 'Datos Incompletos'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>{validarCertificado() || 'Todos los campos completados'}</p>
          </div>
          <div style={{ background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${itemsAgregados.length > 0 ? GREEN : RED}`, borderRadius: '8px', padding: '12px' }}>
            <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: 700, color: itemsAgregados.length > 0 ? GREEN : RED }}>
              {itemsAgregados.length > 0 ? `Items Agregados (${itemsAgregados.length})` : 'Sin Items'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>
              {itemsAgregados.length > 0 ? `Total: $${totalMonto.toLocaleString("es-ES", { minimumFractionDigits: 2 })}` : 'Agrega al menos 1 item'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Datos del Certificado */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} style={SECTION_S}>
        <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: TEXT, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={14} style={{ color: ACCENT }} />
          Datos del Certificado
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            ['Descripción General *',         'descripcion',        'text', 'Descripción del certificado'],
            ['Sección / Memorando',            'seccion_memorando',  'text', 'Nro. de memorando'],
            ['Unidad Ejecutora *',             'unid_ejecutora',     'text', 'Ej: 001'],
            ['Descripción Unidad Ejecutora *', 'des_u_ejecutora',    'text', 'Nombre de la unidad'],
            ['Clase de Registro *',            'clase_registro',     'text', 'Ej: MODIFICATIVO'],
            ['Clase de Gasto *',               'clase_gasto',        'text', 'Ej: CORRIENTE'],
            ['Tipo Documento Respaldo *',      'tipo_doc_respaldo',  'text', ''],
            ['Clase Documento Respaldo *',     'clase_doc_respaldo', 'text', ''],
          ].map(([lbl, field, type, ph]) => (
            <div key={field}>
              <label style={LABEL_S}>{lbl}</label>
              <input
                type={type} placeholder={ph}
                value={certificado[field]}
                onChange={e => setCertificado({ ...certificado, [field]: e.target.value })}
                style={INPUT_S} onFocus={focusIn} onBlur={focusOut}
              />
            </div>
          ))}

          <div style={{ gridColumn: 'span 2' }}>
            <label style={LABEL_S}>Entidad Requiriente *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={certificado.id_entidad_requiriente}
                onChange={e => setCertificado({ ...certificado, id_entidad_requiriente: e.target.value })}
                style={{ ...INPUT_S }} onFocus={focusIn} onBlur={focusOut}
              >
                <option value="">-- Seleccionar --</option>
                {entidades.map(e => <option key={e.id_entidad_requiriente} value={e.id_entidad_requiriente}>{e.nombre || e.nombre_entidad}</option>)}
              </select>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowModalEntidad(true)}
                style={{ padding: '8px 14px', background: `linear-gradient(135deg, ${GREEN}, #047857)`, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 3px 10px rgba(5,150,105,0.25)' }}
              >
                <Plus size={14} /> Agregar
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Agregar Items */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={SECTION_S}>
        <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: TEXT, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={14} style={{ color: ACCENT }} />
          Agregar Items al Certificado
        </p>

        {/* Cascading selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <SelectField label="Programa *"    value={itemForm.id_programa}    onChange={handleProgramaChange}    options={programas}    idKey="id_programa"    labelFn={p  => `${p.cod_programa} - ${p.nombre_programa}`}     />
          <SelectField label="Subprograma *" value={itemForm.id_subprograma} onChange={handleSubprogramaChange} options={subprogramas} idKey="id_subprograma" labelFn={sp => `${sp.cod_subprograma} - ${sp.nombre_subprograma}`} disabled={!itemForm.id_programa} />
          <SelectField label="Proyecto *"    value={itemForm.id_proyecto}    onChange={handleProyectoChange}    options={proyectos}    idKey="id_proyecto"    labelFn={py => `${py.cod_proyecto} - ${py.nombre_proyecto}`}     disabled={!itemForm.id_subprograma} />
          <SelectField label="Actividad *"   value={itemForm.id_actividad}   onChange={handleActividadChange}   options={actividades}  idKey="id_actividad"  labelFn={a  => `${a.cod_actividad} - ${a.nombre_actividad}`}       disabled={!itemForm.id_proyecto} />
          <SelectField label="Fuente *"      value={itemForm.id_fuente}      onChange={handleFuenteChange}      options={fuentes}      idKey="id_fuente"      labelFn={f  => `${f.cod_fuente} - ${f.nombre_fuente}`}             disabled={!itemForm.id_actividad} />
          <SelectField label="Ubicación *"   value={itemForm.id_ubicacion}   onChange={handleUbicacionChange}   options={ubicaciones}  idKey="id_ubicacion"  labelFn={u  => `${u.cod_ubicacion} - ${u.nombre_ubicacion}`}       disabled={!itemForm.id_actividad} />

          <div>
            <label style={LABEL_S}>Item *</label>
            <select
              value={itemForm.id_item}
              onChange={e => {
                setItemForm({ ...itemForm, id_item: e.target.value })
                setMontoDisponible(null)
                if (e.target.value && itemForm.id_fuente) obtenerMontoDisponible(e.target.value, itemForm.id_fuente)
              }}
              disabled={!itemForm.id_ubicacion || !itemForm.id_fuente}
              style={{ ...INPUT_S, opacity: (!itemForm.id_ubicacion || !itemForm.id_fuente) ? 0.45 : 1, cursor: (!itemForm.id_ubicacion || !itemForm.id_fuente) ? 'not-allowed' : 'pointer' }}
              onFocus={focusIn} onBlur={focusOut}
            >
              <option value="">-- Seleccionar --</option>
              {items.map(i => <option key={i.id_item} value={i.id_item}>{i.cod_item} - {i.nombre_item}</option>)}
            </select>
          </div>

          <SelectField label="Organismo *"  value={itemForm.id_organismo}  onChange={e => setItemForm({ ...itemForm, id_organismo: e.target.value })}  options={organismos}  idKey="id_organismo"  labelFn={o => `${o.cod_organismo} - ${o.nombre_organismo}`}   />
          <SelectField label="Naturaleza *" value={itemForm.id_naturaleza} onChange={e => setItemForm({ ...itemForm, id_naturaleza: e.target.value })} options={naturalezas} idKey="id_naturaleza" labelFn={n => `${n.cod_naturaleza} - ${n.nombre_naturaleza}`} />

          <div>
            <label style={LABEL_S}>Monto *</label>
            <input
              type="number" step="0.01" placeholder="0.00"
              value={itemForm.monto}
              onChange={e => setItemForm({ ...itemForm, monto: e.target.value })}
              style={{ ...INPUT_S, color: GREEN, fontWeight: 600 }}
              onFocus={focusIn} onBlur={focusOut}
            />
          </div>
        </div>

        {/* Selection summary chips */}
        {(itemForm.id_programa || itemForm.id_item) && (
          <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resumen de Selecciones</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                [itemForm.id_programa,    programas.find(p => p.id_programa == itemForm.id_programa),           'Programa'],
                [itemForm.id_subprograma, subprogramas.find(sp => sp.id_subprograma == itemForm.id_subprograma), 'Subprograma'],
                [itemForm.id_proyecto,    proyectos.find(py => py.id_proyecto == itemForm.id_proyecto),          'Proyecto'],
                [itemForm.id_actividad,   actividades.find(a => a.id_actividad == itemForm.id_actividad),        'Actividad'],
                [itemForm.id_fuente,      fuentes.find(f => f.id_fuente == itemForm.id_fuente),                  'Fuente'],
                [itemForm.id_ubicacion,   ubicaciones.find(u => u.id_ubicacion == itemForm.id_ubicacion),        'Ubicación'],
                [itemForm.id_item,        items.find(i => i.id_item == itemForm.id_item),                        'Item'],
                [itemForm.id_organismo,   organismos.find(o => o.id_organismo == itemForm.id_organismo),         'Organismo'],
                [itemForm.id_naturaleza,  naturalezas.find(n => n.id_naturaleza == itemForm.id_naturaleza),      'Naturaleza'],
              ].filter(([val]) => val).map(([, obj, lbl], i) => obj && (
                <div key={i} style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, borderRadius: '6px', padding: '5px 10px', fontSize: '11px' }}>
                  <span style={{ color: MUTED }}>{lbl}: </span>
                  <span style={{ color: ACCENT, fontWeight: 700 }}>{obj[Object.keys(obj).find(k => k.startsWith('cod_'))]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget status */}
        {montoDisponible && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: montoDisponible.disponible_final > 0 ? 'rgba(5,150,105,0.06)' : 'rgba(185,28,28,0.06)', border: `1px solid ${(montoDisponible.disponible_final > 0 ? GREEN : RED)}40`, borderRadius: '10px', padding: '14px', marginBottom: '12px' }}
          >
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado Presupuestario del Item</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: 'Codificado',     value: montoDisponible.codificado,           color: ACCENT, note: '(Asignado + Modificado)' },
                { label: 'Ya Certificado', value: montoDisponible.certificado_actual,    color: GOLD,   note: '(Pendiente de pago)' },
                { label: 'Disponible',     value: montoDisponible.disponible_final,      color: montoDisponible.disponible_final > 0 ? GREEN : RED, note: montoDisponible.disponible_final > 0 ? 'Puedes certificar' : 'Sin saldo', bold: true },
              ].map((s, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: MUTED }}>{s.label}</p>
                  <p style={{ margin: '0 0 2px', fontSize: s.bold ? '15px' : '13px', fontWeight: 700, color: s.color }}>
                    ${s.value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: MUTED }}>{s.note}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {itemForm.id_item && !montoDisponible && (
          <div style={{ background: 'rgba(217,119,6,0.08)', border: `1px solid ${GOLD}40`, borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: GOLD }}>
            Sin información presupuestaria para este item. Verifica el monto antes de agregar.
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(5,150,105,0.30)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAgregarItem}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: `linear-gradient(135deg, ${GREEN}, #047857)`, color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.6 : 1, fontFamily: 'var(--font-primary)', boxShadow: '0 3px 10px rgba(5,150,105,0.22)' }}
        >
          <Plus size={14} /> {loading ? 'Agregando...' : 'Agregar Item'}
        </motion.button>
      </motion.div>

      {/* Items table */}
      {itemsAgregados.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={SECTION_S}>
          <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 700, color: TEXT, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={14} style={{ color: GREEN }} />
            Items del Certificado
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '12px', borderRadius: '8px', border: `1px solid ${BORDER}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
                  {['#', 'PG', 'SP', 'PY', 'ACT', 'ITEM', 'UBG', 'FTE', 'ORG', 'N.Prest', 'Descripción', 'Monto', 'Acc'].map((h, i) => (
                    <th key={i} style={{ padding: '8px 10px', textAlign: i >= 11 ? 'right' : i === 12 ? 'center' : 'left', fontSize: '10px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itemsAgregados.map((item, idx) => (
                  <motion.tr key={idx}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                    style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = BG }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '7px 10px', color: MUTED }}>{idx + 1}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.programa?.cod_programa || '—'}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.subprograma?.cod_subprograma || '—'}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.proyecto?.cod_proyecto || '—'}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.actividad?.cod_actividad || '—'}</td>
                    <td style={{ padding: '7px 10px', color: ACCENT, fontWeight: 700, fontFamily: 'monospace' }}>{item.item?.cod_item || '—'}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.ubicacion?.cod_ubicacion || '—'}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.fuente?.cod_fuente || '—'}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.organismo?.cod_organismo || '—'}</td>
                    <td style={{ padding: '7px 10px', color: MUTED, fontFamily: 'monospace' }}>{item.naturaleza?.cod_naturaleza || '—'}</td>
                    <td style={{ padding: '7px 10px', color: TEXT, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.item?.nombre_item || '—'}</td>
                    <td style={{ padding: '7px 10px', color: GREEN, textAlign: 'right', fontWeight: 700 }}>
                      ${parseFloat(item.monto || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoverItem(idx)}
                        style={{ padding: '4px 8px', background: 'rgba(185,28,28,0.10)', border: `1px solid ${RED}40`, borderRadius: '6px', cursor: 'pointer', color: RED, display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={11} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'right', padding: '10px 14px', background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: '8px', fontSize: '13px', fontWeight: 800, color: GREEN }}>
            TOTAL PRESUPUESTARIO: ${totalMonto.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={SECTION_S}>
        <motion.button
          whileHover={(!loading && itemsAgregados.length > 0) ? { scale: 1.01, boxShadow: '0 8px 24px rgba(26,58,92,0.30)' } : {}}
          whileTap={(!loading && itemsAgregados.length > 0) ? { scale: 0.99 } : {}}
          onClick={handleCrearCertificado}
          disabled={loading || itemsAgregados.length === 0}
          style={{
            width: '100%', padding: '12px',
            background: (loading || itemsAgregados.length === 0) ? 'rgba(26,58,92,0.07)' : 'linear-gradient(135deg, #1a3a5c, #2e6ca4)',
            color: (loading || itemsAgregados.length === 0) ? MUTED : '#fff',
            border: 'none', borderRadius: '10px',
            cursor: (loading || itemsAgregados.length === 0) ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-primary)',
            opacity: loading ? 0.7 : 1,
            boxShadow: (loading || itemsAgregados.length === 0) ? 'none' : '0 4px 16px rgba(26,58,92,0.25)',
            transition: 'all 0.18s ease',
          }}
        >
          {loading ? 'Creando Certificado...' : 'Crear Certificado'}
        </motion.button>
      </motion.div>

      {/* Modal: Agregar Entidad */}
      <AnimatePresence>
        {showModalEntidad && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModalEntidad(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              style={{ background: CARD, borderRadius: '16px', overflow: 'hidden', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(10,20,40,0.30)', border: `1px solid ${BORDER}` }}
            >
              {/* Modal header */}
              <div style={{ background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={18} color="rgba(255,255,255,0.80)" />
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Agregar Entidad Requiriente</h2>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModalEntidad(false)}
                  style={{ background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: 'rgba(255,255,255,0.70)', display: 'flex', alignItems: 'center' }}
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Modal body */}
              <div style={{ padding: '24px' }}>
                <form onSubmit={e => { e.preventDefault(); handleAgregarEntidad() }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {[
                      ['Nombre Entidad *',    'nombre_entidad',        'text',  ''],
                      ['Responsable *',       'responsable_entidad',   'text',  ''],
                      ['Correo *',            'correo_institucional',  'email', ''],
                    ].map(([lbl, field, type]) => (
                      <div key={field}>
                        <label style={LABEL_S}>{lbl}</label>
                        <input
                          type={type} required
                          value={formEntidad[field]}
                          onChange={e => setFormEntidad({ ...formEntidad, [field]: e.target.value })}
                          style={INPUT_S} onFocus={focusIn} onBlur={focusOut}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit"
                      style={{ flex: 1, padding: '10px', background: `linear-gradient(135deg, ${GREEN}, #047857)`, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-primary)', boxShadow: '0 3px 10px rgba(5,150,105,0.22)' }}
                    >
                      Guardar Entidad
                    </motion.button>
                    <button
                      type="button" onClick={() => setShowModalEntidad(false)}
                      style={{ flex: 1, padding: '10px', background: 'rgba(26,58,92,0.06)', color: MUTED, border: `1px solid ${BORDER}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-primary)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = TEXT }}
                      onMouseLeave={e => { e.currentTarget.style.color = MUTED }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Cédula info */}
      <AnimatePresence>
        {showModalCedula && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModalCedula(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              style={{ background: CARD, borderRadius: '16px', overflow: 'hidden', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(10,20,40,0.30)', border: `1px solid ${BORDER}` }}
            >
              <div style={{ background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Cédulas Presupuestarias</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModalCedula(false)}
                  style={{ background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: 'rgba(255,255,255,0.70)', display: 'flex', alignItems: 'center' }}
                >
                  <X size={16} />
                </motion.button>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: MUTED }}>Las cédulas presupuestarias se crean automáticamente durante la instalación:</p>
                <ul style={{ margin: '0 0 20px', paddingLeft: '18px', color: MUTED, fontSize: '13px', lineHeight: '1.7' }}>
                  <li>Año actual + 3 años anteriores</li>
                  <li>Identificadas por ID y año fiscal</li>
                </ul>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModalCedula(false)}
                  style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-primary)', boxShadow: '0 3px 10px rgba(26,58,92,0.20)' }}
                >
                  Entendido
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
