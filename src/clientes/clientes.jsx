import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Nav from "../assets/nav/nav";

/* ─── Config API ─────────────────────────────────────────────────────────── */
const API_URL    = process.env.REACT_APP_API_URL || 'https://back-erp.onrender.com/v1';
const getToken   = () => localStorage.getItem('token') || '';
const getCompany = () => localStorage.getItem('companiaId') || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Error en la petición");
  return data;
};

/* ─── Permisos desde el JWT ──────────────────────────────────────────────── */
const getPermisos = () => {
  try {
    // 1. Intentar desde localStorage (clave 'permisos' o 'userPermisos')
    const lsPermisos = localStorage.getItem('permisos') || localStorage.getItem('userPermisos');
    if (lsPermisos) {
      const p = JSON.parse(lsPermisos);
      if (Array.isArray(p) && p.length > 0) return p;
    }
    // 2. Intentar desde el JWT
    const token = getToken();
    if (!token) return [];
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.permisos || payload.rol?.permisos || payload.user?.permisos || [];
  } catch { return []; }
};

/* ─── Constantes ─────────────────────────────────────────────────────────── */
const TIPOS_DOC = ["NIT", "CC", "CE", "Pasaporte", "RUT"];
const TIPOS_PER = ["Natural", "Jurídica"];
const REGIMEN   = ["Responsable de IVA", "No Responsable de IVA", "Gran Contribuyente", "Régimen Simple"];
const CONTRIBUY = ["Ordinario", "Gran Contribuyente", "Autorretenedor", "No Contribuyente"];
const DEPTOS    = ["Antioquia","Cundinamarca","Valle del Cauca","Atlántico","Bolívar","Santander","Nariño","Córdoba","Tolima","Cauca"];

