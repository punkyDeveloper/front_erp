import { useState, useEffect, useMemo, useCallback } from "react";
import Nav from "./assets/nav/nav";
import { usePermisos } from "./context/PermissionsContext";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */
const API     = process.env.REACT_APP_API_URL ;
const HEADERS = { "Content-Type": "application/json", "x-api-key": "mi_clave_secreta_12345" };
const POLL_MS = 90_000; // 90 seg — para POS y Restaurante

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const fCOP   = (v) => new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0 }).format(v);
const fShort = (v) => v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v/1_000).toFixed(0)}K` : fCOP(v);
const fDate  = (d) => new Date(d+"T12:00:00").toLocaleDateString("es-CO",{day:"2-digit",month:"short"});

/* ═══════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;}
.D{font-family:'Plus Jakarta Sans',sans-serif;background:#0f1117;min-height:100vh;color:#d4d4e0;}
.D-scroll{flex:1;overflow-y:auto;overflow-x:hidden;min-width:0;}
.D-head{padding:26px 28px 18px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:14px;}
.D-head h1{font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;margin:0;color:#fff;}
.D-head .sub{font-size:0.82rem;color:#4e4f60;margin-top:3px;}
.tabs{display:flex;gap:3px;background:#1a1b27;border-radius:10px;padding:3px;}
.tab{padding:6px 15px;border:none;border-radius:8px;background:transparent;color:#6b6c7e;font-size:0.78rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;}
.tab.on{background:#6366f1;color:#fff;}
.tab:hover:not(.on){color:#a5a6b8;}
.D-body{padding:0 28px 36px;}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;}
.kpi{background:#1a1b27;border-radius:14px;padding:18px 20px;border:1px solid #22232e;position:relative;overflow:hidden;transition:transform 0.2s;}
.kpi:hover{transform:translateY(-2px);}
.kpi .accent{position:absolute;top:0;left:0;right:0;height:3px;}
.kpi .ico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;margin-bottom:10px;}
.kpi .lbl{font-size:0.67rem;text-transform:uppercase;letter-spacing:0.08em;color:#4e4f60;font-weight:700;margin-bottom:4px;}
.kpi .val{font-size:1.4rem;font-weight:800;color:#fff;letter-spacing:-0.02em;line-height:1;}
.kpi .chg{display:inline-flex;align-items:center;gap:3px;margin-top:8px;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:5px;}
.chg.up{background:rgba(16,185,129,0.1);color:#10b981;}
.chg.dn{background:rgba(239,68,68,0.1);color:#ef4444;}
.chg span{font-weight:500;color:#4e4f60;margin-left:3px;}
.sec{display:flex;align-items:center;gap:10px;margin:26px 0 14px;}
.sec-ico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;}
.sec h2{font-size:1rem;font-weight:800;color:#fff;margin:0;}
.sec .sec-s{font-size:0.7rem;color:#4e4f60;}
.sec-line{flex:1;height:1px;background:linear-gradient(90deg,#22232e,transparent);margin-left:10px;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.card{background:#1a1b27;border-radius:14px;padding:20px;border:1px solid #22232e;}
.card.full{grid-column:1/-1;}
.card .t{font-size:0.85rem;font-weight:700;color:#fff;margin-bottom:2px;}
.card .s{font-size:0.7rem;color:#4e4f60;margin-bottom:16px;}
.mkpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;}
.mkpi{background:#14151f;border-radius:11px;padding:13px 15px;border:1px solid #1c1d2a;}
.mkpi .ml{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.06em;color:#3e3f50;font-weight:700;margin-bottom:3px;}
.mkpi .mv{font-size:1.1rem;font-weight:800;color:#fff;}
.bar-r{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #1c1d2a;}
.bar-r:last-child{border:none;}
.bar-n{width:140px;font-size:0.78rem;font-weight:600;color:#b0b1c0;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bar-bg{flex:1;height:6px;background:#22232e;border-radius:3px;overflow:hidden;}
.bar-fg{height:100%;border-radius:3px;}
.bar-c{font-size:0.73rem;font-weight:700;color:#fff;width:32px;text-align:right;}
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.tbl-wrap::-webkit-scrollbar{height:4px;}
.tbl-wrap::-webkit-scrollbar-thumb{background:#22232e;border-radius:2px;}
.tbl-wrap table{min-width:550px;}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{text-align:left;padding:10px 12px;font-size:0.66rem;text-transform:uppercase;letter-spacing:0.07em;color:#3e3f50;font-weight:700;border-bottom:1px solid #22232e;}
.tbl td{padding:11px 12px;font-size:0.8rem;border-bottom:1px solid #1c1d2a;color:#b0b1c0;}
.tbl tbody tr:hover{background:rgba(99,102,241,0.03);}
.dot{display:inline-flex;align-items:center;gap:5px;font-size:0.74rem;font-weight:600;}
.dot::before{content:'';width:6px;height:6px;border-radius:50%;}
.dot.ok::before{background:#10b981;}
.dot.wp::before{background:#f59e0b;}
.dot.pn::before{background:#6366f1;}
.tk{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid #1c1d2a;}
.tk:last-child{border:none;}
.tk-id{font-size:0.8rem;font-weight:700;color:#6366f1;font-family:monospace;}
.tk-m{font-size:0.7rem;color:#4e4f60;margin-top:1px;}
.tk-t{font-size:0.88rem;font-weight:800;color:#fff;}
.stk{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid #1c1d2a;gap:10px;}
.stk:last-child{border:none;}
.stk-n{font-size:0.8rem;font-weight:600;color:#d4d4e0;}
.stk-c{font-size:0.66rem;color:#4e4f60;margin-top:1px;}
.stk-b{padding:3px 10px;border-radius:5px;font-size:0.7rem;font-weight:700;white-space:nowrap;}
.stk-b.cr{background:rgba(239,68,68,0.1);color:#ef4444;}
.stk-b.wn{background:rgba(245,158,11,0.1);color:#f59e0b;}
.no-access{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;gap:16px;}
.no-access .na-icon{font-size:3rem;width:80px;height:80px;background:rgba(239,68,68,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;}
.no-access h2{font-size:1.2rem;font-weight:800;color:#fff;margin:0;}
.no-access p{font-size:0.82rem;color:#4e4f60;margin:0;max-width:320px;line-height:1.6;}
.na-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:4px;}
.na-chip{padding:5px 14px;border-radius:20px;background:#1a1b27;border:1px solid #22232e;font-size:0.72rem;font-weight:600;color:#3e3f50;}
.skel{background:linear-gradient(90deg,#1a1b27 25%,#22232e 50%,#1a1b27 75%);background-size:200% 100%;animation:sk 1.4s infinite;border-radius:8px;}
@keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
.skel-kpi{height:110px;border-radius:14px;}
.skel-chart{height:240px;border-radius:14px;margin-bottom:12px;}
.err-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444;font-size:0.72rem;font-weight:600;padding:5px 12px;border-radius:7px;margin-bottom:12px;}
.ctt{background:#1a1b27!important;border:1px solid #2e2f3e!important;border-radius:9px!important;padding:10px 14px!important;box-shadow:0 6px 20px rgba(0,0,0,0.25)!important;}
.ctt .cl{font-size:0.7rem;color:#4e4f60;font-weight:600;margin-bottom:4px;}
.ctt .ci{font-size:0.78rem;font-weight:700;margin:2px 0;}
.D-foot{text-align:center;padding:18px 0 6px;font-size:0.68rem;color:#2e2f3e;}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.an{animation:fu 0.45s ease both;}
@media(max-width:1200px){.kpi-row{grid-template-columns:repeat(2,1fr);}.mkpi-row{grid-template-columns:repeat(2,1fr);}}
@media(max-width:768px){
  .D-head{padding:18px 14px 14px;}.D-body{padding:0 14px 28px;}
  .kpi-row{grid-template-columns:1fr 1fr;gap:8px;}.kpi .val{font-size:1.15rem!important;}
  .row2{grid-template-columns:1fr;}.mkpi-row{grid-template-columns:1fr 1fr;}
  .bar-n{width:100px;font-size:0.7rem;}
}
@media(max-width:480px){
  .kpi-row{grid-template-columns:1fr;}.mkpi-row{grid-template-columns:1fr;}
  .D-head h1{font-size:1.2rem;}.tabs{width:100%;}.tab{flex:1;text-align:center;font-size:0.7rem;}
}
`;

