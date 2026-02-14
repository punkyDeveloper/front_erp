import { useState, useEffect, useMemo } from "react";
import Nav from "./assets/nav/nav";
import { usePermisos } from "./context/PermissionsContext";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   DATOS DE PRUEBA — Reemplazar con fetch al backend
   ═══════════════════════════════════════════════════════════ */

const FINANZAS_MES = [
  { mes: "Ene", ingresos: 12850000, egresos: 6100000 },
  { mes: "Feb", ingresos: 14320000, egresos: 7450000 },
  { mes: "Mar", ingresos: 11100000, egresos: 5980000 },
  { mes: "Abr", ingresos: 16200000, egresos: 8800000 },
  { mes: "May", ingresos: 15750000, egresos: 8650000 },
  { mes: "Jun", ingresos: 18100000, egresos: 9200000 },
  { mes: "Jul", ingresos: 17800000, egresos: 9050000 },
  { mes: "Ago", ingresos: 15900000, egresos: 8700000 },
  { mes: "Sep", ingresos: 16450000, egresos: 8900000 },
  { mes: "Oct", ingresos: 19500000, egresos: 9400000 },
  { mes: "Nov", ingresos: 18200000, egresos: 9100000 },
  { mes: "Dic", ingresos: 21100000, egresos: 10600000 },
];

const MECANICA = {
  servicios: [
    { nombre: "Cambio de aceite", cantidad: 145 },
    { nombre: "Alineación y balanceo", cantidad: 98 },
    { nombre: "Cambio de pastillas", cantidad: 76 },
    { nombre: "Revisión eléctrica", cantidad: 54 },
    { nombre: "Cambio de batería", cantidad: 42 },
  ],
  tipos: [
    { name: "Preventivo", value: 58, color: "#10b981" },
    { name: "Correctivo", value: 42, color: "#f59e0b" },
  ],
  recientes: [
    { id: 1, cliente: "Carlos Gómez", vehiculo: "Toyota Corolla 2022", placa: "ABC-123", servicio: "Cambio de aceite", costo: 185000, estado: "Completado", fecha: "2026-02-12" },
    { id: 2, cliente: "María López", vehiculo: "Mazda CX-5 2023", placa: "DEF-456", servicio: "Pastillas de freno", costo: 420000, estado: "En proceso", fecha: "2026-02-11" },
    { id: 3, cliente: "Andrés Ríos", vehiculo: "Chevrolet Onix 2021", placa: "GHI-789", servicio: "Alineación", costo: 290000, estado: "Pendiente", fecha: "2026-02-10" },
    { id: 4, cliente: "Laura Martínez", vehiculo: "Kia Sportage 2024", placa: "MNO-345", servicio: "Revisión garantía", costo: 0, estado: "Completado", fecha: "2026-02-08" },
  ],
};

const RESTAURANTE = {
  platos: [
    { nombre: "Bandeja Paisa", cantidad: 320 },
    { nombre: "Arroz con Pollo", cantidad: 280 },
    { nombre: "Sancocho", cantidad: 195 },
    { nombre: "Carne Asada", cantidad: 175 },
    { nombre: "Cazuela de Frijoles", cantidad: 140 },
  ],
  horas: [
    { hora: "10am", pedidos: 8 }, { hora: "11am", pedidos: 22 },
    { hora: "12pm", pedidos: 45 }, { hora: "1pm", pedidos: 52 },
    { hora: "2pm", pedidos: 38 }, { hora: "3pm", pedidos: 15 },
    { hora: "6pm", pedidos: 28 }, { hora: "7pm", pedidos: 48 },
    { hora: "8pm", pedidos: 55 }, { hora: "9pm", pedidos: 35 },
  ],
  categorias: [
    { name: "Platos fuertes", value: 45, color: "#f97316" },
    { name: "Entradas", value: 18, color: "#eab308" },
    { name: "Bebidas", value: 22, color: "#06b6d4" },
    { name: "Postres", value: 15, color: "#ec4899" },
  ],
};

