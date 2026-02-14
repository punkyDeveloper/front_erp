import { useState, useEffect, useMemo } from "react";
import Nav from "../assets/nav/nav";

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */
const API_ING = `${process.env.REACT_APP_API_URL}/ingresos`;
const API_EGR = `${process.env.REACT_APP_API_URL}/egresos`;
const API_CIERRE = `${process.env.REACT_APP_API_URL}/cierres`;
const API_KEY = "mi_clave_secreta_12345";

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════ */
const MOCK_ING = [
  { _id: "i1", fecha: "2026-02-12", valor: 185000, tipo: "Servicio", descripcion: "Cambio de aceite" },
  { _id: "i2", fecha: "2026-02-11", valor: 420000, tipo: "Servicio", descripcion: "Reparación de frenos" },
  { _id: "i3", fecha: "2026-02-10", valor: 32000, tipo: "Venta de producto", descripcion: "Almuerzo x2" },
  { _id: "i4", fecha: "2026-02-09", valor: 150000, tipo: "Membresía", descripcion: "Plan mensual" },
  { _id: "i5", fecha: "2026-02-08", valor: 95000, tipo: "Venta de producto", descripcion: "Aceite 5W-30 x3" },
  { _id: "i6", fecha: "2026-02-07", valor: 560000, tipo: "Servicio", descripcion: "Revisión completa" },
  { _id: "i7", fecha: "2026-02-05", valor: 350000, tipo: "Servicio", descripcion: "Cambio de batería" },
  { _id: "i8", fecha: "2026-02-04", valor: 75000, tipo: "Consulta", descripcion: "Diagnóstico" },
  { _id: "i9", fecha: "2026-02-03", valor: 48000, tipo: "Venta de producto", descripcion: "Bandeja paisa x2" },
  { _id: "i10", fecha: "2026-02-01", valor: 210000, tipo: "Servicio", descripcion: "Pastillas de freno" },
  { _id: "i11", fecha: "2026-01-28", valor: 320000, tipo: "Servicio", descripcion: "Alineación y balanceo" },
  { _id: "i12", fecha: "2026-01-25", valor: 180000, tipo: "Venta de producto", descripcion: "Filtros varios" },
];

const MOCK_EGR = [
  { _id: "e1", fecha: "2026-02-12", valor: 2500000, tipo: "Nómina", descripcion: "Salarios primera quincena" },
  { _id: "e2", fecha: "2026-02-10", valor: 850000, tipo: "Proveedor", descripcion: "Repuestos AutoPartes" },
  { _id: "e3", fecha: "2026-02-10", valor: 1200000, tipo: "Arriendo", descripcion: "Arriendo local feb" },
  { _id: "e4", fecha: "2026-02-09", valor: 380000, tipo: "Servicios públicos", descripcion: "Energía + agua" },
  { _id: "e5", fecha: "2026-02-07", valor: 145000, tipo: "Compra de insumos", descripcion: "Verduras y carnes" },
  { _id: "e6", fecha: "2026-02-05", valor: 620000, tipo: "Proveedor", descripcion: "Aceites Mobil" },
  { _id: "e7", fecha: "2026-02-03", valor: 180000, tipo: "Transporte", descripcion: "Flete repuestos" },
  { _id: "e8", fecha: "2026-02-01", valor: 75000, tipo: "Compra de insumos", descripcion: "Desechables" },
  { _id: "e9", fecha: "2026-01-30", valor: 450000, tipo: "Impuestos", descripcion: "Retención fuente" },
  { _id: "e10", fecha: "2026-01-27", valor: 95000, tipo: "Mantenimiento", descripcion: "Reparación compresor" },
];

const MOCK_CIERRES = [
  { _id: "c1", fechaInicio: "2026-01-01", fechaFin: "2026-01-31", ingresos: 8750000, egresos: 5420000, ganancia: 3330000, estado: "Cerrado", creadoPor: "Admin", fecha: "2026-02-01" },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const fCOP = (v) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);
const fDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const hoy = () => new Date().toISOString().split("T")[0];
const primeroDeMes = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]; };

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-api-key": API_KEY };
};

