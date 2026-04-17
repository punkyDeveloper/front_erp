import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import NavPos from "../assets/nav/navPos";

/* ─── API ──────────────────────────────────────────────────────────────────── */
const API_URL  = process.env.REACT_APP_API_URL || "https://back-erp.onrender.com/v1";
const getToken = () => localStorage.getItem("token") || "";

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Error");
  return data;
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 });

const fechaCorta = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const TABS = [
  { key: "todas",      label: "Todas"      },
  { key: "finalizada", label: "Finalizadas" },
  { key: "borrador",   label: "Pendientes"  },
  { key: "cancelada",  label: "Canceladas"  },
];

const BADGE = {
  finalizada: { label: "Finalizada", cls: "bv-b"  },
  borrador:   { label: "Pendiente",  cls: "bam-b" },
  cancelada:  { label: "Cancelada",  cls: "br-b"  },
};

const METODO_LABEL = {
  efectivo:      "💵 Efectivo",
  tarjeta:       "💳 Tarjeta",
  transferencia: "🏦 Transferencia",
};

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --az:#2563EB;--az2:#3B82F6;--az3:#EFF6FF;--az4:#DBEAFE;
    --ve:#059669;--ve3:#ECFDF5;--ve4:#D1FAE5;
    --ro:#DC2626;--ro3:#FEF2F2;
    --am:#D97706;--am3:#FFFBEB;
    --pu:#7C3AED;--pu3:#F5F3FF;
    --gr:#64748B;--gr2:#F1F5F9;--gr3:#E2E8F0;--gr4:#CBD5E1;
    --txt:#0F172A;--txt2:#475569;
    --sh:0 1px 3px rgba(0,0,0,.08);--sh2:0 20px 40px rgba(0,0,0,.15);
  }
  body{font-family:'Outfit',sans-serif!important}
  .btn{border:none;cursor:pointer;font-family:inherit;font-weight:500;border-radius:8px;transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
  .btn:active{transform:scale(.97)}
  .btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
  .bp{background:var(--az);color:#fff;padding:10px 20px;font-size:14px}.bp:hover:not(:disabled){background:#1D4ED8}
  .bv{background:var(--ve);color:#fff;padding:10px 20px;font-size:14px}.bv:hover:not(:disabled){background:#047857}
  .bs{background:#fff;color:var(--gr);border:1px solid var(--gr3);padding:9px 18px;font-size:14px}.bs:hover:not(:disabled){background:var(--gr2)}
  .bi{background:transparent;color:var(--gr);padding:7px;border-radius:8px;font-size:16px;border:none;cursor:pointer;transition:all .15s;line-height:1;font-family:inherit}
  .bi:hover{background:var(--gr2);color:var(--txt)}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
  .bv-b{background:var(--ve4);color:var(--ve)}
  .br-b{background:var(--ro3);color:var(--ro)}
  .ba-b{background:var(--az3);color:var(--az)}
  .bam-b{background:var(--am3);color:var(--am)}
  .bpu-b{background:var(--pu3);color:var(--pu)}
  .ic{border:1.5px solid var(--gr3);border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;color:var(--txt);background:#fff;width:100%;outline:none;transition:border-color .15s}
  .ic:focus{border-color:var(--az2);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
  .toast{position:fixed;bottom:28px;right:28px;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:var(--sh2);z-index:999999;display:flex;align-items:center;gap:10px;animation:su .2s}
  .t-ok{background:#0F172A;color:#fff}.t-err{background:var(--ro);color:#fff}
  .overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
  .modal-box{background:#fff;border-radius:16px;box-shadow:var(--sh2);width:100%;max-width:560px;max-height:92vh;overflow-y:auto;animation:su .2s}
  .mh{padding:20px 24px 16px;border-bottom:1px solid var(--gr3);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:5;border-radius:16px 16px 0 0}
  .mb{padding:20px 24px}
  .mf{padding:14px 24px 20px;border-top:1px solid var(--gr3);display:flex;gap:10px;justify-content:flex-end}
  @keyframes su{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
  .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .6s linear infinite;flex-shrink:0}
  .spin-dark{width:28px;height:28px;border:3px solid var(--gr3);border-top-color:var(--az);border-radius:50%;animation:sp .6s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  /* Stats */
  .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:24px 0}
  .stat-card{background:#fff;border-radius:14px;border:1px solid var(--gr3);box-shadow:var(--sh);padding:18px 20px}
  .stat-num{font-size:26px;font-weight:700;color:var(--txt);margin-top:6px}
  .stat-lbl{font-size:12px;font-weight:600;color:var(--gr);text-transform:uppercase;letter-spacing:.5px}
  /* Tabs */
  .tabs{display:flex;gap:4px;background:var(--gr2);padding:4px;border-radius:10px;width:fit-content;margin-bottom:20px}
  .tab{padding:7px 18px;border-radius:7px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;color:var(--gr);background:transparent;transition:all .15s}
  .tab.act{background:#fff;color:var(--txt);box-shadow:var(--sh)}
  /* Tabla */
  .tbl-wrap{background:#fff;border-radius:14px;border:1px solid var(--gr3);overflow:hidden;box-shadow:var(--sh)}
  .tbl-head{padding:14px 20px;border-bottom:1px solid var(--gr3);display:flex;gap:12px;align-items:center}
  table.tbl{width:100%;border-collapse:collapse}
  table.tbl th{padding:11px 16px;text-align:left;font-size:11px;font-weight:700;color:var(--gr);text-transform:uppercase;letter-spacing:.5px;background:var(--gr2);border-bottom:1px solid var(--gr3)}
  table.tbl td{padding:13px 16px;font-size:14px;color:var(--txt);border-bottom:1px solid var(--gr3)}
  table.tbl tr:last-child td{border-bottom:none}
  table.tbl tr:hover td{background:#FAFBFC}
  /* Paginación */
  .pag{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--gr3);font-size:13px;color:var(--gr)}
  .pag-btns{display:flex;gap:4px}
  .pag-btn{padding:6px 12px;border-radius:7px;border:1px solid var(--gr3);background:#fff;cursor:pointer;font-size:13px;font-family:inherit;transition:all .12s}
  .pag-btn:hover:not(:disabled){background:var(--gr2)}.pag-btn:disabled{opacity:.4;cursor:not-allowed}
  .pag-btn.act-p{background:var(--az);color:#fff;border-color:var(--az)}
  /* Search */
  .search-wrap{position:relative;flex:1;max-width:320px}
  .search-wrap .ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gr);pointer-events:none}
  .search-wrap .ic{padding-left:36px}
`;

const POR_PAG = 12;

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Ventas() {
  const [ventas,        setVentas]        = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [buscar,        setBuscar]        = useState("");
  const [tab,           setTab]           = useState("todas");
  const [pag,           setPag]           = useState(1);
  const [toast,         setToast]         = useState(null);
  const [facturaVenta,  setFacturaVenta]  = useState(null); // venta para ver factura

  /* ── CSS ── */
  useEffect(() => {
    const id = "ventas-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const msg = useCallback((texto, tipo = "ok") => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ── Cargar ventas ── */
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await apiFetch("/ventas");
      setVentas(Array.isArray(data) ? data : data.data || data.ventas || []);
    } catch (e) {
      msg("Error al cargar ventas: " + e.message, "err");
      setVentas([]);
    } finally {
      setCargando(false);
    }
  }, [msg]);

  useEffect(() => { cargar(); }, [cargar]);

  /* ── Stats ── */
  const stats = {
    todas:      ventas.length,
    finalizada: ventas.filter(v => v.estado === "finalizada").length,
    borrador:   ventas.filter(v => v.estado === "borrador").length,
    cancelada:  ventas.filter(v => v.estado === "cancelada").length,
    ingresos:   ventas.filter(v => v.estado === "finalizada").reduce((s, v) => s + (v.total || 0), 0),
  };

  /* ── Filtro ── */
  const filtradas = ventas.filter(v => {
    if (tab !== "todas" && v.estado !== tab) return false;
    const q = buscar.toLowerCase();
    if (!q) return true;
    return (
      (v.clienteNombre || v.cliente?.nombre || "").toLowerCase().includes(q) ||
      (v.numeroFactura || "").toLowerCase().includes(q)
    );
  });

  const totalPags  = Math.max(1, Math.ceil(filtradas.length / POR_PAG));
  const pagActual  = Math.min(pag, totalPags);
  const visibles   = filtradas.slice((pagActual - 1) * POR_PAG, pagActual * POR_PAG);

  /* ── Imprimir factura ── */
  const imprimirFactura = (v) => {
    let compania = "Tu Tienda";
    try {
      const p = JSON.parse(atob(getToken().split('.')[1]));
      compania = p.companiaNombre || p.empresa || p.compania || compania;
    } catch {}
    const items   = v.items || [];
    const subtotal = v.subtotal || items.reduce((s, it) => s + (it.subtotal || it.cantidad * it.precioUnitario || 0), 0);
    const descuentoVal = v.descuento || 0;
    const total   = v.total || subtotal - descuentoVal;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Factura</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:24px;max-width:700px;margin:0 auto}
  h1{font-size:20px;font-weight:bold;text-align:center;margin-bottom:4px}
  h2{font-size:13px;text-align:center;color:#555;letter-spacing:2px;margin-bottom:16px}
  .fila-head{display:flex;justify-content:space-between;padding-bottom:14px;border-bottom:2px solid #000;margin-bottom:14px;font-size:12px}
  table{width:100%;border-collapse:collapse;margin:14px 0}
  th,td{border:1px solid #ccc;padding:7px 9px;font-size:12px}
  th{background:#f5f5f5;font-weight:bold}
  .right{text-align:right}.center{text-align:center}
  .totales{margin-top:12px;padding:12px;background:#f9f9f9;border:1px solid #ddd}
  .tot-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
  .tot-final{font-size:16px;font-weight:bold;border-top:2px solid #000;padding-top:8px;margin-top:4px}
  .footer{margin-top:24px;text-align:center;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:12px}
  @media print{@page{margin:12mm}}
</style></head><body>
<h1>${compania}</h1>
<h2>FACTURA DE VENTA</h2>
<div class="fila-head">
  <div>
    <div><strong>Cliente:</strong> ${v.clienteNombre || v.cliente?.nombre || "Consumidor Final"}</div>
    ${v.clienteId ? `<div><strong>Doc.:</strong> ${v.clienteId}</div>` : ''}
  </div>
  <div style="text-align:right">
    <div><strong>N°:</strong> ${v.numeroFactura || v._id || v.id}</div>
    <div><strong>Fecha:</strong> ${fechaCorta(v.updatedAt || v.createdAt)}</div>
    <div><strong>Pago:</strong> ${v.metodoPago || '—'}</div>
  </div>
</div>
<table>
  <thead><tr><th>Producto</th><th class="center">Cant.</th><th class="right">P. Unit.</th><th class="right">Subtotal</th></tr></thead>
  <tbody>
    ${items.map(it => `<tr>
      <td>${it.producto?.name || it.nombre || '—'}</td>
      <td class="center">${it.cantidad}</td>
      <td class="right">$ ${Number(it.precioUnitario || 0).toLocaleString('es-CO')}</td>
      <td class="right">$ ${Number(it.subtotal || it.cantidad * it.precioUnitario || 0).toLocaleString('es-CO')}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totales">
  <div class="tot-row"><span>Subtotal</span><span>$ ${Number(subtotal).toLocaleString('es-CO')}</span></div>
  ${descuentoVal > 0 ? `<div class="tot-row" style="color:#b45309"><span>Descuento</span><span>- $ ${Number(descuentoVal).toLocaleString('es-CO')}</span></div>` : ''}
  <div class="tot-row tot-final"><span>TOTAL</span><span>$ ${Number(total).toLocaleString('es-CO')}</span></div>
</div>
${v.notas ? `<p style="margin-top:12px;font-size:11px;color:#666">Notas: ${v.notas}</p>` : ''}
<div class="footer">${compania} · Generado el ${new Date().toLocaleString('es-CO')}</div>
</body></html>`;
    const w = window.open('', '_blank', 'width=800,height=700');
    if (!w) { msg("Permite ventanas emergentes para imprimir", "err"); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      <NavPos />
      <div style={{ padding:"28px 32px", maxWidth:1200, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:700, color:"#0F172A" }}>Ventas</h1>
          <p style={{ fontSize:14, color:"#64748B", marginTop:3 }}>
            Historial completo de todas las ventas
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { lbl:"Total ventas",   val: stats.todas,                   color:"var(--az)", icon:"📋" },
            { lbl:"Finalizadas",    val: stats.finalizada,              color:"var(--ve)", icon:"✅" },
            { lbl:"Pendientes",     val: stats.borrador,                color:"var(--am)", icon:"⏳" },
            { lbl:"Canceladas",     val: stats.cancelada,               color:"var(--ro)", icon:"❌" },
            { lbl:"Ingresos total", val:`$ ${fmt(stats.ingresos)}`,     color:"var(--ve)", icon:"💰" },
          ].map(s => (
            <div key={s.lbl} className="stat-card">
              <div style={{ fontSize:22 }}>{s.icon}</div>
              <div className="stat-num" style={{ color: s.color }}>{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Tabs + búsqueda */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.key} className={`tab ${tab === t.key ? "act" : ""}`}
                onClick={() => { setTab(t.key); setPag(1); }}>
                {t.label}
                <span style={{ marginLeft:6, fontSize:11, color: tab === t.key ? "var(--az)" : "var(--gr4)" }}>
                  {t.key === "todas" ? stats.todas : stats[t.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <span className="ico">🔍</span>
            <input className="ic" placeholder="Buscar por cliente o N° factura..."
              value={buscar}
              onChange={e => { setBuscar(e.target.value); setPag(1); }} />
          </div>
        </div>

        {/* Tabla */}
        <div className="tbl-wrap">
          {cargando ? (
            <div style={{ padding:40, display:"flex", alignItems:"center", justifyContent:"center", gap:12, color:"var(--gr)" }}>
              <div className="spin-dark" /> Cargando ventas...
            </div>
          ) : visibles.length === 0 ? (
            <div style={{ padding:48, textAlign:"center", color:"var(--gr)" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
              <p style={{ fontSize:14, fontWeight:500 }}>Sin ventas en esta sección</p>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>N° Factura</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(v => {
                  const id    = v._id || v.id;
                  const nits  = (v.items || []).reduce((s, it) => s + (it.cantidad || 1), 0);
                  const badge = BADGE[v.estado] || { label: v.estado, cls: "ba-b" };
                  return (
                    <tr key={id}>
                      <td style={{ fontWeight:700, color:"var(--az)", fontFamily:"monospace", fontSize:13, whiteSpace:"nowrap" }}>
                        {v.numeroFactura || <span style={{ color:"var(--gr4)", fontWeight:400, fontFamily:"inherit" }}>—</span>}
                      </td>
                      <td style={{ fontSize:12, color:"var(--gr)", whiteSpace:"nowrap" }}>
                        {fechaCorta(v.updatedAt || v.createdAt)}
                      </td>
                      <td style={{ fontWeight:600 }}>
                        {v.clienteNombre || v.cliente?.nombre || <span style={{ color:"var(--gr4)", fontWeight:400 }}>Sin cliente</span>}
                      </td>
                      <td>
                        <span className="badge ba-b">{nits} ítem{nits !== 1 ? "s" : ""}</span>
                      </td>
                      <td style={{ fontWeight:700, color:"var(--ve)" }}>$ {fmt(v.total)}</td>
                      <td style={{ fontSize:13 }}>
                        {METODO_LABEL[v.metodoPago] || v.metodoPago || "—"}
                      </td>
                      <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                      <td>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="btn bs" style={{ padding:"5px 12px", fontSize:12 }}
                            onClick={() => setFacturaVenta(v)}>
                            🧾 Ver factura
                          </button>
                          {v.estado === "borrador" && (
                            <a href="/Pos" className="btn bp" style={{ padding:"5px 12px", fontSize:12, textDecoration:"none" }}>
                              Abrir POS
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {!cargando && filtradas.length > POR_PAG && (
            <div className="pag">
              <span>{filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""}</span>
              <div className="pag-btns">
                <button className="pag-btn" disabled={pagActual === 1} onClick={() => setPag(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(totalPags, 7) }, (_, i) => {
                  const n = totalPags <= 7 ? i + 1
                    : pagActual <= 4 ? i + 1
                    : pagActual >= totalPags - 3 ? totalPags - 6 + i
                    : pagActual - 3 + i;
                  return (
                    <button key={n} className={`pag-btn ${n === pagActual ? "act-p" : ""}`}
                      onClick={() => setPag(n)}>{n}</button>
                  );
                })}
                <button className="pag-btn" disabled={pagActual === totalPags} onClick={() => setPag(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal factura ── */}
      {facturaVenta && createPortal(
        <div className="overlay">
          <div className="modal-box">
            <div className="mh">
              <h2 style={{ fontSize:17, fontWeight:700 }}>🧾 Factura</h2>
              <button className="bi" onClick={() => setFacturaVenta(null)} style={{ fontSize:20 }}>✕</button>
            </div>
            <div className="mb">
              {/* Encabezado */}
              <div style={{ textAlign:"center", paddingBottom:14, borderBottom:"1px solid var(--gr3)", marginBottom:14 }}>
                <div style={{ fontSize:17, fontWeight:700 }}>FACTURA DE VENTA</div>
                <div style={{ fontSize:12, color:"var(--gr)", marginTop:4 }}>
                  {facturaVenta.numeroFactura || (facturaVenta._id || facturaVenta.id)} · {fechaCorta(facturaVenta.updatedAt || facturaVenta.createdAt)}
                </div>
                <span className={`badge ${(BADGE[facturaVenta.estado] || { cls:"ba-b" }).cls}`} style={{ marginTop:6 }}>
                  {(BADGE[facturaVenta.estado] || { label: facturaVenta.estado }).label}
                </span>
              </div>
              {/* Cliente */}
              <div style={{ marginBottom:12, padding:"10px 12px", background:"var(--gr2)", borderRadius:8 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>
                  {facturaVenta.clienteNombre || facturaVenta.cliente?.nombre || "Consumidor Final"}
                </div>
                <div style={{ fontSize:12, color:"var(--gr)", marginTop:2 }}>
                  {METODO_LABEL[facturaVenta.metodoPago] || facturaVenta.metodoPago || "—"}
                </div>
              </div>
              {/* Productos */}
              <table style={{ width:"100%", fontSize:13, borderCollapse:"collapse", marginBottom:12 }}>
                <thead>
                  <tr style={{ background:"var(--gr2)" }}>
                    <th style={{ padding:"6px 8px", textAlign:"left", fontWeight:600 }}>Producto</th>
                    <th style={{ padding:"6px 8px", textAlign:"center", fontWeight:600 }}>Cant.</th>
                    <th style={{ padding:"6px 8px", textAlign:"right", fontWeight:600 }}>P.Unit</th>
                    <th style={{ padding:"6px 8px", textAlign:"right", fontWeight:600 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(facturaVenta.items || []).map((it, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid var(--gr3)" }}>
                      <td style={{ padding:"6px 8px" }}>{it.producto?.name || it.nombre || "—"}</td>
                      <td style={{ padding:"6px 8px", textAlign:"center" }}>{it.cantidad}</td>
                      <td style={{ padding:"6px 8px", textAlign:"right" }}>$ {fmt(it.precioUnitario)}</td>
                      <td style={{ padding:"6px 8px", textAlign:"right", fontWeight:600 }}>
                        $ {fmt(it.subtotal || it.cantidad * it.precioUnitario)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Totales */}
              <div style={{ padding:"10px 12px", background:"var(--gr2)", borderRadius:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span>Subtotal</span><span>$ {fmt(facturaVenta.subtotal)}</span>
                </div>
                {(facturaVenta.descuento > 0) && (
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"var(--am)", marginBottom:4 }}>
                    <span>Descuento</span><span>- $ {fmt(facturaVenta.descuento)}</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:700, borderTop:"1px solid var(--gr3)", paddingTop:8, marginTop:4 }}>
                  <span>TOTAL</span>
                  <span style={{ color:"var(--ve)" }}>$ {fmt(facturaVenta.total)}</span>
                </div>
              </div>
              {facturaVenta.notas && (
                <div style={{ marginTop:10, fontSize:12, color:"var(--gr)", padding:"8px 12px", background:"var(--am3)", borderRadius:8 }}>
                  Notas: {facturaVenta.notas}
                </div>
              )}
            </div>
            <div className="mf">
              <button className="btn bs" onClick={() => setFacturaVenta(null)}>Cerrar</button>
              <button className="btn bp" onClick={() => imprimirFactura(facturaVenta)}>🖨️ Imprimir</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && createPortal(
        <div className={`toast ${toast.tipo === "err" ? "t-err" : "t-ok"}`}>
          {toast.tipo === "err" ? "❌" : "✅"} {toast.texto}
        </div>,
        document.body
      )}
    </div>
  );
}