const POS = {
  metodos: [
    { name: "Efectivo", value: 38, color: "#10b981" },
    { name: "T. Débito", value: 28, color: "#6366f1" },
    { name: "T. Crédito", value: 22, color: "#8b5cf6" },
    { name: "Nequi/Daviplata", value: 12, color: "#06b6d4" },
  ],
  semana: [
    { dia: "Lun", ventas: 2800000 }, { dia: "Mar", ventas: 3100000 },
    { dia: "Mié", ventas: 2650000 }, { dia: "Jue", ventas: 3400000 },
    { dia: "Vie", ventas: 4200000 }, { dia: "Sáb", ventas: 5100000 },
    { dia: "Dom", ventas: 3800000 },
  ],
  facturas: [
    { id: "F-0284", total: 85000, items: 3, metodo: "Efectivo", hora: "2:45 PM" },
    { id: "F-0283", total: 142000, items: 5, metodo: "Nequi", hora: "2:30 PM" },
    { id: "F-0282", total: 56000, items: 2, metodo: "T. Débito", hora: "2:12 PM" },
    { id: "F-0281", total: 210000, items: 7, metodo: "T. Crédito", hora: "1:55 PM" },
    { id: "F-0280", total: 38000, items: 1, metodo: "Efectivo", hora: "1:40 PM" },
  ],
};

const BODEGA = {
  stockBajo: [
    { producto: "Aceite 5W-30 (1L)", stock: 5, minimo: 20, cat: "Mecánica" },
    { producto: "Filtro de aire universal", stock: 3, minimo: 15, cat: "Mecánica" },
    { producto: "Arroz x 25kg", stock: 2, minimo: 10, cat: "Restaurante" },
    { producto: "Servilletas x 1000", stock: 4, minimo: 12, cat: "Restaurante" },
    { producto: "Bolsas para llevar", stock: 8, minimo: 30, cat: "Restaurante" },
  ],
  movimientos: [
    { mes: "Ene", entradas: 120, salidas: 95 }, { mes: "Feb", entradas: 98, salidas: 110 },
    { mes: "Mar", entradas: 145, salidas: 102 }, { mes: "Abr", entradas: 110, salidas: 130 },
    { mes: "May", entradas: 135, salidas: 118 }, { mes: "Jun", entradas: 160, salidas: 142 },
  ],
  categorias: [
    { name: "Repuestos", value: 35, color: "#6366f1" },
    { name: "Alimentos", value: 28, color: "#f97316" },
    { name: "Insumos", value: 22, color: "#10b981" },
    { name: "Limpieza", value: 15, color: "#06b6d4" },
  ],
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const fCOP = (v) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);
const fShort = (v) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : fCOP(v);
const fDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