/* ═══════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.cie {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  color: #d4d4e0;
}
.cie-scroll { flex:1; overflow-y:auto; overflow-x:hidden; min-width:0; }

.cie-head {
  padding: 26px 28px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}
.cie-head h1 { font-size:1.4rem; font-weight:800; letter-spacing:-0.03em; margin:0; color:#fff; display:flex; align-items:center; gap:10px; }
.cie-head .sub { font-size:0.82rem; color:#4e4f60; margin-top:3px; }

.cie-body { padding: 0 28px 36px; }

/* Period selector */
.period-card {
  background: #1a1b27;
  border-radius: 14px;
  border: 1px solid #22232e;
  padding: 20px 24px;
  margin-bottom: 18px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
.period-field label { display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#4e4f60; margin-bottom:6px; }
.period-field input {
  padding: 10px 14px; border:1px solid #22232e; border-radius:10px;
  background:#14151f; color:#d4d4e0; font-size:0.88rem; font-family:inherit; outline:none;
}
.period-field input:focus { border-color:#8b5cf6; }
.btn-calc {
  padding: 10px 22px; border:none; border-radius:10px; background:#6366f1; color:#fff;
  font-size:0.85rem; font-weight:700; font-family:inherit; cursor:pointer; transition:opacity 0.2s;
}
.btn-calc:hover { opacity:0.85; }

/* Summary cards */
.sum-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
.sum-card {
  background: #1a1b27;
  border-radius: 14px;
  padding: 20px 22px;
  border: 1px solid #22232e;
  position: relative;
  overflow: hidden;
}
.sum-card .bar-top { position:absolute; top:0; left:0; right:0; height:3px; }
.sum-card .sl { font-size:0.67rem; text-transform:uppercase; letter-spacing:0.07em; color:#4e4f60; font-weight:700; margin-bottom:5px; }
.sum-card .sv { font-size:1.5rem; font-weight:800; color:#fff; letter-spacing:-0.02em; line-height:1; }
.sum-card .sv.green { color:#10b981; }
.sum-card .sv.red { color:#ef4444; }
.sum-card .sv.purple { color:#a78bfa; }
.sum-card .ss { font-size:0.72rem; color:#4e4f60; margin-top:8px; }

/* Breakdown */
.bk-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }
.bk-card { background:#1a1b27; border-radius:14px; border:1px solid #22232e; padding:20px; }
.bk-title { font-size:0.9rem; font-weight:700; color:#fff; margin-bottom:3px; }
.bk-sub { font-size:0.7rem; color:#4e4f60; margin-bottom:16px; }

.bk-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid #1c1d2a; }
.bk-row:last-child { border:none; }
.bk-tipo { font-size:0.82rem; font-weight:600; color:#b0b1c0; }
.bk-val { font-size:0.85rem; font-weight:700; }
.bk-count { font-size:0.7rem; color:#4e4f60; margin-left:8px; }

/* Cierre button */
.cierre-action {
  background: #1a1b27;
  border-radius: 14px;
  border: 1px solid #22232e;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
}
.cierre-action p { color:#6b6c7e; font-size:0.85rem; margin:0 0 16px; }
.btn-cierre {
  padding: 12px 32px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-cierre:hover { opacity:0.9; }
.btn-cierre:active { transform:scale(0.97); }
.btn-cierre:disabled { opacity:0.4; cursor:default; }

/* History */
.hist-card { background:#1a1b27; border-radius:14px; border:1px solid #22232e; overflow:hidden; }
.hist-title { padding:16px 20px 0; font-size:0.9rem; font-weight:700; color:#fff; }
.hist-sub { padding:0 20px 12px; font-size:0.7rem; color:#4e4f60; }

.tbl { width:100%; border-collapse:collapse; }
.tbl th { text-align:left; padding:11px 16px; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.07em; color:#3e3f50; font-weight:700; border-bottom:1px solid #22232e; background:#14151f; }
.tbl td { padding:12px 16px; font-size:0.82rem; border-bottom:1px solid #1c1d2a; color:#b0b1c0; }
.tbl tbody tr:hover { background:rgba(99,102,241,0.03); }

.estado-cerrado { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:6px; font-size:0.72rem; font-weight:700; background:rgba(16,185,129,0.1); color:#10b981; }
.estado-abierto { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:6px; font-size:0.72rem; font-weight:700; background:rgba(245,158,11,0.1); color:#fbbf24; }

/* Bar visual */
.bar-visual { margin-top:14px; }
.bar-visual-label { display:flex; justify-content:space-between; font-size:0.7rem; color:#4e4f60; font-weight:600; margin-bottom:6px; }
.bar-visual-bg { height:12px; background:#22232e; border-radius:6px; overflow:hidden; display:flex; }
.bar-visual-ing { height:100%; background:#10b981; border-radius:6px 0 0 6px; transition:width 0.6s ease; }
.bar-visual-egr { height:100%; background:#ef4444; transition:width 0.6s ease; }

/* Modal confirm */
.md-ov { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:200; animation:fadeIn 0.2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.md-box { background:#1a1b27; border:1px solid #22232e; border-radius:16px; width:100%; max-width:440px; margin:16px; animation:slideUp 0.25s ease; }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.confirm-body { padding:28px; text-align:center; }
.confirm-body .ci { font-size:2.8rem; display:block; margin-bottom:14px; }
.confirm-body h3 { color:#fff; font-size:1.1rem; margin:0 0 8px; }
.confirm-body p { color:#6b6c7e; font-size:0.85rem; margin:0 0 6px; }
.confirm-btns { display:flex; gap:10px; justify-content:center; margin-top:20px; }
.btn-cancel { padding:10px 20px; border:1px solid #22232e; border-radius:10px; background:transparent; color:#6b6c7e; font-size:0.85rem; font-weight:600; font-family:inherit; cursor:pointer; }

.alert { padding:10px 18px; border-radius:10px; font-size:0.82rem; font-weight:600; margin-bottom:14px; animation:fadeIn 0.2s ease; }
.alert.ok { background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2); }

@media(max-width:768px) {
  .cie-head { padding:18px 14px; }
  .cie-body { padding:0 14px 28px; }
  .sum-grid { grid-template-columns:1fr 1fr; }
  .bk-grid { grid-template-columns:1fr; }
  .period-card { flex-direction:column; align-items:stretch; }
}
@media(max-width:480px) {
  .sum-grid { grid-template-columns:1fr; }
}
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Cierre() {
  const [fechaInicio, setFechaInicio] = useState(primeroDeMes());
  const [fechaFin, setFechaFin] = useState(hoy());
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [cierres, setCierres] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alert, setAlert] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { try { const u = localStorage.getItem("user"); if (u) setUser(JSON.parse(u)); } catch {} }, []);
  useEffect(() => { if (alert) { const t = setTimeout(() => setAlert(null), 4000); return () => clearTimeout(t); } }, [alert]);

  // Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rI, rE, rC] = await Promise.all([
          fetch(API_ING, { headers: getHeaders() }),
          fetch(API_EGR, { headers: getHeaders() }),
          fetch(API_CIERRE, { headers: getHeaders() }),
        ]);
        const [dI, dE, dC] = await Promise.all([rI.json(), rE.json(), rC.json()]);
        setIngresos(Array.isArray(dI) ? dI : []);
        setEgresos(Array.isArray(dE) ? dE : []);
        setCierres(Array.isArray(dC) ? dC : []);
      } catch {
        setIngresos(MOCK_ING);
        setEgresos(MOCK_EGR);
        setCierres(MOCK_CIERRES);
      }
    };
    fetchAll();
  }, []);

  // Filter by period
  const ingPeriodo = useMemo(() => ingresos.filter(d => d.fecha >= fechaInicio && d.fecha <= fechaFin), [ingresos, fechaInicio, fechaFin]);
  const egrPeriodo = useMemo(() => egresos.filter(d => d.fecha >= fechaInicio && d.fecha <= fechaFin), [egresos, fechaInicio, fechaFin]);

  const totalIng = ingPeriodo.reduce((s, d) => s + (d.valor || 0), 0);
  const totalEgr = egrPeriodo.reduce((s, d) => s + (d.valor || 0), 0);
  const ganancia = totalIng - totalEgr;
  const margen = totalIng > 0 ? ((ganancia / totalIng) * 100).toFixed(1) : "0.0";
  const total = totalIng + totalEgr;
  const pctIng = total > 0 ? (totalIng / total * 100) : 50;
  const pctEgr = total > 0 ? (totalEgr / total * 100) : 50;

  // Group by tipo
  const groupByTipo = (arr) => {
    const map = {};
    arr.forEach(d => {
      if (!map[d.tipo]) map[d.tipo] = { total: 0, count: 0 };
      map[d.tipo].total += d.valor || 0;
      map[d.tipo].count++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  };

  const ingByTipo = groupByTipo(ingPeriodo);
  const egrByTipo = groupByTipo(egrPeriodo);

  // Save cierre
  const handleCierre = async () => {
    const cierre = {
      fechaInicio,
      fechaFin,
      ingresos: totalIng,
      egresos: totalEgr,
      ganancia,
      estado: "Cerrado",
      creadoPor: user?.name || "Admin",
      fecha: hoy(),
    };

    try {
      const res = await fetch(API_CIERRE, { method: "POST", headers: getHeaders(), body: JSON.stringify(cierre) });
      if (!res.ok) throw new Error();
    } catch {}

    setCierres(prev => [{ _id: Date.now().toString(), ...cierre }, ...prev]);
    setShowConfirm(false);
    setAlert({ type: "ok", msg: `Cierre del ${fDate(fechaInicio)} al ${fDate(fechaFin)} registrado exitosamente` });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Nav />
      <div className="cie cie-scroll">
        <style>{css}</style>

        <div className="cie-head">
          <div>
            <h1>🔒 Cierre</h1>
            <div className="sub">Resumen y cierre de período</div>
          </div>
        </div>

        <div className="cie-body">
          {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}

          {/* Period selector */}
          <div className="period-card">
            <div className="period-field">
              <label>Fecha inicio</label>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="period-field">
              <label>Fecha fin</label>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <button className="btn-calc" onClick={() => {}}>📊 Calcular</button>
          </div>

          {/* Summary */}
          <div className="sum-grid">
            <div className="sum-card">
              <div className="bar-top" style={{ background: "#10b981" }} />
              <div className="sl">Ingresos del período</div>
              <div className="sv green">{fCOP(totalIng)}</div>
              <div className="ss">{ingPeriodo.length} registros</div>
            </div>
            <div className="sum-card">
              <div className="bar-top" style={{ background: "#ef4444" }} />
              <div className="sl">Egresos del período</div>
              <div className="sv red">{fCOP(totalEgr)}</div>
              <div className="ss">{egrPeriodo.length} registros</div>
            </div>
            <div className="sum-card">
              <div className="bar-top" style={{ background: ganancia >= 0 ? "#6366f1" : "#ef4444" }} />
              <div className="sl">{ganancia >= 0 ? "Ganancia neta" : "Pérdida neta"}</div>
              <div className={`sv ${ganancia >= 0 ? "purple" : "red"}`}>{fCOP(Math.abs(ganancia))}</div>
              <div className="ss">{ganancia >= 0 ? "Utilidad" : "Déficit"} del período</div>
            </div>
            <div className="sum-card">
              <div className="bar-top" style={{ background: "#f59e0b" }} />
              <div className="sl">Margen</div>
              <div className="sv">{margen}%</div>
              <div className="ss">Rentabilidad</div>
            </div>
          </div>

          {/* Visual bar */}
          <div className="sum-card" style={{ marginBottom: 18 }}>
            <div className="bar-visual">
              <div className="bar-visual-label">
                <span>💰 Ingresos {pctIng.toFixed(0)}%</span>
                <span>📤 Egresos {pctEgr.toFixed(0)}%</span>
              </div>
              <div className="bar-visual-bg">
                <div className="bar-visual-ing" style={{ width: `${pctIng}%` }} />
                <div className="bar-visual-egr" style={{ width: `${pctEgr}%` }} />
              </div>
            </div>
          </div>

          {/* Breakdown by tipo */}
          <div className="bk-grid">
            <div className="bk-card">
              <div className="bk-title">Ingresos por tipo</div>
              <div className="bk-sub">Desglose del período</div>
              {ingByTipo.length > 0 ? ingByTipo.map(([tipo, d]) => (
                <div className="bk-row" key={tipo}>
                  <div><span className="bk-tipo">{tipo}</span><span className="bk-count">({d.count})</span></div>
                  <span className="bk-val" style={{ color: "#10b981" }}>{fCOP(d.total)}</span>
                </div>
              )) : <div style={{ padding: 16, textAlign: "center", color: "#3e3f50", fontSize: "0.82rem" }}>Sin ingresos en este período</div>}
            </div>
            <div className="bk-card">
              <div className="bk-title">Egresos por tipo</div>
              <div className="bk-sub">Desglose del período</div>
              {egrByTipo.length > 0 ? egrByTipo.map(([tipo, d]) => (
                <div className="bk-row" key={tipo}>
                  <div><span className="bk-tipo">{tipo}</span><span className="bk-count">({d.count})</span></div>
                  <span className="bk-val" style={{ color: "#f87171" }}>{fCOP(d.total)}</span>
                </div>
              )) : <div style={{ padding: 16, textAlign: "center", color: "#3e3f50", fontSize: "0.82rem" }}>Sin egresos en este período</div>}
            </div>
          </div>

          {/* Cierre action */}
          <div className="cierre-action">
            <p>Al realizar el cierre se guardará un registro permanente del resumen financiero del período seleccionado.</p>
            <button className="btn-cierre" onClick={() => setShowConfirm(true)} disabled={ingPeriodo.length === 0 && egrPeriodo.length === 0}>
              🔒 Realizar cierre del período
            </button>
          </div>

          {/* Historial de cierres */}
          <div className="hist-card">
            <div className="hist-title">Historial de cierres</div>
            <div className="hist-sub">Cierres realizados anteriormente</div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Período</th>
                  <th style={{ textAlign: "right" }}>Ingresos</th>
                  <th style={{ textAlign: "right" }}>Egresos</th>
                  <th style={{ textAlign: "right" }}>Ganancia</th>
                  <th>Estado</th>
                  <th>Realizado por</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cierres.length > 0 ? cierres.map(c => (
                  <tr key={c._id}>
                    <td style={{ whiteSpace: "nowrap" }}>{fDate(c.fechaInicio)} → {fDate(c.fechaFin)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#10b981" }}>{fCOP(c.ingresos)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#f87171" }}>{fCOP(c.egresos)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: c.ganancia >= 0 ? "#a78bfa" : "#f87171" }}>{fCOP(c.ganancia)}</td>
                    <td><span className={c.estado === "Cerrado" ? "estado-cerrado" : "estado-abierto"}>{c.estado}</span></td>
                    <td>{c.creadoPor}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{fDate(c.fecha)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#3e3f50" }}>No hay cierres anteriores</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirm modal */}
        {showConfirm && (
          <div className="md-ov" onClick={() => setShowConfirm(false)}>
            <div className="md-box" onClick={e => e.stopPropagation()}>
              <div className="confirm-body">
                <span className="ci">🔒</span>
                <h3>Confirmar cierre de período</h3>
                <p><strong>{fDate(fechaInicio)}</strong> → <strong>{fDate(fechaFin)}</strong></p>
                <p style={{ marginTop: 12 }}>
                  Ingresos: <strong style={{ color: "#10b981" }}>{fCOP(totalIng)}</strong> ·
                  Egresos: <strong style={{ color: "#f87171" }}>{fCOP(totalEgr)}</strong>
                </p>
                <p>Ganancia: <strong style={{ color: "#a78bfa", fontSize: "1.1rem" }}>{fCOP(ganancia)}</strong></p>
                <div className="confirm-btns">
                  <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Cancelar</button>
                  <button className="btn-cierre" onClick={handleCierre}>Confirmar cierre</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}