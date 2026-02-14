import { useState, useEffect, useCallback } from "react";
import Nav from "../assets/nav/nav";
import { usePermisos } from "../context/PermissionsContext";

/* ═══════════════════════════════════════════════════════════
   CONFIG — apunta al endpoint unificado de movimientos
   ═══════════════════════════════════════════════════════════ */
const API_URL = `${process.env.REACT_APP_API_URL}/movimientos`;

const TIPOS = [
  "Nómina", "Proveedor", "Arriendo", "Servicios públicos",
  "Mantenimiento", "Compra de insumos", "Impuestos", "Transporte", "Otro"
];

const PAGE_OPTIONS = [10, 20, 50];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const fCOP = (v) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);
const fDate = (d) => {
  if (!d) return "—";
  const fecha = d.includes("T") ? d.split("T")[0] : d;
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};
const hoy = () => new Date().toISOString().split("T")[0];
const getFecha = (d) => d ? (d.includes("T") ? d.split("T")[0] : d) : "";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.egr {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  color: #d4d4e0;
}
.egr-scroll { flex:1; overflow-y:auto; overflow-x:hidden; min-width:0; }

.egr-head {
  padding: 26px 28px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}
.egr-head h1 { font-size:1.4rem; font-weight:800; letter-spacing:-0.03em; margin:0; color:#fff; display:flex; align-items:center; gap:10px; }
.egr-head .sub { font-size:0.82rem; color:#4e4f60; margin-top:3px; }

.btn-new-e {
  padding: 10px 22px; border: none; border-radius: 10px; background: #ef4444;
  color: #fff; font-size: 0.85rem; font-weight: 700; font-family: inherit;
  cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;
}
.btn-new-e:hover { opacity:0.85; }

.egr-body { padding: 0 28px 36px; }

.egr-kpis { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:18px; }
.egr-kpi { background:#1a1b27; border-radius:14px; padding:18px 20px; border:1px solid #22232e; }
.egr-kpi .kl { font-size:0.67rem; text-transform:uppercase; letter-spacing:0.07em; color:#4e4f60; font-weight:700; margin-bottom:4px; }
.egr-kpi .kv { font-size:1.35rem; font-weight:800; color:#fff; letter-spacing:-0.02em; }
.egr-kpi .kv.red { color:#ef4444; }

.egr-toolbar { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; align-items:center; }
.egr-search {
  flex:1; min-width:200px; padding:10px 16px; border:1px solid #22232e; border-radius:10px;
  background:#1a1b27; color:#d4d4e0; font-size:0.85rem; font-family:inherit; outline:none;
}
.egr-search:focus { border-color:#ef4444; }
.egr-search::placeholder { color:#3e3f50; }

.egr-filter {
  padding:10px 16px; border:1px solid #22232e; border-radius:10px;
  background:#1a1b27; color:#d4d4e0; font-size:0.82rem; font-family:inherit; outline:none; cursor:pointer;
}

.egr-card { background:#1a1b27; border-radius:14px; border:1px solid #22232e; overflow:hidden; margin-bottom:14px; }

.tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
.tbl-wrap::-webkit-scrollbar { height:4px; }
.tbl-wrap::-webkit-scrollbar-thumb { background:#22232e; border-radius:2px; }
.tbl-wrap table { min-width:700px; }

.tbl { width:100%; border-collapse:collapse; }
.tbl th { text-align:left; padding:12px 16px; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.07em; color:#3e3f50; font-weight:700; border-bottom:1px solid #22232e; background:#14151f; }
.tbl td { padding:13px 16px; font-size:0.83rem; border-bottom:1px solid #1c1d2a; color:#b0b1c0; }
.tbl tbody tr { transition:background 0.15s; }
.tbl tbody tr:hover { background:rgba(239,68,68,0.03); }

.tipo-badge-e { display:inline-block; padding:3px 10px; border-radius:6px; font-size:0.72rem; font-weight:700; background:rgba(239,68,68,0.1); color:#f87171; }
.ref-e { font-family:monospace; font-size:0.78rem; color:#ef4444; font-weight:600; }
.creador { font-size:0.78rem; color:#818cf8; font-weight:600; }

.actions { display:flex; gap:6px; }
.btn-sm { padding:5px 10px; border:none; border-radius:7px; font-size:0.75rem; font-weight:700; font-family:inherit; cursor:pointer; transition:opacity 0.2s; }
.btn-sm:hover { opacity:0.8; }
.btn-edit { background:rgba(99,102,241,0.12); color:#818cf8; }
.btn-del { background:rgba(239,68,68,0.1); color:#f87171; }

.pag { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; flex-wrap:wrap; gap:10px; border-top:1px solid #1c1d2a; }
.pag-info { font-size:0.78rem; color:#4e4f60; }
.pag-btns { display:flex; gap:4px; align-items:center; }
.pag-btn { padding:5px 12px; border:1px solid #22232e; border-radius:7px; background:transparent; color:#6b6c7e; font-size:0.78rem; font-family:inherit; cursor:pointer; transition:all 0.15s; }
.pag-btn:hover:not(:disabled) { border-color:#ef4444; color:#fff; }
.pag-btn:disabled { opacity:0.3; cursor:default; }
.pag-btn.on { background:#ef4444; color:#fff; border-color:#ef4444; }
.pag-sel { padding:5px 10px; border:1px solid #22232e; border-radius:7px; background:#14151f; color:#b0b1c0; font-size:0.78rem; font-family:inherit; outline:none; cursor:pointer; }

/* Modal */
.md-ov { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:200; animation:fadeIn 0.2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.md-box { background:#1a1b27; border:1px solid #22232e; border-radius:16px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; margin:16px; animation:slideUp 0.25s ease; }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.md-head { padding:20px 24px; border-bottom:1px solid #22232e; display:flex; justify-content:space-between; align-items:center; }
.md-head h2 { font-size:1.05rem; font-weight:800; color:#fff; margin:0; }
.md-close { background:none; border:none; color:#4e4f60; font-size:1.2rem; cursor:pointer; }
.md-close:hover { color:#fff; }
.md-body { padding:20px 24px; }
.field { margin-bottom:16px; }
.field label { display:block; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#4e4f60; margin-bottom:6px; }
.field input, .field select, .field textarea { width:100%; padding:10px 14px; border:1px solid #22232e; border-radius:10px; background:#14151f; color:#d4d4e0; font-size:0.88rem; font-family:inherit; outline:none; transition:border-color 0.2s; }
.field input:focus, .field select:focus, .field textarea:focus { border-color:#ef4444; }
.field textarea { resize:vertical; min-height:60px; }
.field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.md-foot { padding:16px 24px 20px; display:flex; justify-content:flex-end; gap:10px; }
.btn-cancel { padding:10px 20px; border:1px solid #22232e; border-radius:10px; background:transparent; color:#6b6c7e; font-size:0.85rem; font-weight:600; font-family:inherit; cursor:pointer; }
.btn-save-e { padding:10px 24px; border:none; border-radius:10px; background:#ef4444; color:#fff; font-size:0.85rem; font-weight:700; font-family:inherit; cursor:pointer; }
.btn-save-e:disabled { opacity:0.5; cursor:default; }

.empty { text-align:center; padding:40px; color:#3e3f50; }
.empty .ei { font-size:2.5rem; display:block; margin-bottom:10px; }
.empty h3 { color:#6b6c7e; font-size:1rem; margin:0 0 4px; }
.empty p { font-size:0.82rem; margin:0; }

.alert { padding:10px 18px; border-radius:10px; font-size:0.82rem; font-weight:600; margin-bottom:14px; animation:fadeIn 0.2s ease; }
.alert.ok { background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2); }
.alert.err { background:rgba(239,68,68,0.1); color:#f87171; border:1px solid rgba(239,68,68,0.2); }

.confirm-body { padding:24px; text-align:center; }
.confirm-body .ci { font-size:2.5rem; display:block; margin-bottom:12px; }
.confirm-body h3 { color:#fff; font-size:1rem; margin:0 0 6px; }
.confirm-body p { color:#6b6c7e; font-size:0.85rem; margin:0 0 20px; }
.confirm-btns { display:flex; gap:10px; justify-content:center; }

@media(max-width:768px) {
  .egr-head { padding:18px 14px; }
  .egr-body { padding:0 14px 28px; }
  .egr-kpis { grid-template-columns:1fr; }
  .egr-toolbar { flex-direction:column; }
  .egr-search { min-width:100%; }
  .field-row { grid-template-columns:1fr; }
  .pag { flex-direction:column; align-items:stretch; }
}
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
const EMPTY_FORM = { fecha: hoy(), valor: "", tipo: "Proveedor", descripcion: "" };

export default function Egresos() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Permisos ──
  const { tienePermiso } = usePermisos();
  const puedeCrear = tienePermiso("crear_movimientos");
  const puedeEditar = tienePermiso("editar_movimientos");
  const puedeEliminar = tienePermiso("eliminar_movimientos");

  // ── GET solo egresos de la empresa (filtrado por JWT + query param) ──
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?tipo_movimiento=egreso`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      setData([]);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (alert) { const t = setTimeout(() => setAlert(null), 3500); return () => clearTimeout(t); } }, [alert]);
  useEffect(() => { setPage(1); }, [search, filterTipo]);

  // ── Filtro local y paginación ──
  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const ms = !q
      || d.descripcion?.toLowerCase().includes(q)
      || d.referencia?.toLowerCase().includes(q)
      || d.tipo?.toLowerCase().includes(q)
      || d.nombre?.toLowerCase().includes(q);
    const mt = !filterTipo || d.tipo === filterTipo;
    return ms && mt;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  // ── Totales ──
  const totalGeneral = data.reduce((s, d) => s + (d.valor || 0), 0);
  const totalMes = data.filter(d => {
    const f = new Date(d.fecha);
    const n = new Date();
    return f.getMonth() === n.getMonth() && f.getFullYear() === n.getFullYear();
  }).reduce((s, d) => s + (d.valor || 0), 0);

  // ── Modal ──
  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      fecha: getFecha(item.fecha),
      valor: item.valor,
      tipo: item.tipo,
      descripcion: item.descripcion || "",
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  // ── POST / PUT ──
  const handleSave = async () => {
    if (!form.valor || !form.fecha || !form.tipo) return;
    setSaving(true);
    try {
      // Solo envía lo que el backend espera
      const body = {
        tipo_movimiento: "egreso",
        fecha: form.fecha,
        valor: Number(form.valor),
        tipo: form.tipo,
        descripcion: form.descripcion,
      };

      const url = editing ? `${API_URL}/${editing._id}` : API_URL;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAlert({ type: "err", msg: err.msg || "Error al guardar" });
        return;
      }

      setAlert({ type: "ok", msg: editing ? "Egreso actualizado" : "Egreso registrado" });
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      setAlert({ type: "err", msg: "Error de conexión con el servidor" });
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_URL}/${deleteTarget._id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAlert({ type: "err", msg: err.msg || "Error al eliminar" });
        setDeleteTarget(null);
        return;
      }
      setDeleteTarget(null);
      setAlert({ type: "ok", msg: "Egreso eliminado" });
      fetchData();
    } catch {
      setAlert({ type: "err", msg: "Error de conexión" });
      setDeleteTarget(null);
    }
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showAcciones = puedeEditar || puedeEliminar;
  const colCount = showAcciones ? 7 : 6;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Nav />
      <div className="egr egr-scroll">
        <style>{css}</style>

        {/* ── Header ── */}
        <div className="egr-head">
          <div>
            <h1>📤 Egresos</h1>
            <div className="sub">Registro de gastos y egresos del negocio</div>
          </div>
          {puedeCrear && (
            <button className="btn-new-e" onClick={openNew}>+ Nuevo egreso</button>
          )}
        </div>

        <div className="egr-body">
          {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}

          {/* ── KPIs ── */}
          <div className="egr-kpis">
            <div className="egr-kpi"><div className="kl">Total registros</div><div className="kv">{data.length}</div></div>
            <div className="egr-kpi"><div className="kl">Egresos del mes</div><div className="kv red">{fCOP(totalMes)}</div></div>
            <div className="egr-kpi"><div className="kl">Egresos totales</div><div className="kv red">{fCOP(totalGeneral)}</div></div>
          </div>

          {/* ── Toolbar ── */}
          <div className="egr-toolbar">
            <input className="egr-search" placeholder="Buscar por descripción, referencia, tipo, creador..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="egr-filter" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* ── Tabla ── */}
          <div className="egr-card">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Referencia</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Creado por</th>
                    <th style={{ textAlign: "right" }}>Valor</th>
                    {showAcciones && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? paginated.map(d => (
                    <tr key={d._id}>
                      <td><span className="ref-e">{d.referencia || "—"}</span></td>
                      <td style={{ whiteSpace: "nowrap" }}>{fDate(d.fecha)}</td>
                      <td><span className="tipo-badge-e">{d.tipo}</span></td>
                      <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.descripcion || "—"}
                      </td>
                      <td><span className="creador">{d.nombre || "—"}</span></td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#f87171", fontVariantNumeric: "tabular-nums" }}>
                        {fCOP(d.valor)}
                      </td>
                      {showAcciones && (
                        <td>
                          <div className="actions">
                            {puedeEditar && (
                              <button className="btn-sm btn-edit" onClick={() => openEdit(d)}>✏️</button>
                            )}
                            {puedeEliminar && (
                              <button className="btn-sm btn-del" onClick={() => setDeleteTarget(d)}>🗑️</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={colCount}>
                        <div className="empty">
                          <span className="ei">📋</span>
                          <h3>Sin registros</h3>
                          <p>No hay egresos que coincidan</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Paginación ── */}
            <div className="pag">
              <div className="pag-info">{filtered.length} registro{filtered.length !== 1 ? "s" : ""} · Pág {safePage} de {totalPages}</div>
              <div className="pag-btns">
                <select className="pag-sel" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  {PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} / pág</option>)}
                </select>
                <button className="pag-btn" disabled={safePage <= 1} onClick={() => setPage(1)}>«</button>
                <button className="pag-btn" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let num;
                  if (totalPages <= 5) num = i + 1;
                  else if (safePage <= 3) num = i + 1;
                  else if (safePage >= totalPages - 2) num = totalPages - 4 + i;
                  else num = safePage - 2 + i;
                  return <button key={num} className={`pag-btn ${num === safePage ? "on" : ""}`} onClick={() => setPage(num)}>{num}</button>;
                })}
                <button className="pag-btn" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                <button className="pag-btn" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>»</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Crear/Editar ── */}
      {showModal && (
        <div className="md-ov" onClick={closeModal}>
          <div className="md-box" onClick={e => e.stopPropagation()}>
            <div className="md-head">
              <h2>{editing ? "Editar egreso" : "Nuevo egreso"}</h2>
              <button className="md-close" onClick={closeModal}>✕</button>
            </div>
            <div className="md-body">
              <div className="field-row">
                <div className="field">
                  <label>Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => upd("fecha", e.target.value)} />
                </div>
                <div className="field">
                  <label>Valor (COP)</label>
                  <input type="number" min="1" placeholder="0" value={form.valor} onChange={e => upd("valor", e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Tipo de egreso</label>
                <select value={form.tipo} onChange={e => upd("tipo", e.target.value)}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Descripción</label>
                <textarea placeholder="Detalle del egreso..." value={form.descripcion} onChange={e => upd("descripcion", e.target.value)} />
              </div>
            </div>
            <div className="md-foot">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn-save-e" onClick={handleSave} disabled={saving || !form.valor || !form.fecha || !form.descripcion}>
                {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Delete ── */}
      {deleteTarget && (
        <div className="md-ov" onClick={() => setDeleteTarget(null)}>
          <div className="md-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="confirm-body">
              <span className="ci">⚠️</span>
              <h3>¿Eliminar este egreso?</h3>
              <p>
                <strong>{deleteTarget.referencia}</strong> — {deleteTarget.descripcion || "Sin descripción"}
                <br />
                <span style={{ color: "#f87171", fontWeight: 700 }}>{fCOP(deleteTarget.valor)}</span>
              </p>
              <div className="confirm-btns">
                <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                <button className="btn-sm btn-del" style={{ padding: "10px 20px", fontSize: "0.85rem" }} onClick={confirmDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}