/* ═══════════════════════════════════════════════════════════
   HOOK FETCH GENÉRICO
   ═══════════════════════════════════════════════════════════ */
function useFetch(url, enabled = true, pollMs = 0) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(url, {
        headers: { ...HEADERS, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      console.error(`[Dashboard] ${url}`, e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    load();
    if (!pollMs) return;
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  return { data, loading, error, refetch: load };
}

/* ═══════════════════════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════════════════════ */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ctt">
      <div className="cl">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="ci" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 999 ? fCOP(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

const Section = ({ icon, bg, title, sub }) => (
  <div className="sec an">
    <div className="sec-ico" style={{ background: bg }}>{icon}</div>
    <div><h2>{title}</h2>{sub && <div className="sec-s">{sub}</div>}</div>
    <div className="sec-line" />
  </div>
);

const Bars = ({ data = [], colors }) => {
  const mx = Math.max(...data.map(d => d.cantidad), 1);
  return data.map((s, i) => (
    <div className="bar-r" key={i}>
      <span className="bar-n">{s.nombre}</span>
      <div className="bar-bg"><div className="bar-fg" style={{ width:`${(s.cantidad/mx)*100}%`, background:colors[i%colors.length] }} /></div>
      <span className="bar-c">{s.cantidad}</span>
    </div>
  ));
};

const Donut = ({ data = [], size = 160 }) => (
  <div style={{ display:"flex", justifyContent:"center" }}>
    <ResponsiveContainer width={size} height={size}>
      <PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={size*0.27} outerRadius={size*0.41} dataKey="value" stroke="none">
        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
      </Pie></PieChart>
    </ResponsiveContainer>
  </div>
);

const DonutLegend = ({ data = [] }) => (
  <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:8, flexWrap:"wrap" }}>
    {data.map(d => (
      <div key={d.name} style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.7rem", color:"#b0b1c0" }}>
        <div style={{ width:7, height:7, borderRadius:3, background:d.color }} /> {d.name} {d.value}%
      </div>
    ))}
  </div>
);

const SkeletonKPIs = () => (
  <div className="kpi-row">
    {[0,1,2,3].map(i => <div key={i} className="skel skel-kpi" style={{ animationDelay:`${i*0.1}s` }} />)}
  </div>
);
const SkeletonChart = () => <div className="skel skel-chart" />;
const ErrBadge = ({ modulo }) => (
  <div className="err-badge">⚠ Error cargando {modulo} — reintentando...</div>
);

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [periodo, setPeriodo] = useState("anual");
  const [user,    setUser]    = useState(null);
  const { tienePermiso }      = usePermisos();

  useEffect(() => {
    try { const u = localStorage.getItem("user"); if (u) setUser(JSON.parse(u)); } catch {}
  }, []);

  /* ── Permisos ── */
  const show = {
    fin:  tienePermiso("ver_finanzas"),
    mec:  tienePermiso("ver_mecanica"),
    rest: tienePermiso("ver_restaurante"),
    pos:  tienePermiso("ver_pos"),
    bod:  tienePermiso("ver_bodega"),
  };
  const tieneAlguno = Object.values(show).some(Boolean);

  /* ══════════════════════════════════════════════════════════
     FETCHES
     Cada módulo solo fetcha si el usuario tiene permiso.

     FINANZAS   → GET /api/v1/dashboard/finanzas?periodo=anual
     Respuesta: {
       meses: [{ mes, ingresos, egresos }],
       totales: { ing, egr, gan, margen },
       cambios: { ingresos:"+12%", egresos, ganancia, margen }
     }

     MECÁNICA   → GET /api/v1/dashboard/mecanica
     Respuesta: {
       kpis: { serviciosMes, ticketPromedio, vehiculosAtendidos },
       servicios: [{ nombre, cantidad }],
       tipos: [{ name, value, color }],
       recientes: [{ _id, cliente, vehiculo, placa, servicio, costo, estado, fecha }]
     }

     RESTAURANTE → GET /api/v1/dashboard/restaurante  (polling 90s)
     Respuesta: {
       kpis: { pedidosHoy, ticketPromedio, platosVendidos },
       platos: [{ nombre, cantidad }],
       horas: [{ hora, pedidos }],
       categorias: [{ name, value, color }]
     }

     POS        → GET /api/v1/dashboard/pos  (polling 90s)
     Respuesta: {
       kpis: { ventasHoy, facturas, ventaPromedio },
       semana: [{ dia, ventas }],
       metodos: [{ name, value, color }],
       facturas: [{ _id, total, items, metodo, hora }]
     }

     BODEGA     → GET /api/v1/dashboard/bodega
     Respuesta: {
       kpis: { totalProductos, alertasStock, movimientosHoy },
       movimientos: [{ mes, entradas, salidas }],
       categorias: [{ name, value, color }],
       stockBajo: [{ producto, stock, minimo, cat }]
     }
  ══════════════════════════════════════════════════════════ */
  const fin  = useFetch(`${API}/dashboard/finanzas?periodo=${periodo}`, show.fin);
  const mec  = useFetch(`${API}/dashboard/mecanica`,                    show.mec);
  const rest = useFetch(`${API}/dashboard/restaurante`,                 show.rest, POLL_MS);
  const pos  = useFetch(`${API}/dashboard/pos`,                         show.pos,  POLL_MS);
  const bod  = useFetch(`${API}/dashboard/bodega`,                      show.bod);

  // Re-fetch finanzas al cambiar el período
  useEffect(() => { if (show.fin) fin.refetch(); }, [periodo]);

  /* ── Derivados finanzas ── */
  const meses = fin.data?.meses ?? [];
  const datos = useMemo(() => meses.map(d => ({ ...d, ganancia: d.ingresos - d.egresos })), [meses]);
  const tot   = useMemo(() => {
    if (fin.data?.totales) return fin.data.totales;
    const t = meses.reduce((a, d) => ({ ing: a.ing+d.ingresos, egr: a.egr+d.egresos }), { ing:0, egr:0 });
    return { ...t, gan: t.ing-t.egr, margen: t.ing ? ((t.ing-t.egr)/t.ing*100).toFixed(1) : "0.0" };
  }, [fin.data, meses]);

  const now = new Date();
  const hi  = now.getHours() < 12 ? "Buenos días" : now.getHours() < 18 ? "Buenas tardes" : "Buenas noches";
  const pal = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#818cf8"];

  return (
    <div style={{ display:"flex", height:"100vh" }}>
      <Nav />
      <div className="D D-scroll">
        <style>{css}</style>

        {/* ── HEADER ── */}
        <div className="D-head an">
          <div>
            <h1>{hi}, {user?.name || "Admin"} 👋</h1>
            <div className="sub">{now.toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          {tieneAlguno && (
            <div className="tabs">
              {["mensual","anual"].map(p => (
                <button key={p} className={`tab ${periodo===p?"on":""}`} onClick={() => setPeriodo(p)}>
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="D-body">

          {/* ── SIN ACCESO ── */}
          {!tieneAlguno && (
            <div className="no-access an">
              <div className="na-icon">🔒</div>
              <h2>Sin acceso al dashboard</h2>
              <p>Tu rol actual no tiene permisos para visualizar ningún módulo. Contacta al administrador para solicitar acceso.</p>
              <div className="na-chips">
                {["ver_finanzas","ver_mecanica","ver_restaurante","ver_pos","ver_bodega"].map(p => (
                  <span key={p} className="na-chip">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── FINANZAS ── */}
          {show.fin && (<>
            {fin.error && <ErrBadge modulo="Finanzas" />}
            {fin.loading && !fin.data
              ? <SkeletonKPIs />
              : (
                <div className="kpi-row">
                  {[
                    { l:"Ingresos", v:fCOP(tot.ing??0),    c:fin.data?.cambios?.ingresos??"--",  u:true,  i:"💰", a:"#10b981", bg:"rgba(16,185,129,0.1)" },
                    { l:"Egresos",  v:fCOP(tot.egr??0),    c:fin.data?.cambios?.egresos??"--",   u:false, i:"📤", a:"#ef4444", bg:"rgba(239,68,68,0.1)"  },
                    { l:"Ganancia", v:fCOP(tot.gan??0),    c:fin.data?.cambios?.ganancia??"--",  u:true,  i:"📈", a:"#6366f1", bg:"rgba(99,102,241,0.1)" },
                    { l:"Margen",   v:`${tot.margen??0}%`, c:fin.data?.cambios?.margen??"--",    u:true,  i:"🎯", a:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
                  ].map((k,i) => (
                    <div key={i} className="kpi an" style={{ animationDelay:`${i*0.06}s` }}>
                      <div className="accent" style={{ background:k.a }} />
                      <div className="ico" style={{ background:k.bg }}>{k.i}</div>
                      <div className="lbl">{k.l}</div>
                      <div className="val">{k.v}</div>
                      <div className={`chg ${k.u?"up":"dn"}`}>{k.u?"↑":"↓"} {k.c}<span>vs anterior</span></div>
                    </div>
                  ))}
                </div>
              )
            }
            {fin.loading && !fin.data ? <SkeletonChart /> : datos.length > 0 && (
              <div className="card full an" style={{ animationDelay:"0.28s", marginBottom:12 }}>
                <div className="t">Ingresos vs Egresos vs Ganancia</div>
                <div className="s">Comparativa mensual — {periodo}</div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={datos} margin={{ top:5, right:16, bottom:5, left:8 }}>
                    <defs>
                      <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.22}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.12}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.18}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                    <XAxis dataKey="mes" tick={{ fill:"#4e4f60", fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#4e4f60", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={fShort} />
                    <Tooltip content={<Tip />} />
                    <Legend wrapperStyle={{ fontSize:"0.72rem", color:"#4e4f60" }} />
                    <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2} fill="url(#gI)" />
                    <Area type="monotone" dataKey="egresos"  name="Egresos"  stroke="#ef4444" strokeWidth={2} fill="url(#gE)" />
                    <Area type="monotone" dataKey="ganancia" name="Ganancia" stroke="#6366f1" strokeWidth={2} fill="url(#gG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {datos.length > 0 && (
              <div className="card full an" style={{ animationDelay:"0.35s", marginBottom:12 }}>
                <div className="t">Ganancia mensual</div>
                <div className="s">Utilidad neta por mes</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={datos} margin={{ top:5, right:10, bottom:5, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                    <XAxis dataKey="mes" tick={{ fill:"#4e4f60", fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#4e4f60", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={fShort} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="ganancia" name="Ganancia" radius={[5,5,0,0]}>
                      {datos.map((_,i) => <Cell key={i} fill={pal[i%pal.length]} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>)}

          {/* ── MECÁNICA ── */}
          {show.mec && (<>
            <Section icon="🔧" bg="rgba(99,102,241,0.1)" title="Mecánica" sub="Servicios y mantenimientos" />
            {mec.error && <ErrBadge modulo="Mecánica" />}
            {mec.loading && !mec.data ? <><SkeletonChart /><SkeletonChart /></> : (<>
              <div className="mkpi-row">
                <div className="mkpi"><div className="ml">Servicios / mes</div>     <div className="mv">{mec.data?.kpis?.serviciosMes        ?? "—"}</div></div>
                <div className="mkpi"><div className="ml">Ticket promedio</div>      <div className="mv">{mec.data?.kpis?.ticketPromedio ? fCOP(mec.data.kpis.ticketPromedio) : "—"}</div></div>
                <div className="mkpi"><div className="ml">Vehículos atendidos</div>  <div className="mv">{mec.data?.kpis?.vehiculosAtendidos   ?? "—"}</div></div>
              </div>
              <div className="row2">
                <div className="card an">
                  <div className="t">Servicios top</div><div className="s">Los 5 más solicitados</div>
                  <Bars data={mec.data?.servicios??[]} colors={pal} />
                </div>
                <div className="card an">
                  <div className="t">Tipo de mantenimiento</div><div className="s">Preventivo vs Correctivo</div>
                  <Donut data={mec.data?.tipos??[]} />
                  <DonutLegend data={mec.data?.tipos??[]} />
                </div>
              </div>
              <div className="card full an" style={{ marginBottom:12 }}>
                <div className="t">Últimos mantenimientos</div><div className="s">Actividad reciente</div>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th>Cliente</th><th>Vehículo</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th style={{ textAlign:"right" }}>Costo</th></tr></thead>
                    <tbody>
                      {(mec.data?.recientes??[]).map((m,i) => (
                        <tr key={m._id??i}>
                          <td style={{ fontWeight:600, color:"#e4e4ec" }}>{m.cliente}</td>
                          <td>{m.vehiculo} <span style={{ fontSize:"0.68rem", color:"#3e3f50", fontFamily:"monospace" }}>{m.placa}</span></td>
                          <td>{m.servicio}</td>
                          <td style={{ whiteSpace:"nowrap" }}>{fDate(m.fecha)}</td>
                          <td><span className={`dot ${m.estado==="Completado"?"ok":m.estado==="En proceso"?"wp":"pn"}`}>{m.estado}</span></td>
                          <td style={{ textAlign:"right", fontWeight:700, color:"#fff" }}>
                            {m.costo===0 ? <span style={{ color:"#10b981" }}>Gratis</span> : fCOP(m.costo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>)}
          </>)}

          {/* ── RESTAURANTE ── */}
          {show.rest && (<>
            <Section icon="🍽️" bg="rgba(249,115,22,0.1)" title="Restaurante" sub="Cocina y pedidos" />
            {rest.error && <ErrBadge modulo="Restaurante" />}
            {rest.loading && !rest.data ? <><SkeletonChart /><SkeletonChart /></> : (<>
              <div className="mkpi-row">
                <div className="mkpi"><div className="ml">Pedidos hoy</div>     <div className="mv">{rest.data?.kpis?.pedidosHoy    ?? "—"}</div></div>
                <div className="mkpi"><div className="ml">Ticket promedio</div>  <div className="mv">{rest.data?.kpis?.ticketPromedio ? fCOP(rest.data.kpis.ticketPromedio) : "—"}</div></div>
                <div className="mkpi"><div className="ml">Platos vendidos</div>  <div className="mv">{rest.data?.kpis?.platosVendidos ?? "—"}</div></div>
              </div>
              <div className="row2">
                <div className="card an">
                  <div className="t">Platos más vendidos</div><div className="s">Top 5 del mes</div>
                  <Bars data={rest.data?.platos??[]} colors={["#f97316","#eab308","#f59e0b","#fb923c","#fdba74"]} />
                </div>
                <div className="card an">
                  <div className="t">Pedidos por hora</div><div className="s">Distribución de hoy</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={rest.data?.horas??[]} margin={{ top:5, right:8, bottom:5, left:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                      <XAxis dataKey="hora" tick={{ fill:"#4e4f60", fontSize:9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#4e4f60", fontSize:10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="pedidos" name="Pedidos" radius={[4,4,0,0]} fill="#f97316" fillOpacity={0.75} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="row2">
                <div className="card an">
                  <div className="t">Categorías</div><div className="s">Distribución de ventas</div>
                  <Donut data={rest.data?.categorias??[]} />
                  <DonutLegend data={rest.data?.categorias??[]} />
                </div>
              </div>
            </>)}
          </>)}

          {/* ── POS ── */}
          {show.pos && (<>
            <Section icon="💳" bg="rgba(99,102,241,0.1)" title="Punto de Venta" sub="Ventas y facturación" />
            {pos.error && <ErrBadge modulo="POS" />}
            {pos.loading && !pos.data ? <><SkeletonChart /><SkeletonChart /></> : (<>
              <div className="mkpi-row">
                <div className="mkpi"><div className="ml">Ventas hoy</div>     <div className="mv">{pos.data?.kpis?.ventasHoy    ? fCOP(pos.data.kpis.ventasHoy) : "—"}</div></div>
                <div className="mkpi"><div className="ml">Facturas</div>        <div className="mv">{pos.data?.kpis?.facturas      ?? "—"}</div></div>
                <div className="mkpi"><div className="ml">Venta promedio</div>  <div className="mv">{pos.data?.kpis?.ventaPromedio ? fCOP(pos.data.kpis.ventaPromedio) : "—"}</div></div>
              </div>
              <div className="row2">
                <div className="card an">
                  <div className="t">Ventas de la semana</div><div className="s">Últimos 7 días</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pos.data?.semana??[]} margin={{ top:5, right:8, bottom:5, left:8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                      <XAxis dataKey="dia" tick={{ fill:"#4e4f60", fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#4e4f60", fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={fShort} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="ventas" name="Ventas" radius={[5,5,0,0]}>
                        {(pos.data?.semana??[]).map((_,i) => <Cell key={i} fill={pal[i%pal.length]} fillOpacity={0.8} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card an">
                  <div className="t">Métodos de pago</div><div className="s">Distribución del mes</div>
                  <Donut data={pos.data?.metodos??[]} />
                  <DonutLegend data={pos.data?.metodos??[]} />
                </div>
              </div>
              <div className="card full an" style={{ marginBottom:12 }}>
                <div className="t">Últimas facturas</div><div className="s">Transacciones recientes</div>
                {(pos.data?.facturas??[]).map((f,i) => (
                  <div className="tk" key={f._id??i}>
                    <div><div className="tk-id">{f._id}</div><div className="tk-m">{f.items} items · {f.metodo} · {f.hora}</div></div>
                    <div className="tk-t">{fCOP(f.total)}</div>
                  </div>
                ))}
              </div>
            </>)}
          </>)}

          {/* ── BODEGA ── */}
          {show.bod && (<>
            <Section icon="📦" bg="rgba(6,182,212,0.1)" title="Inventario" sub="Stock y movimientos" />
            {bod.error && <ErrBadge modulo="Inventario" />}
            {bod.loading && !bod.data ? <><SkeletonChart /><SkeletonChart /></> : (<>
              <div className="mkpi-row">
                <div className="mkpi"><div className="ml">Productos</div>        <div className="mv">{bod.data?.kpis?.totalProductos  ?? "—"}</div></div>
                <div className="mkpi"><div className="ml">Alertas stock</div>    <div className="mv" style={{ color:"#ef4444" }}>{bod.data?.kpis?.alertasStock   ?? "—"}</div></div>
                <div className="mkpi"><div className="ml">Movimientos hoy</div>  <div className="mv">{bod.data?.kpis?.movimientosHoy  ?? "—"}</div></div>
              </div>
              <div className="row2">
                <div className="card an">
                  <div className="t">Entradas vs Salidas</div><div className="s">Último semestre</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bod.data?.movimientos??[]} margin={{ top:5, right:8, bottom:5, left:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                      <XAxis dataKey="mes" tick={{ fill:"#4e4f60", fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#4e4f60", fontSize:10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip />} />
                      <Legend wrapperStyle={{ fontSize:"0.72rem" }} />
                      <Line type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={2.5} dot={{ fill:"#10b981", r:3 }} />
                      <Line type="monotone" dataKey="salidas"  name="Salidas"  stroke="#f59e0b" strokeWidth={2.5} dot={{ fill:"#f59e0b", r:3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="card an">
                  <div className="t">Por categoría</div><div className="s">Distribución del inventario</div>
                  <Donut data={bod.data?.categorias??[]} />
                  <DonutLegend data={bod.data?.categorias??[]} />
                </div>
              </div>
              <div className="card full an" style={{ marginBottom:12 }}>
                <div className="t">⚠️ Alertas de stock bajo</div><div className="s">Productos que necesitan reabastecimiento</div>
                {(bod.data?.stockBajo??[]).map((p,i) => (
                  <div className="stk" key={i}>
                    <div><div className="stk-n">{p.producto}</div><div className="stk-c">{p.cat}</div></div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:"0.75rem", color:"#4e4f60" }}>{p.stock}/{p.minimo}</span>
                      <span className={`stk-b ${p.stock<=p.minimo*0.25?"cr":"wn"}`}>
                        {p.stock<=p.minimo*0.25?"Crítico":"Bajo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>)}
          </>)}

          {/* ── Footer ── */}
          {tieneAlguno && (
            <div className="D-foot">
              Dashboard actualizado · {now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}
              {" · Módulos: "}
              {[show.fin&&"Finanzas",show.mec&&"Mecánica",show.rest&&"Restaurante",show.pos&&"POS",show.bod&&"Inventario"]
                .filter(Boolean).join(" · ")}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}