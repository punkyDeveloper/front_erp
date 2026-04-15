import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Nav from "../assets/nav/nav";

/* ─── Config API ─────────────────────────────────────────────────────────── */
const API_URL  = process.env.REACT_APP_API_URL || "https://back-erp.onrender.com/v1";
const getToken = () => localStorage.getItem("token") || "";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Error en la petición");
  return data;
};

/* ─── Estilos ────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Outfit',sans-serif}
  :root{
    --az:#2563EB;--az2:#3B82F6;--az3:#EFF6FF;--az4:#DBEAFE;
    --ve:#059669;--ve3:#ECFDF5;
    --ro:#DC2626;--ro3:#FEF2F2;
    --am:#D97706;--am3:#FFFBEB;
    --gr:#64748B;--gr2:#F1F5F9;--gr3:#E2E8F0;--gr4:#CBD5E1;
    --txt:#0F172A;--txt2:#475569;
    --sh:0 1px 3px rgba(0,0,0,.08);--sh2:0 20px 40px rgba(0,0,0,.15);
    --rad:12px;
  }
  /* Botones */
  .btn{border:none;cursor:pointer;font-family:inherit;font-weight:500;border-radius:8px;transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
  .btn:active{transform:scale(.97)}
  .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .bp{background:var(--az);color:#fff;padding:10px 20px;font-size:14px}
  .bp:hover:not(:disabled){background:#1D4ED8}
  .bs{background:#fff;color:var(--gr);border:1px solid var(--gr3);padding:9px 18px;font-size:14px}
  .bs:hover:not(:disabled){background:var(--gr2)}
  .bd{background:var(--ro);color:#fff;padding:9px 18px;font-size:14px}
  .bd:hover:not(:disabled){background:#B91C1C}
  .be{background:var(--am);color:#fff;padding:7px 14px;font-size:13px}
  .be:hover:not(:disabled){background:#B45309}
  .bi{background:transparent;color:var(--gr);padding:7px;border-radius:8px;font-size:17px;border:none;cursor:pointer;transition:all .15s;line-height:1}
  .bi:hover{background:var(--gr2);color:var(--txt)}
  .bi.del:hover{background:var(--ro3);color:var(--ro)}
  .bi.edi:hover{background:var(--az3);color:var(--az)}
  /* Inputs */
  .ig{display:flex;flex-direction:column;gap:5px}
  .ig label{font-size:11px;font-weight:700;color:#475569;letter-spacing:.5px;text-transform:uppercase}
  .ic{border:1.5px solid var(--gr3);border-radius:8px;padding:10px 13px;font-size:14px;font-family:inherit;color:var(--txt);background:#fff;width:100%;outline:none;transition:border-color .15s,box-shadow .15s}
  .ic:focus{border-color:var(--az2);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
  .ic.err{border-color:var(--ro);box-shadow:0 0 0 3px rgba(220,38,38,.08)}
  .ic-file{border:1.5px dashed var(--gr4);background:var(--gr2);cursor:pointer}
  .ic-file:hover{border-color:var(--az2);background:var(--az3)}
  .em{font-size:11px;color:var(--ro);margin-top:2px}
  /* Grid */
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
  .gf{grid-column:1/-1}
  /* Badges */
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.2px}
  .bv{background:var(--ve3);color:var(--ve)}.br{background:var(--ro3);color:var(--ro)}.ba{background:var(--az3);color:var(--az)}.bam{background:var(--am3);color:var(--am)}
  /* Tabla */
  .tabla{width:100%;border-collapse:collapse}
  .tabla td,.tabla th{padding:13px 16px;font-size:14px;border-bottom:1px solid var(--gr3);vertical-align:middle;text-align:left}
  .tabla th{font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:.6px;text-transform:uppercase;background:var(--gr2);border-bottom:2px solid var(--gr3)}
  .tabla tbody tr{transition:background .1s}
  .tabla tbody tr:hover{background:#F8FAFF}
  .tabla tbody tr:last-child td{border-bottom:none}
  /* Modal */
  .overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
  .modal-box{background:#fff;border-radius:16px;box-shadow:var(--sh2);width:100%;max-width:680px;max-height:92vh;overflow-y:auto;animation:su .2s}
  .modal-box.sm{max-width:440px}
  @keyframes su{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
  .mh{padding:22px 28px 18px;border-bottom:1px solid var(--gr3);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:5;border-radius:16px 16px 0 0}
  .mb{padding:24px 28px}
  .mf{padding:16px 28px 22px;border-top:1px solid var(--gr3);display:flex;gap:10px;justify-content:flex-end}
  /* Toast */
  .toast{position:fixed;bottom:28px;right:28px;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:var(--sh2);z-index:999999;display:flex;align-items:center;gap:10px;animation:su .2s}
  .ts{background:#0F172A;color:#fff}.td2{background:var(--ro);color:#fff}
  /* Search bar */
  .search-wrap{position:relative;flex:1;max-width:340px}
  .search-wrap span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gr);font-size:15px;pointer-events:none}
  .search-wrap .ic{padding-left:36px}
  /* Imagen producto */
  .prod-img{width:52px;height:52px;border-radius:10px;object-fit:cover;border:1px solid var(--gr3)}
  .prod-img-placeholder{width:52px;height:52px;border-radius:10px;background:var(--gr2);border:1px solid var(--gr3);display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--gr4)}
  /* Preview imagen */
  .img-preview{width:100%;max-height:200px;object-fit:cover;border-radius:10px;border:1px solid var(--gr3)}
  .img-preview-wrap{position:relative;margin-top:8px}
  .img-preview-rm{position:absolute;top:6px;right:6px;background:rgba(15,23,42,.6);color:#fff;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px}
  /* Stats cards */
  .stat-card{background:#fff;border-radius:var(--rad);padding:18px 22px;border:1px solid var(--gr3);box-shadow:var(--sh);display:flex;align-items:center;gap:14px}
  .stat-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
  .stat-val{font-size:24px;font-weight:700;color:var(--txt);line-height:1}
  .stat-lbl{font-size:12px;color:var(--gr);margin-top:3px}
  /* Checkbox toggle */
  .tgl-wrap{display:flex;align-items:center;gap:10px;cursor:pointer}
  .tgl{width:42px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;padding:0}
  .tgl::after{content:'';position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
  .tgl.on{background:var(--ve)}.tgl.on::after{transform:translateX(18px)}.tgl.off{background:var(--gr4)}
  .tgl-lbl{font-size:14px;font-weight:500;color:var(--txt)}
  /* Spinner */
  .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .6s linear infinite;flex-shrink:0}
  @keyframes sp{to{transform:rotate(360deg)}}
  /* Vacío */
  .empty{text-align:center;padding:56px 20px;color:var(--gr)}
  .empty-icon{font-size:44px;margin-bottom:12px}
  .empty h3{font-size:16px;font-weight:600;color:var(--txt2);margin-bottom:6px}
  .empty p{font-size:14px}
  /* Sección */
  .sec-title{font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:.8px;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--gr3)}
  /* Paginación */
  .pag{display:flex;align-items:center;gap:6px;padding:16px 20px;border-top:1px solid var(--gr3);justify-content:flex-end}
  .pag-btn{width:32px;height:32px;border-radius:7px;border:1px solid var(--gr3);background:#fff;cursor:pointer;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;transition:all .15s;color:var(--txt)}
  .pag-btn:hover:not(:disabled){background:var(--az3);border-color:var(--az4);color:var(--az)}
  .pag-btn.act{background:var(--az);color:#fff;border-color:var(--az)}
  .pag-btn:disabled{opacity:.4;cursor:not-allowed}
  /* Filtros */
  .filter-tabs{display:flex;gap:2px;background:var(--gr2);padding:4px;border-radius:10px}
  .filter-tab{padding:7px 16px;border-radius:7px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;color:var(--gr);background:transparent;transition:all .15s}
  .filter-tab.on{background:#fff;color:var(--az);font-weight:600;box-shadow:var(--sh)}
  @media(max-width:768px){.g2,.g3{grid-template-columns:1fr}.stat-card{padding:14px 16px}}
`;

/* ─── Valor vacío para form ──────────────────────────────────────────────── */
const VACIO = {
  name: "", description: "", price: "", stock: "",
  venta: false, alquiler: false,
};

const PER_PAGE = 10;

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Productos() {
  const [productos,     setProductos]     = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [guardando,     setGuardando]     = useState(false);
  const [modal,         setModal]         = useState(null); // "crear" | "editar" | "eliminar"
  const [sel,           setSel]           = useState(null);
  const [form,          setForm]          = useState(VACIO);
  const [imagenFile,    setImagenFile]    = useState(null);
  const [previewUrl,    setPreviewUrl]    = useState(null);
  const [err,           setErr]           = useState({});
  const [toast,         setToast]         = useState(null);
  const [buscar,        setBuscar]        = useState("");
  const [filtroTab,     setFiltroTab]     = useState("todos");
  const [pagina,        setPagina]        = useState(1);
  const fileRef = useRef(null);

  /* ── CSS ── */
  useEffect(() => {
    const id = "prod-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  /* ── Toast ── */
  const msg = useCallback((texto, tipo = "s") => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ── Cargar productos ── */
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await apiFetch("/productos");
      setProductos(Array.isArray(data) ? data : data.data || data.productos || []);
    } catch (e) {
      msg("Error al cargar productos: " + e.message, "e");
    } finally {
      setCargando(false);
    }
  }, [msg]);

  useEffect(() => { cargar(); }, [cargar]);

  /* ── Filtros & búsqueda ── */
  const lista = productos.filter((p) => {
    const txt = buscar.toLowerCase();
    const match = !txt ||
      (p.name || "").toLowerCase().includes(txt) ||
      (p.description || "").toLowerCase().includes(txt) ||
      String(p.price || "").includes(txt);
    const tab =
      filtroTab === "todos"    ? true :
      filtroTab === "venta"    ? p.venta :
      filtroTab === "alquiler" ? p.alquiler :
      filtroTab === "sin_stock"? p.stock === 0 || p.stock === "0" : true;
    return match && tab;
  });

  const totalPags = Math.max(1, Math.ceil(lista.length / PER_PAGE));
  const pagActual = Math.min(pagina, totalPags);
  const slice     = lista.slice((pagActual - 1) * PER_PAGE, pagActual * PER_PAGE);

  /* ── Stats ── */
  const totalProductos = productos.length;
  const enVenta        = productos.filter((p) => p.venta).length;
  const enAlquiler     = productos.filter((p) => p.alquiler).length;
  const sinStock       = productos.filter((p) => !p.stock || p.stock === "0" || p.stock === 0).length;

  /* ── Manejo de imagen ── */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) return msg("Tipo de archivo no permitido. Usa jpg, png, gif o webp.", "e");
    if (file.size > 3 * 1024 * 1024)  return msg("El archivo supera 3 MB.", "e");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImagenFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const quitarImagen = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImagenFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = null;
  };

  /* ── Abrir modales ── */
  const abrirCrear = () => {
    setForm(VACIO);
    setImagenFile(null);
    setPreviewUrl(null);
    setErr({});
    setModal("crear");
  };

  const abrirEditar = (p) => {
    setSel(p);
    setForm({
      name:        p.name        || "",
      description: p.description || "",
      price:       p.price       ?? "",
      stock:       p.stock       ?? "",
      venta:       !!p.venta,
      alquiler:    !!p.alquiler,
    });
    setImagenFile(null);
    setPreviewUrl(p.img || null);
    setErr({});
    setModal("editar");
  };

  const abrirEliminar = (p) => { setSel(p); setModal("eliminar"); };

  const cerrar = () => {
    if (guardando) return;
    if (previewUrl && imagenFile) URL.revokeObjectURL(previewUrl);
    setModal(null);
    setSel(null);
    setImagenFile(null);
    setPreviewUrl(null);
    setErr({});
  };

  /* ── Validar form ── */
  const validar = () => {
    const e = {};
    if (!form.name.trim())              e.name        = "Requerido";
    if (!form.description.trim())       e.description = "Requerido";
    if (!form.price || isNaN(form.price)) e.price     = "Precio inválido";
    if (form.stock === "" || isNaN(form.stock)) e.stock = "Stock inválido";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  /* ── Crear ── */
  const handleCrear = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append("name",        form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price",       String(form.price));
      fd.append("stock",       String(form.stock));
      fd.append("venta",       String(form.venta));
      fd.append("alquiler",    String(form.alquiler));
      if (imagenFile) fd.append("img", imagenFile);

      const res = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.message || "Error al crear");

      msg("Producto creado correctamente");
      cerrar();
      cargar();
    } catch (err) {
      msg(err.message, "e");
    } finally {
      setGuardando(false);
    }
  };

  /* ── Editar ── */
  const handleEditar = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append("name",        form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price",       String(form.price));
      fd.append("stock",       String(form.stock));
      fd.append("venta",       String(form.venta));
      fd.append("alquiler",    String(form.alquiler));
      if (imagenFile) fd.append("img", imagenFile);

      const res = await fetch(`${API_URL}/productos/${sel._id || sel.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.message || "Error al editar");

      msg("Producto actualizado");
      cerrar();
      cargar();
    } catch (err) {
      msg(err.message, "e");
    } finally {
      setGuardando(false);
    }
  };

  /* ── Eliminar ── */
  const handleEliminar = async () => {
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/productos/${sel._id || sel.id}`, {
        method: "DELETE",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.message || "Error al eliminar");

      msg("Producto eliminado");
      cerrar();
      cargar();
    } catch (err) {
      msg(err.message, "e");
    } finally {
      setGuardando(false);
    }
  };

  /* ── Helpers ── */
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fmt  = (n) => Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 });

  /* ── JSX del formulario (inline, no sub-componente para evitar remount) ── */
  const formJSX = (onSubmit) => (
    <form onSubmit={onSubmit} id="form-prod">
      <div className="g2" style={{ gap: 18 }}>

        <div className="ig gf">
          <label>Nombre del producto *</label>
          <input
            className={`ic ${err.name ? "err" : ""}`}
            placeholder="Ej: Llanta 195/65 R15"
            value={form.name}
            onChange={(e) => setF("name", e.target.value)}
            disabled={guardando}
          />
          {err.name && <span className="em">{err.name}</span>}
        </div>

        <div className="ig gf">
          <label>Descripción *</label>
          <textarea
            className={`ic ${err.description ? "err" : ""}`}
            rows={3}
            placeholder="Descripción del producto..."
            value={form.description}
            onChange={(e) => setF("description", e.target.value)}
            disabled={guardando}
            style={{ resize: "vertical" }}
          />
          {err.description && <span className="em">{err.description}</span>}
        </div>

        <div className="ig">
          <label>Precio *</label>
          <input
            className={`ic ${err.price ? "err" : ""}`}
            type="number" step="0.01" min="0"
            placeholder="0.00"
            value={form.price}
            onChange={(e) => setF("price", e.target.value)}
            disabled={guardando}
          />
          {err.price && <span className="em">{err.price}</span>}
        </div>

        <div className="ig">
          <label>Stock *</label>
          <input
            className={`ic ${err.stock ? "err" : ""}`}
            type="number" min="0"
            placeholder="0"
            value={form.stock}
            onChange={(e) => setF("stock", e.target.value)}
            disabled={guardando}
          />
          {err.stock && <span className="em">{err.stock}</span>}
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "center", gridColumn: "1/-1" }}>
          <label className="tgl-wrap" onClick={() => !guardando && setF("venta", !form.venta)} style={{ userSelect: "none" }}>
            <button type="button" className={`tgl ${form.venta ? "on" : "off"}`} />
            <span className="tgl-lbl">Disponible para <strong>Venta</strong></span>
          </label>
          <label className="tgl-wrap" onClick={() => !guardando && setF("alquiler", !form.alquiler)} style={{ userSelect: "none" }}>
            <button type="button" className={`tgl ${form.alquiler ? "on" : "off"}`} />
            <span className="tgl-lbl">Disponible para <strong>Alquiler</strong></span>
          </label>
        </div>

        <div className="ig gf">
          <label>Imagen del producto (max 3 MB)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="ic ic-file"
            onChange={handleFile}
            disabled={guardando}
          />
          {previewUrl && (
            <div className="img-preview-wrap">
              <img src={previewUrl} alt="preview" className="img-preview" />
              <button type="button" className="img-preview-rm" onClick={quitarImagen}>
                Quitar
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );

  /* ── Render ── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
      <Nav />

      <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>

        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Productos</h1>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 3 }}>
              Gestión de inventario y catálogo de productos
            </p>
          </div>
          <button className="btn bp" onClick={abrirCrear}>
            + Nuevo producto
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#EFF6FF" }}>📦</div>
            <div><div className="stat-val">{totalProductos}</div><div className="stat-lbl">Total productos</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#ECFDF5" }}>🛒</div>
            <div><div className="stat-val" style={{ color: "#059669" }}>{enVenta}</div><div className="stat-lbl">En venta</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#EFF6FF" }}>🔄</div>
            <div><div className="stat-val" style={{ color: "#2563EB" }}>{enAlquiler}</div><div className="stat-lbl">En alquiler</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#FEF2F2" }}>⚠️</div>
            <div><div className="stat-val" style={{ color: "#DC2626" }}>{sinStock}</div><div className="stat-lbl">Sin stock</div></div>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,.06)", overflow: "hidden" }}>

          {/* Barra de herramientas */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div className="search-wrap">
              <span>🔍</span>
              <input
                className="ic"
                placeholder="Buscar por nombre, descripción..."
                value={buscar}
                onChange={(e) => { setBuscar(e.target.value); setPagina(1); }}
              />
            </div>
            <div className="filter-tabs">
              {[["todos","Todos"], ["venta","Venta"], ["alquiler","Alquiler"], ["sin_stock","Sin stock"]].map(([v, l]) => (
                <button key={v} className={`filter-tab ${filtroTab === v ? "on" : ""}`}
                  onClick={() => { setFiltroTab(v); setPagina(1); }}>
                  {l}
                </button>
              ))}
            </div>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748B" }}>
              {lista.length} resultado{lista.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Cuerpo tabla */}
          {cargando ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
              <div style={{ display: "inline-block", width: 32, height: 32, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "sp .6s linear infinite" }} />
              <p style={{ marginTop: 12, fontSize: 14 }}>Cargando productos...</p>
            </div>
          ) : slice.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <h3>Sin resultados</h3>
              <p>{buscar || filtroTab !== "todos" ? "Prueba con otros filtros" : "Crea tu primer producto"}</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Venta</th>
                    <th>Alquiler</th>
                    <th style={{ textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((p, i) => (
                    <tr key={p._id || p.id || i}>
                      <td style={{ color: "#94A3B8", fontWeight: 600 }}>
                        {(pagActual - 1) * PER_PAGE + i + 1}
                      </td>
                      <td>
                        {p.img
                          ? <img src={p.img} alt={p.name} className="prod-img" />
                          : <div className="prod-img-placeholder">📦</div>
                        }
                      </td>
                      <td style={{ fontWeight: 600, color: "#0F172A" }}>{p.name}</td>
                      <td style={{ color: "#475569", maxWidth: 220 }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {p.description}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "#059669" }}>
                        ${fmt(p.price)}
                      </td>
                      <td>
                        <span className={`badge ${!p.stock || p.stock === 0 ? "br" : "bv"}`}>
                          {p.stock ?? 0}
                        </span>
                      </td>
                      <td>
                        {p.venta
                          ? <span className="badge bv">✔ Activo</span>
                          : <span className="badge br">✗ No</span>}
                      </td>
                      <td>
                        {p.alquiler
                          ? <span className="badge ba">✔ Activo</span>
                          : <span className="badge br">✗ No</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button className="bi edi" title="Editar" onClick={() => abrirEditar(p)}>✏️</button>
                          <button className="bi del" title="Eliminar" onClick={() => abrirEliminar(p)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPags > 1 && (
            <div className="pag">
              <button className="pag-btn" onClick={() => setPagina(1)} disabled={pagActual === 1}>«</button>
              <button className="pag-btn" onClick={() => setPagina(p => p - 1)} disabled={pagActual === 1}>‹</button>
              {Array.from({ length: totalPags }, (_, k) => k + 1)
                .filter(n => Math.abs(n - pagActual) <= 2)
                .map(n => (
                  <button key={n} className={`pag-btn ${n === pagActual ? "act" : ""}`} onClick={() => setPagina(n)}>{n}</button>
                ))}
              <button className="pag-btn" onClick={() => setPagina(p => p + 1)} disabled={pagActual === totalPags}>›</button>
              <button className="pag-btn" onClick={() => setPagina(totalPags)} disabled={pagActual === totalPags}>»</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal CREAR ── */}
      {modal === "crear" && createPortal(
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && cerrar()}>
          <div className="modal-box">
            <div className="mh">
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Nuevo producto</h2>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Completa los datos del producto</p>
              </div>
              <button className="bi" onClick={cerrar} disabled={guardando} style={{ fontSize: 20 }}>✕</button>
            </div>
            <div className="mb">{formJSX(handleCrear)}</div>
            <div className="mf">
              <button className="btn bs" onClick={cerrar} disabled={guardando}>Cancelar</button>
              <button className="btn bp" type="submit" form="form-prod" disabled={guardando}>
                {guardando ? <><div className="spin" /> Guardando...</> : "Crear producto"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal EDITAR ── */}
      {modal === "editar" && createPortal(
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && cerrar()}>
          <div className="modal-box">
            <div className="mh">
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Editar producto</h2>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{sel?.name}</p>
              </div>
              <button className="bi" onClick={cerrar} disabled={guardando} style={{ fontSize: 20 }}>✕</button>
            </div>
            <div className="mb">{formJSX(handleEditar)}</div>
            <div className="mf">
              <button className="btn bs" onClick={cerrar} disabled={guardando}>Cancelar</button>
              <button className="btn bp" type="submit" form="form-prod" disabled={guardando}>
                {guardando ? <><div className="spin" /> Guardando...</> : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal ELIMINAR ── */}
      {modal === "eliminar" && createPortal(
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && cerrar()}>
          <div className="modal-box sm">
            <div className="mh">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Eliminar producto</h2>
              <button className="bi" onClick={cerrar} disabled={guardando} style={{ fontSize: 20 }}>✕</button>
            </div>
            <div className="mb">
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
                <p style={{ fontSize: 15, color: "#0F172A", fontWeight: 500 }}>
                  ¿Eliminar <strong>{sel?.name}</strong>?
                </p>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mf">
              <button className="btn bs" onClick={cerrar} disabled={guardando}>Cancelar</button>
              <button className="btn bd" onClick={handleEliminar} disabled={guardando}>
                {guardando ? <><div className="spin" /> Eliminando...</> : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Toast ── */}
      {toast && createPortal(
        <div className={`toast ${toast.tipo === "e" ? "td2" : "ts"}`}>
          {toast.tipo === "e" ? "❌" : "✅"} {toast.texto}
        </div>,
        document.body
      )}
    </div>
  );
}