/* ═══════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

.D {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  color: #d4d4e0;
}
.D-scroll { flex:1; overflow-y:auto; overflow-x:hidden; min-width:0; }

/* Header */
.D-head {
  padding: 26px 28px 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 14px;
}
.D-head h1 { font-size:1.5rem; font-weight:800; letter-spacing:-0.03em; margin:0; color:#fff; }
.D-head .sub { font-size:0.82rem; color:#4e4f60; margin-top:3px; }

.tabs {
  display: flex;
  gap: 3px;
  background: #1a1b27;
  border-radius: 10px;
  padding: 3px;
}
.tab {
  padding: 6px 15px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b6c7e;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.tab.on { background:#6366f1; color:#fff; }
.tab:hover:not(.on) { color:#a5a6b8; }

.D-body { padding: 0 28px 36px; }

/* ── KPI ── */
.kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
.kpi {
  background: #1a1b27;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #22232e;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}
.kpi:hover { transform:translateY(-2px); }
.kpi .accent { position:absolute; top:0; left:0; right:0; height:3px; }
.kpi .ico { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; margin-bottom:10px; }
.kpi .lbl { font-size:0.67rem; text-transform:uppercase; letter-spacing:0.08em; color:#4e4f60; font-weight:700; margin-bottom:4px; }
.kpi .val { font-size:1.4rem; font-weight:800; color:#fff; letter-spacing:-0.02em; line-height:1; }
.kpi .chg { display:inline-flex; align-items:center; gap:3px; margin-top:8px; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:5px; }
.chg.up { background:rgba(16,185,129,0.1); color:#10b981; }
.chg.dn { background:rgba(239,68,68,0.1); color:#ef4444; }
.chg span { font-weight:500; color:#4e4f60; margin-left:3px; }

/* ── Section ── */
.sec {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 26px 0 14px;
}
.sec-ico { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; }
.sec h2 { font-size:1rem; font-weight:800; color:#fff; margin:0; }
.sec .sec-s { font-size:0.7rem; color:#4e4f60; }
.sec-line { flex:1; height:1px; background:linear-gradient(90deg,#22232e,transparent); margin-left:10px; }

/* ── Cards ── */
.row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.card {
  background: #1a1b27;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #22232e;
}
.card.full { grid-column:1/-1; }
.card .t { font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:2px; }
.card .s { font-size:0.7rem; color:#4e4f60; margin-bottom:16px; }

/* ── Mini KPIs ── */
.mkpi-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:12px; }
.mkpi { background:#14151f; border-radius:11px; padding:13px 15px; border:1px solid #1c1d2a; }
.mkpi .ml { font-size:0.65rem; text-transform:uppercase; letter-spacing:0.06em; color:#3e3f50; font-weight:700; margin-bottom:3px; }
.mkpi .mv { font-size:1.1rem; font-weight:800; color:#fff; }

/* ── Bar list ── */
.bar-r { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #1c1d2a; }
.bar-r:last-child { border:none; }
.bar-n { width:140px; font-size:0.78rem; font-weight:600; color:#b0b1c0; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.bar-bg { flex:1; height:6px; background:#22232e; border-radius:3px; overflow:hidden; }
.bar-fg { height:100%; border-radius:3px; }
.bar-c { font-size:0.73rem; font-weight:700; color:#fff; width:32px; text-align:right; }

/* ── Table ── */
.tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
.tbl-wrap::-webkit-scrollbar { height:4px; }
.tbl-wrap::-webkit-scrollbar-thumb { background:#22232e; border-radius:2px; }
.tbl-wrap table { min-width:550px; }
.tbl { width:100%; border-collapse:collapse; }
.tbl th { text-align:left; padding:10px 12px; font-size:0.66rem; text-transform:uppercase; letter-spacing:0.07em; color:#3e3f50; font-weight:700; border-bottom:1px solid #22232e; }
.tbl td { padding:11px 12px; font-size:0.8rem; border-bottom:1px solid #1c1d2a; color:#b0b1c0; }
.tbl tbody tr:hover { background:rgba(99,102,241,0.03); }

.dot { display:inline-flex; align-items:center; gap:5px; font-size:0.74rem; font-weight:600; }
.dot::before { content:''; width:6px; height:6px; border-radius:50%; }
.dot.ok::before { background:#10b981; }
.dot.wp::before { background:#f59e0b; }
.dot.pn::before { background:#6366f1; }

/* ── Ticket rows ── */
.tk { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid #1c1d2a; }
.tk:last-child { border:none; }
.tk-id { font-size:0.8rem; font-weight:700; color:#6366f1; font-family:monospace; }
.tk-m { font-size:0.7rem; color:#4e4f60; margin-top:1px; }
.tk-t { font-size:0.88rem; font-weight:800; color:#fff; }

/* ── Stock ── */
.stk { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid #1c1d2a; gap:10px; }
.stk:last-child { border:none; }
.stk-n { font-size:0.8rem; font-weight:600; color:#d4d4e0; }
.stk-c { font-size:0.66rem; color:#4e4f60; margin-top:1px; }
.stk-b { padding:3px 10px; border-radius:5px; font-size:0.7rem; font-weight:700; white-space:nowrap; }
.stk-b.cr { background:rgba(239,68,68,0.1); color:#ef4444; }
.stk-b.wn { background:rgba(245,158,11,0.1); color:#f59e0b; }

/* ── Tooltip ── */
.ctt { background:#1a1b27!important; border:1px solid #2e2f3e!important; border-radius:9px!important; padding:10px 14px!important; box-shadow:0 6px 20px rgba(0,0,0,0.25)!important; }
.ctt .cl { font-size:0.7rem; color:#4e4f60; font-weight:600; margin-bottom:4px; }
.ctt .ci { font-size:0.78rem; font-weight:700; margin:2px 0; }

/* ── Footer ── */
.D-foot { text-align:center; padding:18px 0 6px; font-size:0.68rem; color:#2e2f3e; }

/* ── Anim ── */
@keyframes fu { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.an { animation:fu 0.45s ease both; }

/* ── Responsive ── */
@media(max-width:1200px) { .kpi-row{grid-template-columns:repeat(2,1fr);} .mkpi-row{grid-template-columns:repeat(2,1fr);} }
@media(max-width:768px) {
  .D-head{padding:18px 14px 14px;} .D-body{padding:0 14px 28px;}
  .kpi-row{grid-template-columns:1fr 1fr;gap:8px;} .kpi .val{font-size:1.15rem!important;}
  .row2{grid-template-columns:1fr;} .mkpi-row{grid-template-columns:1fr 1fr;}
  .bar-n{width:100px;font-size:0.7rem;}
}
@media(max-width:480px) {
  .kpi-row{grid-template-columns:1fr;} .mkpi-row{grid-template-columns:1fr;}
  .D-head h1{font-size:1.2rem;} .tabs{width:100%;} .tab{flex:1;text-align:center;font-size:0.7rem;}
}
`;

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

const Bars = ({ data, colors }) => {
  const mx = Math.max(...data.map(d => d.cantidad));
  return data.map((s, i) => (
    <div className="bar-r" key={i}>
      <span className="bar-n">{s.nombre}</span>
      <div className="bar-bg"><div className="bar-fg" style={{ width: `${(s.cantidad / mx) * 100}%`, background: colors[i % colors.length] }} /></div>
      <span className="bar-c">{s.cantidad}</span>
    </div>
  ));
};

const Donut = ({ data, size = 160 }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <ResponsiveContainer width={size} height={size}>
      <PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={size * 0.27} outerRadius={size * 0.41} dataKey="value" stroke="none">
        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
      </Pie></PieChart>
    </ResponsiveContainer>
  </div>
);

const DonutLegend = ({ data }) => (
  <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
    {data.map(d => (
      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "#b0b1c0" }}>
        <div style={{ width: 7, height: 7, borderRadius: 3, background: d.color }} /> {d.name} {d.value}%
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [periodo, setPeriodo] = useState("anual");
  const [user, setUser] = useState(null);
  const { tienePermiso } = usePermisos();

  useEffect(() => { try { const u = localStorage.getItem("user"); if (u) setUser(JSON.parse(u)); } catch {} }, []);

  const show = {
    mec: tienePermiso("ver_mecanica"),
    rest: tienePermiso("ver_restaurante"),
    pos: tienePermiso("ver_pos"),
    bod: tienePermiso("ver_bodega"),
  };

  const datos = useMemo(() => FINANZAS_MES.map(d => ({ ...d, ganancia: d.ingresos - d.egresos })), []);
  const tot = useMemo(() => {
    const t = FINANZAS_MES.reduce((a, d) => ({ ing: a.ing + d.ingresos, egr: a.egr + d.egresos }), { ing: 0, egr: 0 });
    return { ...t, gan: t.ing - t.egr, margen: ((t.ing - t.egr) / t.ing * 100).toFixed(1) };
  }, []);

  const now = new Date();
  const hi = now.getHours() < 12 ? "Buenos días" : now.getHours() < 18 ? "Buenas tardes" : "Buenas noches";
  const pal = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8"];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Nav />
      <div className="D D-scroll">
        <style>{css}</style>

        {/* ── HEADER ── */}
        <div className="D-head an">
          <div>
            <h1>{hi}, {user?.name || "Admin"} 👋</h1>
            <div className="sub">{now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <div className="tabs">
            {["mensual", "trimestral", "anual"].map(p => (
              <button key={p} className={`tab ${periodo === p ? "on" : ""}`} onClick={() => setPeriodo(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="D-body">

          {/* ══════════════════════════════════════════════ */}
          {/* FINANZAS GENERALES — siempre visible          */}
          {/* ══════════════════════════════════════════════ */}

          <div className="kpi-row">
            {[
              { l: "Ingresos", v: fCOP(tot.ing), c: "+12.5%", u: true, i: "💰", a: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { l: "Egresos", v: fCOP(tot.egr), c: "+8.2%", u: false, i: "📤", a: "#ef4444", bg: "rgba(239,68,68,0.1)" },
              { l: "Ganancia", v: fCOP(tot.gan), c: "+18.3%", u: true, i: "📈", a: "#6366f1", bg: "rgba(99,102,241,0.1)" },
              { l: "Margen", v: `${tot.margen}%`, c: "+3.1%", u: true, i: "🎯", a: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            ].map((k, i) => (
              <div key={i} className="kpi an" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="accent" style={{ background: k.a }} />
                <div className="ico" style={{ background: k.bg }}>{k.i}</div>
                <div className="lbl">{k.l}</div>
                <div className="val">{k.v}</div>
                <div className={`chg ${k.u ? "up" : "dn"}`}>{k.u ? "↑" : "↓"} {k.c}<span>vs anterior</span></div>
              </div>
            ))}
          </div>

          {/* Gráfico ingresos / egresos / ganancia */}
          <div className="card full an" style={{ animationDelay: "0.28s", marginBottom: 12 }}>
            <div className="t">Ingresos vs Egresos vs Ganancia</div>
            <div className="s">Comparativa mensual del año</div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={datos} margin={{ top: 5, right: 16, bottom: 5, left: 8 }}>
                <defs>
                  <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.22} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                <XAxis dataKey="mes" tick={{ fill: "#4e4f60", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4e4f60", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fShort} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: "0.72rem", color: "#4e4f60" }} />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2} fill="url(#gI)" />
                <Area type="monotone" dataKey="egresos" name="Egresos" stroke="#ef4444" strokeWidth={2} fill="url(#gE)" />
                <Area type="monotone" dataKey="ganancia" name="Ganancia" stroke="#6366f1" strokeWidth={2} fill="url(#gG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Ganancia por mes (barras) */}
          <div className="card full an" style={{ animationDelay: "0.35s", marginBottom: 12 }}>
            <div className="t">Ganancia mensual</div>
            <div className="s">Utilidad neta por mes</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={datos} margin={{ top: 5, right: 10, bottom: 5, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                <XAxis dataKey="mes" tick={{ fill: "#4e4f60", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4e4f60", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fShort} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="ganancia" name="Ganancia" radius={[5, 5, 0, 0]}>
                  {datos.map((_, i) => <Cell key={i} fill={pal[i % pal.length]} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* MECÁNICA                                      */}
          {/* ══════════════════════════════════════════════ */}
          {show.mec && (<>
            <Section icon="🔧" bg="rgba(99,102,241,0.1)" title="Mecánica" sub="Servicios y mantenimientos" />
            <div className="mkpi-row">
              <div className="mkpi"><div className="ml">Servicios / mes</div><div className="mv">87</div></div>
              <div className="mkpi"><div className="ml">Ticket promedio</div><div className="mv">{fCOP(285000)}</div></div>
              <div className="mkpi"><div className="ml">Vehículos atendidos</div><div className="mv">64</div></div>
            </div>
            <div className="row2">
              <div className="card an">
                <div className="t">Servicios top</div>
                <div className="s">Los 5 más solicitados</div>
                <Bars data={MECANICA.servicios} colors={pal} />
              </div>
              <div className="card an">
                <div className="t">Tipo de mantenimiento</div>
                <div className="s">Preventivo vs Correctivo</div>
                <Donut data={MECANICA.tipos} />
                <DonutLegend data={MECANICA.tipos} />
              </div>
            </div>
            <div className="card full an" style={{ marginBottom: 12 }}>
              <div className="t">Últimos mantenimientos</div>
              <div className="s">Actividad reciente</div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Cliente</th><th>Vehículo</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th style={{ textAlign: "right" }}>Costo</th></tr></thead>
                  <tbody>
                    {MECANICA.recientes.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600, color: "#e4e4ec" }}>{m.cliente}</td>
                        <td>{m.vehiculo} <span style={{ fontSize: "0.68rem", color: "#3e3f50", fontFamily: "monospace" }}>{m.placa}</span></td>
                        <td>{m.servicio}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{fDate(m.fecha)}</td>
                        <td><span className={`dot ${m.estado === "Completado" ? "ok" : m.estado === "En proceso" ? "wp" : "pn"}`}>{m.estado}</span></td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#fff" }}>{m.costo === 0 ? <span style={{ color: "#10b981" }}>Gratis</span> : fCOP(m.costo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* ══════════════════════════════════════════════ */}
          {/* RESTAURANTE                                   */}
          {/* ══════════════════════════════════════════════ */}
          {show.rest && (<>
            <Section icon="🍽️" bg="rgba(249,115,22,0.1)" title="Restaurante" sub="Cocina y pedidos" />
            <div className="mkpi-row">
              <div className="mkpi"><div className="ml">Pedidos hoy</div><div className="mv">67</div></div>
              <div className="mkpi"><div className="ml">Ticket promedio</div><div className="mv">{fCOP(32000)}</div></div>
              <div className="mkpi"><div className="ml">Platos vendidos</div><div className="mv">142</div></div>
            </div>
            <div className="row2">
              <div className="card an">
                <div className="t">Platos más vendidos</div>
                <div className="s">Top 5 del mes</div>
                <Bars data={RESTAURANTE.platos} colors={["#f97316", "#eab308", "#f59e0b", "#fb923c", "#fdba74"]} />
              </div>
              <div className="card an">
                <div className="t">Pedidos por hora</div>
                <div className="s">Distribución de hoy</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={RESTAURANTE.horas} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                    <XAxis dataKey="hora" tick={{ fill: "#4e4f60", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4e4f60", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="pedidos" name="Pedidos" radius={[4, 4, 0, 0]} fill="#f97316" fillOpacity={0.75} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="row2">
              <div className="card an">
                <div className="t">Categorías</div>
                <div className="s">Distribución de ventas</div>
                <Donut data={RESTAURANTE.categorias} />
                <DonutLegend data={RESTAURANTE.categorias} />
              </div>
            </div>
          </>)}

          {/* ══════════════════════════════════════════════ */}
          {/* POS                                           */}
          {/* ══════════════════════════════════════════════ */}
          {show.pos && (<>
            <Section icon="💳" bg="rgba(99,102,241,0.1)" title="Punto de Venta" sub="Ventas y facturación" />
            <div className="mkpi-row">
              <div className="mkpi"><div className="ml">Ventas hoy</div><div className="mv">{fCOP(3450000)}</div></div>
              <div className="mkpi"><div className="ml">Facturas</div><div className="mv">48</div></div>
              <div className="mkpi"><div className="ml">Venta promedio</div><div className="mv">{fCOP(71875)}</div></div>
            </div>
            <div className="row2">
              <div className="card an">
                <div className="t">Ventas de la semana</div>
                <div className="s">Últimos 7 días</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={POS.semana} margin={{ top: 5, right: 8, bottom: 5, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                    <XAxis dataKey="dia" tick={{ fill: "#4e4f60", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4e4f60", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fShort} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="ventas" name="Ventas" radius={[5, 5, 0, 0]}>
                      {POS.semana.map((_, i) => <Cell key={i} fill={pal[i % pal.length]} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card an">
                <div className="t">Métodos de pago</div>
                <div className="s">Distribución del mes</div>
                <Donut data={POS.metodos} />
                <DonutLegend data={POS.metodos} />
              </div>
            </div>
            <div className="card full an" style={{ marginBottom: 12 }}>
              <div className="t">Últimas facturas</div>
              <div className="s">Transacciones recientes</div>
              {POS.facturas.map(f => (
                <div className="tk" key={f.id}>
                  <div><div className="tk-id">{f.id}</div><div className="tk-m">{f.items} items · {f.metodo} · {f.hora}</div></div>
                  <div className="tk-t">{fCOP(f.total)}</div>
                </div>
              ))}
            </div>
          </>)}

          {/* ══════════════════════════════════════════════ */}
          {/* INVENTARIO / BODEGA                           */}
          {/* ══════════════════════════════════════════════ */}
          {show.bod && (<>
            <Section icon="📦" bg="rgba(6,182,212,0.1)" title="Inventario" sub="Stock y movimientos" />
            <div className="mkpi-row">
              <div className="mkpi"><div className="ml">Productos</div><div className="mv">342</div></div>
              <div className="mkpi"><div className="ml">Alertas stock</div><div className="mv" style={{ color: "#ef4444" }}>5</div></div>
              <div className="mkpi"><div className="ml">Movimientos hoy</div><div className="mv">18</div></div>
            </div>
            <div className="row2">
              <div className="card an">
                <div className="t">Entradas vs Salidas</div>
                <div className="s">Último semestre</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={BODEGA.movimientos} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1f2e" />
                    <XAxis dataKey="mes" tick={{ fill: "#4e4f60", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4e4f60", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} />
                    <Legend wrapperStyle={{ fontSize: "0.72rem" }} />
                    <Line type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 3 }} />
                    <Line type="monotone" dataKey="salidas" name="Salidas" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card an">
                <div className="t">Por categoría</div>
                <div className="s">Distribución del inventario</div>
                <Donut data={BODEGA.categorias} />
                <DonutLegend data={BODEGA.categorias} />
              </div>
            </div>
            <div className="card full an" style={{ marginBottom: 12 }}>
              <div className="t">⚠️ Alertas de stock bajo</div>
              <div className="s">Productos que necesitan reabastecimiento</div>
              {BODEGA.stockBajo.map((p, i) => (
                <div className="stk" key={i}>
                  <div><div className="stk-n">{p.producto}</div><div className="stk-c">{p.cat}</div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.75rem", color: "#4e4f60" }}>{p.stock}/{p.minimo}</span>
                    <span className={`stk-b ${p.stock <= p.minimo * 0.25 ? "cr" : "wn"}`}>
                      {p.stock <= p.minimo * 0.25 ? "Crítico" : "Bajo"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* ── Footer ── */}
          <div className="D-foot">
            Dashboard actualizado · {now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            {" · Módulos: "}
            {[show.mec && "Mecánica", show.rest && "Restaurante", show.pos && "POS", show.bod && "Inventario"].filter(Boolean).join(" · ") || "General"}
          </div>

        </div>
      </div>
    </div>
  );
}