const VACIO = {
  nombre:"", tipoDocumento:"NIT", numeroDocumento:"", digitoVerificacion:"",
  tipoPersona:"Jurídica", email:"", telefono:"", celular:"",
  ciudad:"", departamento:"", direccion:"", codigoPostal:"",
  regimenFiscal:"No Responsable de IVA", tipoContribuyente:"Ordinario",
  responsableIVA:false, activo:true, permiso:false,
  nombreComercial:"", prefijoDian:"", autorizacionDian:"", fechaVigenciaDian:"",
  resolucionDian:"", rangoInicial:"", rangoFinal:"", consecutivoActual:"",
  correoFactura:"", notasFactura:"",
  motos: [],
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const initials    = (n) => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const colorAvatar = (n) => ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#BE185D"][n.charCodeAt(0)%7];

/* Calcula dígito de verificación NIT Colombia */
const calcularDV = (nit) => {
  const n = nit.replace(/\D/g, '');
  if (!n) return '';
  const arr = [71,67,59,53,47,43,41,37,29,23,19,17,13,7,3];
  const d = n.split('').reverse();
  let sum = 0;
  for (let i = 0; i < d.length; i++) sum += parseInt(d[i]) * arr[i];
  const rem = sum % 11;
  return String(rem > 1 ? 11 - rem : rem);
};

/* ─── Estilos ────────────────────────────────────────────────────────────── */
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Outfit',sans-serif}
  :root{
    --az:#1E40AF;--az2:#3B82F6;--az3:#EFF6FF;
    --ve:#059669;--ve3:#ECFDF5;
    --ro:#DC2626;--ro3:#FEF2F2;
    --gr:#64748B;--gr2:#F1F5F9;--bo:#E2E8F0;
    --sh:0 1px 3px rgba(0,0,0,.08);--sh2:0 12px 32px rgba(0,0,0,.18);
  }
  .btn{border:none;cursor:pointer;font-family:inherit;font-weight:500;border-radius:8px;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
  .btn:active{transform:scale(.97)}
  .bp{background:var(--az);color:#fff;padding:9px 18px;font-size:14px}
  .bp:hover{background:#1D4ED8}
  .bs{background:#fff;color:var(--gr);border:1px solid var(--bo);padding:8px 16px;font-size:14px}
  .bs:hover{background:var(--gr2)}
  .bd{background:var(--ro);color:#fff;padding:8px 16px;font-size:14px}
  .bd:hover{background:#B91C1C}
  .bi{background:transparent;color:var(--gr);padding:6px;border-radius:6px;font-size:16px;border:none;cursor:pointer}
  .bi:hover{background:var(--gr2);color:#1E293B}
  .ig{display:flex;flex-direction:column;gap:4px}
  .ig label{font-size:11px;font-weight:700;color:#475569;letter-spacing:.4px;text-transform:uppercase}
  .ic{border:1px solid var(--bo);border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;color:#1E293B;background:#fff;width:100%;outline:none;transition:border-color .15s,box-shadow .15s}
  .ic:focus{border-color:var(--az2);box-shadow:0 0 0 3px rgba(59,130,246,.15)}
  .ic.err{border-color:var(--ro)}
  .em{font-size:11px;color:var(--ro);margin-top:2px}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .gf{grid-column:1/-1}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .bv{background:var(--ve3);color:var(--ve)}
  .br{background:var(--ro3);color:var(--ro)}
  .ba{background:var(--az3);color:var(--az)}
  .tabla td,.tabla th{padding:13px 16px;font-size:14px;border-bottom:1px solid var(--bo);vertical-align:middle}
  .tabla th{font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:.6px;text-transform:uppercase;background:var(--gr2)}
  .av{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
  .tgl{width:40px;height:22px;border-radius:11px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
  .tgl::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
  .tgl.on{background:var(--ve)}.tgl.on::after{transform:translateX(18px)}.tgl.off{background:#CBD5E1}
  .overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal-box{background:#fff;border-radius:16px;box-shadow:var(--sh2);width:100%;max-height:92vh;overflow-y:auto;animation:su .2s}
  @keyframes su{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
  .mh{padding:22px 28px 18px;border-bottom:1px solid var(--bo);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:5;border-radius:16px 16px 0 0}
  .mb{padding:24px 28px}
  .mf{padding:16px 28px 22px;border-top:1px solid var(--bo);display:flex;gap:10px;justify-content:flex-end}
  .tabs{display:flex;gap:2px;background:var(--gr2);padding:4px;border-radius:10px;margin-bottom:22px}
  .tab{flex:1;padding:8px 12px;border-radius:7px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;color:var(--gr);background:transparent;transition:all .15s;text-align:center}
  .tab.on{background:#fff;color:var(--az);font-weight:600;box-shadow:var(--sh)}
  .sec{margin-bottom:24px}
  .st{font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:.8px;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--bo)}
  .toast{position:fixed;bottom:28px;right:28px;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:var(--sh2);z-index:999999;display:flex;align-items:center;gap:10px}
  .ts{background:#0F172A;color:#fff}.td2{background:var(--ro);color:#fff}
  .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:sk 1.2s infinite;border-radius:6px;height:16px}
  @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .moto-card{display:flex;align-items:center;gap:12px;background:#F8FAFF;border:1px solid var(--bo);border-radius:10px;padding:10px 14px;margin-bottom:8px;transition:background .15s}
  .moto-card:hover{background:var(--az3)}
  .moto-add{background:var(--az3);border:1.5px dashed #93C5FD;border-radius:10px;padding:14px;display:grid;grid-template-columns:160px 1fr auto;gap:10px;align-items:flex-end;margin-top:10px}
  @media(max-width:700px){.g2{grid-template-columns:1fr}.moto-add{grid-template-columns:1fr}}
`;

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Clientes() {
  const [permisos,  setPermisos]  = useState(() => getPermisos());
  const tienePermiso = (p) => permisos.includes(p);
  const [clientes,  setClientes]  = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista,    setErrorLista]    = useState(null);

  const [filtro,    setFiltro]    = useState("");
  const [filtroTab, setFiltroTab] = useState("todos");
  const [modal,     setModal]     = useState(null);
  const [sel,       setSel]       = useState(null);
  const [form,      setForm]      = useState(VACIO);
  const [tab,       setTab]       = useState("datos");
  const [err,       setErr]       = useState({});
  const [toast,     setToast]     = useState(null);
  const [cargando,  setCargando]  = useState(false);
  const [nuevaMotoPlaca, setNuevaMotoPlaca] = useState("");
  const [nuevaMotoVeh,   setNuevaMotoVeh]   = useState("");

  /* ── Cargar permisos desde el API por nombre de rol ── */
  useEffect(() => {
    if (permisos.length > 0) return; // ya los tenemos
    const cargarPermisos = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rolNombre = payload.rol;
        if (!rolNombre) return;
        // Buscar el rol con sus permisos
        const data = await apiFetch(`/roles`);
        const roles = data.data || data;
        const rol = Array.isArray(roles)
          ? roles.find(r => r.nombre === rolNombre || r.rol === rolNombre)
          : null;
        if (rol?.permisos?.length) {
          setPermisos(rol.permisos);
        }
      } catch (e) {
        console.log('No se pudieron cargar permisos del API:', e.message);
      }
    };
    cargarPermisos();
  }, []);

  /* ── Toast ── */
  const msg = useCallback((texto, tipo = "s") => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ── Cargar clientes desde el API ── */
  const cargarClientes = useCallback(async () => {
    setCargandoLista(true);
    setErrorLista(null);
    try {
      const params = new URLSearchParams();
      if (filtroTab === "activos")   params.append("activo", "true");
      if (filtroTab === "inactivos") params.append("activo", "false");
      if (filtro.trim())             params.append("buscar", filtro.trim());

      const data = await apiFetch(`/clientes?${params}`);
      setClientes(data.data);
    } catch (e) {
      setErrorLista(e.message);
    } finally {
      setCargandoLista(false);
    }
  }, [filtro, filtroTab]);

  useEffect(() => {
    const delay = setTimeout(cargarClientes, 300); // debounce en búsqueda
    return () => clearTimeout(delay);
  }, [cargarClientes]);

  /* ── Helpers modal ── */
  const cerrar = () => { setModal(null); setSel(null); };

  const abrir = (tipo, c = null) => {
    setSel(c);
    setForm(c
      ? { ...VACIO, ...c,
          fechaVigenciaDian: c.fechaVigenciaDian ? c.fechaVigenciaDian.slice(0,10) : "",
          motos: c.motos ? c.motos.map(m => ({ ...m })) : [],
        }
      : VACIO);
    setErr({});
    setTab("datos");
    setNuevaMotoPlaca("");
    setNuevaMotoVeh("");
    setModal(tipo);
  };

  const cf = (k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // Auto DV cuando cambia el número de documento y es NIT
      if (k === 'numeroDocumento' && next.tipoDocumento === 'NIT') {
        next.digitoVerificacion = calcularDV(v);
      }
      if (k === 'tipoDocumento' && v === 'NIT') {
        next.digitoVerificacion = calcularDV(next.numeroDocumento);
      }
      return next;
    });
    setErr(p => { const e = { ...p }; delete e[k]; return e; });
  };

  /* ── Validación frontend ── */
  const soloDigitos = (v) => v.replace(/\D/g, '');

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";

    const doc = soloDigitos(form.numeroDocumento);
    if (!doc)          e.numeroDocumento = "Requerido";
    else if (doc.length < 6)  e.numeroDocumento = "Mínimo 6 dígitos";
    else if (doc.length > 15) e.numeroDocumento = "Máximo 15 dígitos";

    if (!form.email.trim()) e.email = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";

    const tel = soloDigitos(form.telefono);
    const cel = soloDigitos(form.celular);
    if (!tel && !cel) {
      e.telefono = "Ingresa teléfono o celular";
    } else if (tel && tel.length < 7) {
      e.telefono = "Mínimo 7 dígitos";
    } else if (cel && cel.length < 7) {
      e.celular = "Mínimo 7 dígitos";
    }

    setErr(e);
    if (Object.keys(e).length > 0) setTab("datos");
    return !Object.keys(e).length;
  };

  /* ── Crear / Editar ── */
  const guardar = async () => {
    if (!validar()) return;
    setCargando(true);
    try {
      if (modal === "crear") {
        await apiFetch("/clientes", { method: "POST", body: JSON.stringify(form) });
        msg("Cliente creado correctamente");
      } else {
        await apiFetch(`/clientes/${sel._id}`, { method: "PUT", body: JSON.stringify(form) });
        msg("Cliente actualizado correctamente");
      }
      cerrar();
      cargarClientes();
    } catch (e) {
      msg(e.message, "d");
    } finally {
      setCargando(false);
    }
  };

  /* ── Eliminar ── */
  const eliminar = async () => {
    setCargando(true);
    try {
      await apiFetch(`/clientes/${sel._id}`, { method: "DELETE" });
      msg("Cliente eliminado", "d");
      cerrar();
      cargarClientes();
    } catch (e) {
      msg(e.message, "d");
    } finally {
      setCargando(false);
    }
  };

  /* ── Stats ── */
  const stats = {
    total:    clientes.length,
    activos:  clientes.filter(c => c.activo).length,
    inactivos:clientes.filter(c => !c.activo).length,
  };

  /* ─────────────────────────────────────────── RENDER ─── */
  return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ display:"flex", height:"100vh" }}>
        <Nav />

        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", minWidth:0, background:"#F0F4F8" }}>

          {/* ── HEADER ── */}
          <div style={{ background:"linear-gradient(135deg,#1E40AF,#2563EB)", padding:"28px 32px", color:"#fff" }}>
            <div style={{ maxWidth:1200, margin:"0 auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, opacity:.7, letterSpacing:1.2, textTransform:"uppercase", marginBottom:4 }}>Módulo</div>
                  <h1 style={{ fontSize:26, fontWeight:700 }}>👥 Gestión de Clientes</h1>
                  <p style={{ opacity:.75, fontSize:14, marginTop:4 }}>{stats.total} clientes registrados</p>
                </div>
                {tienePermiso("crear_cliente") && (
                  <button className="btn" onClick={() => abrir("crear")}
                    style={{ background:"#fff", color:"#1E40AF", padding:"10px 20px", fontSize:14, fontWeight:700, borderRadius:10, boxShadow:"0 4px 14px rgba(0,0,0,.18)" }}>
                    + Nuevo Cliente
                  </button>
                )}
              </div>
              <div style={{ display:"flex", gap:14, marginTop:22, flexWrap:"wrap" }}>
                {[
                  { label:"Total",     val:stats.total,     bg:"rgba(255,255,255,.18)", icon:"👥" },
                  { label:"Activos",   val:stats.activos,   bg:"rgba(16,185,129,.25)",  icon:"✅" },
                  { label:"Inactivos", val:stats.inactivos, bg:"rgba(239,68,68,.25)",   icon:"⏸️" },
                ].map(s => (
                  <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"10px 18px", border:"1px solid rgba(255,255,255,.15)", minWidth:90 }}>
                    <div style={{ fontSize:19, fontWeight:700 }}>{s.icon} {s.val}</div>
                    <div style={{ fontSize:12, opacity:.8, marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── TABLA ── */}
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>
            <div style={{ background:"#fff", borderRadius:12, boxShadow:"var(--sh)", border:"1px solid var(--bo)", overflow:"hidden" }}>

              {/* Barra de filtros */}
              <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--bo)", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <input className="ic" placeholder="🔍 Buscar nombre, documento o email..."
                  value={filtro} onChange={e => setFiltro(e.target.value)} style={{ maxWidth:340 }} />
                <div style={{ display:"flex", gap:6, marginLeft:"auto" }}>
                  {["todos","activos","inactivos"].map(f => (
                    <button key={f} onClick={() => setFiltroTab(f)} className="btn bs"
                      style={{ ...(filtroTab===f ? { background:"var(--az3)", color:"var(--az)", borderColor:"#93C5FD" } : {}), textTransform:"capitalize", padding:"7px 13px" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado de carga / error */}
              {cargandoLista ? (
                <div style={{ padding:"24px 20px", display:"flex", flexDirection:"column", gap:14 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <div className="skeleton" style={{ width:36, height:36, borderRadius:10, flexShrink:0 }} />
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                        <div className="skeleton" style={{ width:"40%" }} />
                        <div className="skeleton" style={{ width:"25%", height:12 }} />
                      </div>
                      <div className="skeleton" style={{ width:"15%" }} />
                      <div className="skeleton" style={{ width:"18%" }} />
                    </div>
                  ))}
                </div>
              ) : errorLista ? (
                <div style={{ padding:50, textAlign:"center", color:"var(--ro)" }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>⚠️</div>
                  <p style={{ fontWeight:600, marginBottom:8 }}>{errorLista}</p>
                  <button className="btn bp" onClick={cargarClientes}>Reintentar</button>
                </div>
              ) : clientes.length === 0 ? (
                <div style={{ padding:60, textAlign:"center", color:"var(--gr)" }}>
                  <div style={{ fontSize:44, marginBottom:10 }}>🔍</div>
                  <p style={{ fontWeight:500 }}>No se encontraron clientes</p>
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }} className="tabla">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Documento</th>
                        <th>Contacto</th>
                        <th>Ciudad</th>
                        <th>Régimen</th>
                        <th>Estado</th>
                        {tienePermiso("ver_mecanica") && <th style={{ textAlign:"center" }}>Web</th>}
                        <th style={{ textAlign:"right" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map(c => (
                        <tr key={c._id} style={{ cursor:"pointer" }} onClick={() => abrir("ver", c)}>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div className="av" style={{ background:colorAvatar(c.nombre) }}>{initials(c.nombre)}</div>
                              <div>
                                <div style={{ fontWeight:600, color:"#1E293B", fontSize:14 }}>{c.nombre}</div>
                                <div style={{ fontSize:12, color:"var(--gr)" }}>{c.tipoPersona}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge ba">{c.tipoDocumento}</span>{" "}
                            <span style={{ fontSize:13 }}>{c.numeroDocumento}{c.digitoVerificacion ? `-${c.digitoVerificacion}` : ""}</span>
                          </td>
                          <td>
                            <div style={{ fontSize:13 }}>{c.email}</div>
                            <div style={{ fontSize:12, color:"var(--gr)" }}>{c.telefono}</div>
                          </td>
                          <td style={{ fontSize:13 }}>{c.ciudad}</td>
                          <td style={{ fontSize:12, color:"var(--gr)" }}>{c.regimenFiscal}</td>
                          <td><span className={`badge ${c.activo?"bv":"br"}`}>{c.activo?"● Activo":"● Inactivo"}</span></td>
                          {tienePermiso("ver_mecanica") && (
                            <td style={{ textAlign:"center", fontSize:16 }}>{c.permiso ? "✅" : "—"}</td>
                          )}
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                              <button className="bi" title="Ver"     onClick={() => abrir("ver", c)}>👁</button>
                              {tienePermiso("editar_cliente")   && <button className="bi" title="Editar"   onClick={() => abrir("editar", c)}>✏️</button>}
                              {tienePermiso("eliminar_cliente") && <button className="bi" title="Eliminar" onClick={() => abrir("eliminar", c)} style={{ color:"var(--ro)" }}>🗑️</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PORTAL: modales + toast ── */}
      {createPortal(
        <>
          {toast && (
            <div className={`toast ${toast.tipo==="s"?"ts":"td2"}`}>
              {toast.tipo==="s" ? "✓" : "✕"} {toast.texto}
            </div>
          )}

          {/* ── MODAL CREAR / EDITAR ── */}
          {(modal === "crear" || modal === "editar") && (
            <div className="overlay">
              <div className="modal-box" style={{ maxWidth:780 }} onClick={e => e.stopPropagation()}>
                <div className="mh">
                  <div>
                    <h2 style={{ fontSize:18, fontWeight:700, color:"#1E293B" }}>
                      {modal==="crear" ? "➕ Nuevo Cliente" : "✏️ Editar Cliente"}
                    </h2>
                    <p style={{ fontSize:13, color:"var(--gr)", marginTop:2 }}>
                      {modal==="crear" ? "Completa los datos del cliente" : `Editando: ${sel?.nombre}`}
                    </p>
                  </div>
                  <button className="bi" onClick={cerrar} style={{ fontSize:20 }}>✕</button>
                </div>

                <div className="mb">
                  <div className="tabs">
                    <button className={`tab ${tab==="datos"?"on":""}`}       onClick={() => setTab("datos")}>👤 Datos del Cliente</button>
                    <button className={`tab ${tab==="facturacion"?"on":""}`} onClick={() => setTab("facturacion")}>🧾 Facturación Electrónica</button>
                    {tienePermiso("ver_mecanica") && (
                      <button className={`tab ${tab==="motos"?"on":""}`} onClick={() => setTab("motos")}>
                        🏍️ Motos {form.motos?.length > 0 && <span style={{ background:"var(--az)", color:"#fff", borderRadius:12, fontSize:10, padding:"1px 6px", marginLeft:3 }}>{form.motos.length}</span>}
                      </button>
                    )}
                  </div>

                  {/* ── TAB DATOS ── */}
                  {tab === "datos" && (
                    <>
                      <div className="sec">
                        <div className="st">Identificación</div>
                        <div className="g2">
                          <div className="ig gf">
                            <label>Nombre / Razón Social *</label>
                            <input className={`ic ${err.nombre?"err":""}`} value={form.nombre} onChange={e=>cf("nombre",e.target.value)} placeholder="Ej. Ferretería El Clavo S.A.S" />
                            {err.nombre && <span className="em">⚠ {err.nombre}</span>}
                          </div>
                          <div className="ig">
                            <label>Tipo de Documento *</label>
                            <select className="ic" value={form.tipoDocumento} onChange={e=>cf("tipoDocumento",e.target.value)}>
                              {TIPOS_DOC.map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="ig">
                            <label>Número de Documento *</label>
                            <div style={{ display:"flex", gap:6 }}>
                              <input className={`ic ${err.numeroDocumento?"err":""}`} value={form.numeroDocumento} onChange={e=>cf("numeroDocumento",e.target.value.replace(/\D/g,''))} placeholder="900123456" style={{ flex:1 }} inputMode="numeric" maxLength={15} />
                              {form.tipoDocumento==="NIT" && (
                                <input className="ic" value={form.digitoVerificacion} readOnly placeholder="DV" style={{ width:56, background:"#F1F5F9", cursor:"default", textAlign:"center", fontWeight:700 }} title="Calculado automáticamente" />
                              )}
                            </div>
                            {err.numeroDocumento && <span className="em">⚠ {err.numeroDocumento}</span>}
                          </div>
                          <div className="ig">
                            <label>Tipo de Persona</label>
                            <select className="ic" value={form.tipoPersona} onChange={e=>cf("tipoPersona",e.target.value)}>
                              {TIPOS_PER.map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="sec">
                        <div className="st">Contacto</div>
                        <div className="g2">
                          <div className="ig">
                            <label>Email *</label>
                            <input className={`ic ${err.email?"err":""}`} type="email" value={form.email} onChange={e=>cf("email",e.target.value)} placeholder="correo@empresa.com" />
                            {err.email && <span className="em">⚠ {err.email}</span>}
                          </div>
                          <div className="ig">
                            <label>Teléfono *</label>
                            <input className={`ic ${err.telefono?"err":""}`} value={form.telefono} onChange={e=>cf("telefono",e.target.value.replace(/[^0-9+\s-]/g,''))} placeholder="604-456-7890" inputMode="tel" />
                            {err.telefono && <span className="em">⚠ {err.telefono}</span>}
                          </div>
                          <div className="ig">
                            <label>Celular</label>
                            <input className={`ic ${err.celular?"err":""}`} value={form.celular} onChange={e=>cf("celular",e.target.value.replace(/[^0-9+\s-]/g,''))} placeholder="300-123-4567" inputMode="tel" />
                            {err.celular && <span className="em">⚠ {err.celular}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="sec">
                        <div className="st">Ubicación</div>
                        <div className="g2">
                          <div className="ig">
                            <label>Departamento</label>
                            <select className="ic" value={form.departamento} onChange={e=>cf("departamento",e.target.value)}>
                              <option value="">Seleccionar...</option>
                              {DEPTOS.map(d=><option key={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="ig">
                            <label>Ciudad / Municipio</label>
                            <input className="ic" value={form.ciudad} onChange={e=>cf("ciudad",e.target.value)} placeholder="Medellín" />
                          </div>
                          <div className="ig gf">
                            <label>Dirección</label>
                            <input className="ic" value={form.direccion} onChange={e=>cf("direccion",e.target.value)} placeholder="Calle 45 # 32-10" />
                          </div>
                          <div className="ig">
                            <label>Código Postal</label>
                            <input className="ic" value={form.codigoPostal} onChange={e=>cf("codigoPostal",e.target.value.replace(/\D/g,''))} placeholder="050001" maxLength={6} inputMode="numeric" />
                          </div>
                        </div>
                      </div>

                      <div className="sec">
                        <div className="st">Estado</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:20, alignItems:"center" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <button className={`tgl ${form.activo?"on":"off"}`} onClick={()=>cf("activo",!form.activo)} />
                            <span style={{ fontSize:14, fontWeight:500, color:form.activo?"var(--ve)":"var(--gr)" }}>
                              Cliente {form.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          {tienePermiso("ver_mecanica") && (
                            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", userSelect:"none",
                              background:form.permiso?"var(--az3)":"var(--gr2)",
                              border:`1.5px solid ${form.permiso?"#93C5FD":"var(--bo)"}`,
                              borderRadius:10, padding:"8px 16px", transition:"all .15s" }}>
                              <input type="checkbox" checked={form.permiso} onChange={e=>cf("permiso",e.target.checked)}
                                style={{ width:17, height:17, accentColor:"var(--az)", cursor:"pointer" }} />
                              <div>
                                <div style={{ fontSize:13, fontWeight:600, color:form.permiso?"var(--az)":"#475569" }}>🌐 Web</div>
                                <div style={{ fontSize:11, color:"var(--gr)" }}>Acceso a página web</div>
                              </div>
                              <span className={`badge ${form.permiso?"ba":""}`} style={!form.permiso?{background:"#F1F5F9",color:"#94A3B8"}:{}}>
                                {form.permiso ? "Activo" : "Sin acceso"}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── TAB FACTURACIÓN ── */}
                  {tab === "facturacion" && (
                    <>
                      <div className="sec">
                        <div className="st">Información Fiscal</div>
                        <div className="g2">
                          <div className="ig">
                            <label>Régimen Fiscal</label>
                            <select className="ic" value={form.regimenFiscal} onChange={e=>cf("regimenFiscal",e.target.value)}>
                              {REGIMEN.map(r=><option key={r}>{r}</option>)}
                            </select>
                          </div>
                          <div className="ig">
                            <label>Tipo de Contribuyente</label>
                            <select className="ic" value={form.tipoContribuyente} onChange={e=>cf("tipoContribuyente",e.target.value)}>
                              {CONTRIBUY.map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="ig">
                            <label>Nombre Comercial</label>
                            <input className="ic" value={form.nombreComercial} onChange={e=>cf("nombreComercial",e.target.value)} placeholder="Nombre en facturas" />
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:18 }}>
                            <button className={`tgl ${form.responsableIVA?"on":"off"}`} onClick={()=>cf("responsableIVA",!form.responsableIVA)} />
                            <div>
                              <div style={{ fontSize:13, fontWeight:600 }}>Responsable de IVA</div>
                              <div style={{ fontSize:12, color:"var(--gr)" }}>{form.responsableIVA?"Aplica IVA":"No aplica IVA"}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sec">
                        <div className="st">Resolución DIAN</div>
                        <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding:"11px 14px", marginBottom:16, fontSize:13, color:"#92400E" }}>
                          ⚠️ Completar solo si el cliente también <strong>emite</strong> facturas electrónicas.
                        </div>
                        <div className="g2">
                          <div className="ig"><label>N° Resolución DIAN</label>   <input className="ic" value={form.resolucionDian}    onChange={e=>cf("resolucionDian",e.target.value)}    placeholder="18764000000xxx" /></div>
                          <div className="ig"><label>Prefijo</label>               <input className="ic" value={form.prefijoDian}       onChange={e=>cf("prefijoDian",e.target.value)}       placeholder="FE, FV..." /></div>
                          <div className="ig"><label>Fecha Vigencia</label>        <input className="ic" type="date" value={form.fechaVigenciaDian} onChange={e=>cf("fechaVigenciaDian",e.target.value)} /></div>
                          <div className="ig"><label>N° Autorización</label>       <input className="ic" value={form.autorizacionDian}  onChange={e=>cf("autorizacionDian",e.target.value)}  placeholder="0000000000" /></div>
                          <div className="ig"><label>Rango Inicial</label>         <input className="ic" type="number" value={form.rangoInicial}    onChange={e=>cf("rangoInicial",e.target.value)}    placeholder="1" /></div>
                          <div className="ig"><label>Rango Final</label>           <input className="ic" type="number" value={form.rangoFinal}      onChange={e=>cf("rangoFinal",e.target.value)}      placeholder="100000" /></div>
                          <div className="ig"><label>Consecutivo Actual</label>    <input className="ic" type="number" value={form.consecutivoActual} onChange={e=>cf("consecutivoActual",e.target.value)} placeholder="1" /></div>
                        </div>
                      </div>

                      <div className="sec">
                        <div className="st">Envío de Facturas</div>
                        <div className="g2">
                          <div className="ig"><label>Email para facturas</label>   <input className="ic" type="email" value={form.correoFactura} onChange={e=>cf("correoFactura",e.target.value)} placeholder="facturas@empresa.com" /></div>
                          <div className="ig gf"><label>Notas / Observaciones</label><textarea className="ic" rows={3} value={form.notasFactura} onChange={e=>cf("notasFactura",e.target.value)} placeholder="Condiciones de pago..." style={{ resize:"vertical" }} /></div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── TAB MOTOS ── */}
                  {tab === "motos" && tienePermiso("ver_mecanica") && (
                    <>
                      <div className="sec">
                        <div className="st">Vehículos / Motos registradas</div>

                        {/* Lista de motos existentes */}
                        {(!form.motos || form.motos.length === 0) && (
                          <div style={{ textAlign:"center", padding:"28px 0", color:"var(--gr)" }}>
                            <div style={{ fontSize:36, marginBottom:8 }}>🏍️</div>
                            <p style={{ fontSize:14, fontWeight:500 }}>Sin motos registradas</p>
                            <p style={{ fontSize:12, marginTop:4 }}>Agrega la placa y el vehículo de las motos del cliente</p>
                          </div>
                        )}

                        {(form.motos || []).map((moto, idx) => (
                          <div key={idx} className="moto-card">
                            <div style={{ width:42, height:42, borderRadius:10, background:"var(--az3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🏍️</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:700, fontFamily:"monospace", fontSize:15, letterSpacing:1, color:"#1E293B" }}>
                                {moto.placa || "—"}
                              </div>
                              <div style={{ fontSize:12, color:"var(--gr)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {moto.vehiculo || "Sin referencia"}
                              </div>
                            </div>
                            {modal !== "ver" && (
                              <button className="bi" title="Eliminar moto"
                                onClick={() => cf("motos", form.motos.filter((_, i) => i !== idx))}
                                style={{ color:"var(--ro)", fontSize:18 }}>🗑️</button>
                            )}
                          </div>
                        ))}

                        {/* Formulario para agregar nueva moto */}
                        {modal !== "ver" && (
                          <div className="moto-add">
                            <div className="ig">
                              <label>Placa *</label>
                              <input className="ic" placeholder="ABC123"
                                value={nuevaMotoPlaca}
                                onChange={e => setNuevaMotoPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                                maxLength={7}
                                style={{ fontFamily:"monospace", letterSpacing:2, fontWeight:700 }} />
                            </div>
                            <div className="ig">
                              <label>Vehículo (Marca Modelo Año)</label>
                              <input className="ic" placeholder="Ej: Honda CB125F 2022"
                                value={nuevaMotoVeh}
                                onChange={e => setNuevaMotoVeh(e.target.value)} />
                            </div>
                            <button className="btn bp" style={{ height:40 }}
                              onClick={() => {
                                const placa = nuevaMotoPlaca.trim();
                                if (!placa) return;
                                cf("motos", [...(form.motos || []), { placa, vehiculo: nuevaMotoVeh.trim() }]);
                                setNuevaMotoPlaca("");
                                setNuevaMotoVeh("");
                              }}>
                              + Agregar
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                </div>

                <div className="mf">
                  <button className="btn bs" onClick={cerrar}>Cancelar</button>
                  <button className="btn bp" onClick={guardar} disabled={cargando}>
                    {cargando ? "⏳ Guardando..." : (modal==="crear" ? "✓ Crear Cliente" : "✓ Guardar Cambios")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL VER ── */}
          {modal === "ver" && sel && (
            <div className="overlay">
              <div className="modal-box" style={{ maxWidth:560 }} onClick={e=>e.stopPropagation()}>
                <div className="mh">
                  <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                    <div className="av" style={{ background:colorAvatar(sel.nombre), width:46, height:46, fontSize:16, borderRadius:12 }}>
                      {initials(sel.nombre)}
                    </div>
                    <div>
                      <h2 style={{ fontSize:17, fontWeight:700, color:"#1E293B" }}>{sel.nombre}</h2>
                      <span className={`badge ${sel.activo?"bv":"br"}`}>{sel.activo?"● Activo":"● Inactivo"}</span>
                    </div>
                  </div>
                  <button className="bi" onClick={cerrar} style={{ fontSize:20 }}>✕</button>
                </div>
                <div className="mb">
                  {[
                    { label:"Documento",      val:`${sel.tipoDocumento}: ${sel.numeroDocumento}${sel.digitoVerificacion?`-${sel.digitoVerificacion}`:""}` },
                    { label:"Tipo Persona",   val:sel.tipoPersona },
                    { label:"Email",          val:sel.email },
                    { label:"Teléfono",       val:sel.telefono },
                    { label:"Ubicación",      val:`${sel.ciudad}, ${sel.departamento}` },
                    { label:"Dirección",      val:sel.direccion },
                    { label:"Régimen Fiscal", val:sel.regimenFiscal },
                    { label:"Contribuyente",  val:sel.tipoContribuyente },
                    { label:"Responsable IVA",val:sel.responsableIVA?"Sí":"No" },
                    ...(tienePermiso("ver_mecanica") ? [{ label:"🌐 Web", val:sel.permiso?"✅ Con acceso":"❌ Sin acceso" }] : []),
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--bo)", gap:16 }}>
                      <span style={{ fontSize:13, color:"var(--gr)", fontWeight:500 }}>{r.label}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:"#1E293B", textAlign:"right" }}>{r.val || "—"}</span>
                    </div>
                  ))}

                  {/* ── Motos ── */}
                  {tienePermiso("ver_mecanica") && (
                    <div style={{ marginTop:14 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:.8, textTransform:"uppercase", marginBottom:10 }}>🏍️ Motos / Vehículos</div>
                      {(!sel.motos || sel.motos.length === 0) ? (
                        <p style={{ fontSize:13, color:"var(--gr)" }}>Sin motos registradas</p>
                      ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {sel.motos.map((moto, idx) => (
                            <div key={idx} className="moto-card" style={{ cursor:"default" }}>
                              <div style={{ width:36, height:36, borderRadius:9, background:"var(--az3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>🏍️</div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:700, fontFamily:"monospace", fontSize:14, letterSpacing:1 }}>{moto.placa}</div>
                                <div style={{ fontSize:12, color:"var(--gr)" }}>{moto.vehiculo || "—"}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mf">
                  <button className="btn bs" onClick={cerrar}>Cerrar</button>
                  {tienePermiso("editar_cliente") && (
                    <button className="btn bp" onClick={() => { cerrar(); abrir("editar", sel); }}>✏️ Editar</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL ELIMINAR ── */}
          {modal === "eliminar" && sel && (
            <div className="overlay">
              <div className="modal-box" style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
                <div className="mh">
                  <h2 style={{ fontSize:17, fontWeight:700, color:"var(--ro)" }}>🗑️ Eliminar Cliente</h2>
                  <button className="bi" onClick={cerrar} style={{ fontSize:20 }}>✕</button>
                </div>
                <div className="mb" style={{ textAlign:"center", padding:"28px 28px 16px" }}>
                  <div style={{ fontSize:50, marginBottom:14 }}>⚠️</div>
                  <p style={{ fontSize:15, fontWeight:600, color:"#1E293B", marginBottom:8 }}>
                    ¿Eliminar a <strong>{sel.nombre}</strong>?
                  </p>
                  <p style={{ fontSize:13, color:"var(--gr)", lineHeight:1.7 }}>
                    Esta acción no se puede deshacer. El cliente será eliminado permanentemente.
                  </p>
                </div>
                <div className="mf" style={{ justifyContent:"center", gap:14 }}>
                  <button className="btn bs" onClick={cerrar} style={{ minWidth:130 }}>Cancelar</button>
                  <button className="btn bd" onClick={eliminar} disabled={cargando} style={{ minWidth:130 }}>
                    {cargando ? "⏳ Eliminando..." : "🗑️ Sí, eliminar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  );
}