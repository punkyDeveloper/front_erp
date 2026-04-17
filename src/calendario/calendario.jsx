import { useState, useEffect, useCallback } from "react";
import Nav from "../assets/nav/nav";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_URL  = process.env.REACT_APP_API_URL || "https://back-erp.onrender.com/v1";
const getToken = () => localStorage.getItem("token") || "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const ESTADO_COLORS = {
  Finalizado:    { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0", dot: "#059669" },
  "En progreso": { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA", dot: "#EA580C" },
  "En espera":   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", dot: "#D97706" },
  Pendiente:     { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", dot: "#2563EB" },
  Cancelado:     { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA", dot: "#DC2626" },
};

const TIPO_COLORS = {
  Preventivo: "#7C3AED",
  Correctivo: "#EA580C",
  Predictivo: "#0891B2",
  "Garantía": "#059669",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cal-root { font-family: 'DM Sans', sans-serif; background: #F3F4F6; min-height: 100vh; }

  /* ── HEADER ── */
  .cal-header {
    background: #fff;
    border-bottom: 1px solid #E5E7EB;
    padding: 16px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 40;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
  }
  .cal-nav-btn {
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1px solid #E5E7EB;
    background: #fff;
    color: #374151;
    font-size: 15px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s;
  }
  .cal-nav-btn:hover { background: #F3F4F6; border-color: #D1D5DB; }
  .cal-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    min-width: 220px;
    text-align: center;
  }
  .cal-today-btn {
    padding: 7px 16px;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    background: #fff;
    color: #374151;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all .15s;
    margin-left: 4px;
  }
  .cal-today-btn:hover { background: #F3F4F6; }
  .cal-legend {
    margin-left: auto;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  .cal-legend-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #6B7280;
  }
  .cal-legend-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }

  /* ── GRID ── */
  .cal-body { padding: 0 0 40px; }
  .cal-days-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #fff;
    border-bottom: 1px solid #E5E7EB;
  }
  .cal-day-name {
    text-align: center;
    padding: 10px 4px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: #9CA3AF;
  }
  .cal-day-name.weekend { color: #EF4444; }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: minmax(130px, auto);
    border-left: 1px solid #E5E7EB;
    border-top: 1px solid #E5E7EB;
  }

  /* ── CELL ── */
  .cal-cell {
    border-right: 1px solid #E5E7EB;
    border-bottom: 1px solid #E5E7EB;
    background: #fff;
    padding: 6px 4px 6px;
    min-height: 130px;
    overflow: hidden;
    position: relative;
    transition: background .1s;
  }
  .cal-cell:hover { background: #FAFAFA; }
  .cal-cell.other-month { background: #F9FAFB; }
  .cal-cell.other-month .cal-day-num { color: #D1D5DB; }
  .cal-cell.today { background: #EFF6FF; }
  .cal-cell.today:hover { background: #DBEAFE; }
  .cal-cell.weekend-cell { background: #FAFAFA; }
  .cal-cell.weekend-cell.other-month { background: #F5F5F6; }

  .cal-day-num {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    margin-bottom: 4px;
    margin-left: 2px;
  }
  .cal-cell.today .cal-day-num {
    background: #2563EB;
    color: #fff;
  }

  /* ── EVENTO ── */
  .cal-event {
    border-radius: 5px;
    padding: 3px 6px;
    margin-bottom: 2px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 5px;
    border-left: 3px solid;
    transition: filter .15s, transform .1s;
    line-height: 1.4;
    overflow: hidden;
  }
  .cal-event:hover { filter: brightness(.95); transform: translateX(1px); }
  .cal-event-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 3px;
  }
  .cal-event-body { min-width: 0; flex: 1; }
  .cal-event-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
  .cal-event-meta {
    font-size: 10px;
    opacity: .8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
  .cal-more-btn {
    font-size: 10px;
    color: #6B7280;
    font-weight: 600;
    cursor: pointer;
    padding: 1px 4px;
    border-radius: 4px;
    background: #F3F4F6;
    border: none;
    font-family: 'DM Sans', sans-serif;
    display: inline-block;
    margin-top: 1px;
  }
  .cal-more-btn:hover { background: #E5E7EB; }

  /* ── LOADING ── */
  .cal-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 80px 0;
    font-size: 15px; color: #9CA3AF; gap: 10px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .cal-spinner {
    width: 22px; height: 22px;
    border: 3px solid #E5E7EB;
    border-top-color: #2563EB;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }

  /* ── MODAL DETALLE ── */
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(14px) scale(.97); }
    to   { opacity: 1; transform: none; }
  }
  .cal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.4);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
  }
  .cal-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 520px;
    max-height: 88vh;
    overflow-y: auto;
    padding: 28px 30px 24px;
    box-shadow: 0 24px 60px rgba(0,0,0,.18);
    animation: slideUp .22s ease;
  }
  .cal-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .cal-modal-close {
    width: 30px; height: 30px;
    border-radius: 8px;
    border: none;
    background: #F3F4F6;
    color: #6B7280;
    font-size: 18px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
    flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .cal-modal-close:hover { background: #E5E7EB; color: #111827; }

  .cal-modal-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    border: 1px solid;
    margin-bottom: 8px;
  }
  .cal-modal-title {
    font-size: 18px; font-weight: 700; color: #111827;
    line-height: 1.3;
  }
  .cal-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
  }
  .cal-info-item { display: flex; flex-direction: column; gap: 2px; }
  .cal-info-label {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .05em;
    color: #9CA3AF;
  }
  .cal-info-value {
    font-size: 13px; font-weight: 600; color: #1F2937;
  }
  .cal-section-title {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .06em;
    color: #9CA3AF;
    margin-bottom: 8px;
    margin-top: 16px;
  }
  .cal-svc-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 10px;
    border-radius: 8px;
    background: #F9FAFB;
    border: 1px solid #F3F4F6;
    margin-bottom: 5px;
    font-size: 13px;
  }
  .cal-svc-name { color: #1F2937; font-weight: 500; }
  .cal-svc-price { color: #059669; font-weight: 700; font-size: 12px; }
  .cal-descripcion {
    background: #FFFBEB;
    border-left: 3px solid #F59E0B;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 13px;
    color: #78350F;
    margin-top: 14px;
    line-height: 1.5;
  }

  /* ── MÁS EVENTOS MODAL ── */
  .cal-more-modal {
    background: #fff;
    border-radius: 14px;
    width: 100%;
    max-width: 360px;
    padding: 22px 22px 18px;
    box-shadow: 0 16px 40px rgba(0,0,0,.15);
    animation: slideUp .2s ease;
  }
  .cal-more-title {
    font-size: 14px; font-weight: 700; color: #111827;
    margin-bottom: 14px;
    display: flex; justify-content: space-between; align-items: center;
  }

  /* ── STATS ── */
  .cal-stats {
    display: flex; gap: 8px; align-items: center;
    padding: 10px 28px;
    background: #fff;
    border-bottom: 1px solid #E5E7EB;
    flex-wrap: wrap;
  }
  .cal-stat-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px; font-weight: 600;
    border: 1px solid;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }

  @media (max-width: 768px) {
    .cal-grid { grid-auto-rows: minmax(80px, auto); }
    .cal-event-meta { display: none; }
    .cal-title { font-size: 16px; min-width: 160px; }
    .cal-legend { display: none; }
    .cal-stats { display: none; }
  }
`;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

const fmtFecha = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

// Clave "YYYY-MM-DD" de un registro
const claveDate = (item) => {
  if (!item.fecha) return null;
  const raw = item.fecha.split("T")[0]; // yyyy-mm-dd
  return raw;
};

// Agrupar registros por fecha
const agruparPorFecha = (items) => {
  const map = {};
  items.forEach((item) => {
    const k = claveDate(item);
    if (!k) return;
    if (!map[k]) map[k] = [];
    map[k].push(item);
  });
  return map;
};

// Color del evento según estado
const eventoColor = (estado) =>
  ESTADO_COLORS[estado] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB", dot: "#6B7280" };

// ─── COMPONENTE EVENTO EN CELDA ────────────────────────────────────────────────
function EventoChip({ item, onClick }) {
  const c = eventoColor(item.estado);
  const nombre = item.nombreCliente || item.cedula || "Cliente";
  const mec = item.taller || "—";
  return (
    <div
      className="cal-event"
      onClick={(e) => { e.stopPropagation(); onClick(item); }}
      style={{
        background: c.bg,
        color: c.text,
        borderLeftColor: c.dot,
      }}
    >
      <span className="cal-event-dot" style={{ background: c.dot }} />
      <span className="cal-event-body">
        <span className="cal-event-name">{nombre}</span>
        <span className="cal-event-meta">{item.placa || item.vehiculo || "Vehículo"} · {mec}</span>
      </span>
    </div>
  );
}

// ─── MODAL DETALLE ────────────────────────────────────────────────────────────
function ModalDetalle({ item, onClose }) {
  if (!item) return null;
  const c = eventoColor(item.estado);
  const tipoColor = TIPO_COLORS[item.tipo] || "#6B7280";

  return (
    <div className="cal-overlay">
      <div className="cal-modal">
        <div className="cal-modal-header">
          <div style={{ flex: 1 }}>
            <span
              className="cal-modal-badge"
              style={{ background: c.bg, color: c.text, borderColor: c.border }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
              {item.estado}
            </span>
            <div className="cal-modal-title">
              {item.nombreCliente || item.cedula || "Cliente sin nombre"}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
              {fmtFecha(item.fecha)}
            </div>
          </div>
          <button className="cal-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tipo badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: tipoColor + "18", color: tipoColor,
          padding: "4px 10px", borderRadius: 8,
          fontSize: 12, fontWeight: 700, marginBottom: 16,
          border: `1px solid ${tipoColor}33`,
        }}>
          {item.tipo === "Preventivo" ? "🔧" : item.tipo === "Predictivo" ? "📊" : item.tipo === "Garantía" ? "🛡️" : "⚠️"}
          {item.tipo}
        </div>

        {/* Info grid */}
        <div className="cal-info-grid">
          <div className="cal-info-item">
            <span className="cal-info-label">Documento</span>
            <span className="cal-info-value">{item.tipoDocumentoCliente || "CC"} {item.cedula || "—"}</span>
          </div>
          <div className="cal-info-item">
            <span className="cal-info-label">Teléfono</span>
            <span className="cal-info-value">{item.telefonoCliente || "—"}</span>
          </div>
          <div className="cal-info-item">
            <span className="cal-info-label">Vehículo</span>
            <span className="cal-info-value">{item.vehiculo || "—"}</span>
          </div>
          <div className="cal-info-item">
            <span className="cal-info-label">Placa</span>
            <span className="cal-info-value" style={{ fontFamily: "monospace", fontSize: 14 }}>
              {item.placa || "—"}
            </span>
          </div>
          <div className="cal-info-item">
            <span className="cal-info-label">Mecánico / Taller</span>
            <span className="cal-info-value">{item.taller || "—"}</span>
          </div>
          <div className="cal-info-item">
            <span className="cal-info-label">Kilometraje</span>
            <span className="cal-info-value">{item.kilometraje ? `${Number(item.kilometraje).toLocaleString()} km` : "—"}</span>
          </div>
        </div>

        {/* Servicios */}
        {(item.servicios || []).length > 0 && (
          <>
            <div className="cal-section-title">Servicios</div>
            {item.servicios.map((s, i) => (
              <div key={i} className="cal-svc-item">
                <span className="cal-svc-name">🔧 {s.nombre}</span>
                <span className="cal-svc-price">{fmt(s.precio)}</span>
              </div>
            ))}
          </>
        )}

        {/* Productos */}
        {(item.productos || []).length > 0 && (
          <>
            <div className="cal-section-title">Repuestos</div>
            {item.productos.map((p, i) => (
              <div key={i} className="cal-svc-item">
                <span className="cal-svc-name">📦 {p.nombre}</span>
                <span className="cal-svc-price">{fmt(p.precioVenta)}</span>
              </div>
            ))}
          </>
        )}

        {/* Total */}
        {item.costoCliente > 0 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 14, padding: "12px 14px",
            background: "linear-gradient(135deg,#1A1A2E,#3D3D6B)",
            borderRadius: 10, color: "#fff",
          }}>
            <span style={{ fontSize: 13, opacity: .8 }}>Total</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{fmt(item.costoCliente)}</span>
          </div>
        )}

        {/* Descripción */}
        {item.descripcion && (
          <div className="cal-descripcion">
            <strong style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "#D97706", display: "block", marginBottom: 4 }}>
              Descripción
            </strong>
            {item.descripcion}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL MÁS EVENTOS ────────────────────────────────────────────────────────
function ModalMas({ items, fecha, onClose, onSelect }) {
  const d = new Date(fecha + "T00:00:00");
  const label = d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="cal-overlay">
      <div className="cal-more-modal">
        <div className="cal-more-title">
          <span style={{ textTransform: "capitalize" }}>{label}</span>
          <button className="cal-modal-close" onClick={onClose}>×</button>
        </div>
        {items.map((item, i) => (
          <EventoChip key={i} item={item} onClick={(it) => { onClose(); onSelect(it); }} />
        ))}
      </div>
    </div>
  );
}

// ─── CELDA DEL CALENDARIO ──────────────────────────────────────────────────────
function CalCell({ date, isCurrentMonth, isToday, eventos, onSelectEvento }) {
  const [mostrarMas, setMostrarMas] = useState(false);
  const MAX_VISIBLE = 3;
  const visibles = eventos.slice(0, MAX_VISIBLE);
  const restantes = eventos.slice(MAX_VISIBLE);
  const esFinDeSemana = date.getDay() === 0 || date.getDay() === 6;

  let className = "cal-cell";
  if (!isCurrentMonth) className += " other-month";
  if (isToday) className += " today";
  if (esFinDeSemana) className += " weekend-cell";

  return (
    <div className={className}>
      <div className="cal-day-num">{date.getDate()}</div>
      {visibles.map((ev, i) => (
        <EventoChip key={i} item={ev} onClick={onSelectEvento} />
      ))}
      {restantes.length > 0 && (
        <button
          className="cal-more-btn"
          onClick={(e) => { e.stopPropagation(); setMostrarMas(true); }}
        >
          +{restantes.length} más
        </button>
      )}
      {mostrarMas && (
        <ModalMas
          items={eventos}
          fecha={date.toISOString().split("T")[0]}
          onClose={() => setMostrarMas(false)}
          onSelect={onSelectEvento}
        />
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Calendario() {
  const hoy = new Date();
  const [mes, setMes]           = useState(hoy.getMonth());
  const [anio, setAnio]         = useState(hoy.getFullYear());
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);   // item para modal detalle
  const [stats, setStats]       = useState(null);

  // ── Fetch todos los registros ───────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // Traemos hasta 500 registros para cubrir el mes visible y meses adyacentes
      const r = await fetch(`${API_URL}/mecanica?limit=500&page=1`, { headers: authHeaders() });
      const j = await r.json();
      if (!r.ok) throw new Error(j.msg || "Error al cargar");
      setData(j.data || []);
      if (j.stats) setStats(j.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Agrupar por fecha ───────────────────────────────────────────────────────
  const porFecha = agruparPorFecha(data);

  // ── Calcular días del calendario ────────────────────────────────────────────
  const primerDiaMes    = new Date(anio, mes, 1);
  const ultimoDiaMes    = new Date(anio, mes + 1, 0);
  const startOffset     = primerDiaMes.getDay(); // 0=Dom
  const diasEnCuadricula = [];

  // Días del mes anterior
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(anio, mes, -i);
    diasEnCuadricula.push({ date: d, currentMonth: false });
  }
  // Días del mes actual
  for (let d = 1; d <= ultimoDiaMes.getDate(); d++) {
    diasEnCuadricula.push({ date: new Date(anio, mes, d), currentMonth: true });
  }
  // Días del mes siguiente para completar la cuadrícula
  const restantes = 7 - (diasEnCuadricula.length % 7);
  if (restantes < 7) {
    for (let d = 1; d <= restantes; d++) {
      diasEnCuadricula.push({ date: new Date(anio, mes + 1, d), currentMonth: false });
    }
  }

  // ── Navegación ──────────────────────────────────────────────────────────────
  const irMesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1); }
    else setMes(m => m - 1);
  };
  const irMesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1); }
    else setMes(m => m + 1);
  };
  const irHoy = () => { setMes(hoy.getMonth()); setAnio(hoy.getFullYear()); };

  // ── Stats del mes visible ───────────────────────────────────────────────────
  const registrosMes = data.filter((item) => {
    const k = claveDate(item);
    if (!k) return false;
    const [y, m] = k.split("-").map(Number);
    return y === anio && m - 1 === mes;
  });
  const pendientesMes   = registrosMes.filter(x => x.estado === "Pendiente").length;
  const enProgresoMes   = registrosMes.filter(x => x.estado === "En progreso" || x.estado === "En espera").length;
  const finalizadosMes  = registrosMes.filter(x => x.estado === "Finalizado").length;
  const canceladosMes   = registrosMes.filter(x => x.estado === "Cancelado").length;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6" }}>
      <style>{CSS}</style>
      <Nav />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} className="cal-root">

        {/* ── HEADER ── */}
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={irMesAnterior} title="Mes anterior">&#8249;</button>
          <button className="cal-nav-btn" onClick={irMesSiguiente} title="Mes siguiente">&#8250;</button>
          <div className="cal-title">
            {MESES[mes]} {anio}
          </div>
          <button className="cal-today-btn" onClick={irHoy}>Hoy</button>

          {/* Leyenda */}
          <div className="cal-legend">
            {Object.entries(ESTADO_COLORS).map(([estado, c]) => (
              <div key={estado} className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: c.dot }} />
                {estado}
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS DEL MES ── */}
        <div className="cal-stats">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginRight: 4 }}>
            {MESES[mes]}:
          </span>
          <div className="cal-stat-chip" style={{ background: ESTADO_COLORS.Pendiente.bg, color: ESTADO_COLORS.Pendiente.text, borderColor: ESTADO_COLORS.Pendiente.border }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ESTADO_COLORS.Pendiente.dot, display: "inline-block" }} />
            Pendientes: {pendientesMes}
          </div>
          <div className="cal-stat-chip" style={{ background: ESTADO_COLORS["En progreso"].bg, color: ESTADO_COLORS["En progreso"].text, borderColor: ESTADO_COLORS["En progreso"].border }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ESTADO_COLORS["En progreso"].dot, display: "inline-block" }} />
            En curso: {enProgresoMes}
          </div>
          <div className="cal-stat-chip" style={{ background: ESTADO_COLORS.Finalizado.bg, color: ESTADO_COLORS.Finalizado.text, borderColor: ESTADO_COLORS.Finalizado.border }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ESTADO_COLORS.Finalizado.dot, display: "inline-block" }} />
            Finalizados: {finalizadosMes}
          </div>
          {canceladosMes > 0 && (
            <div className="cal-stat-chip" style={{ background: ESTADO_COLORS.Cancelado.bg, color: ESTADO_COLORS.Cancelado.text, borderColor: ESTADO_COLORS.Cancelado.border }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: ESTADO_COLORS.Cancelado.dot, display: "inline-block" }} />
              Cancelados: {canceladosMes}
            </div>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
            {registrosMes.length} servicio{registrosMes.length !== 1 ? "s" : ""} este mes
          </span>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{ padding: "12px 28px", background: "#FEF2F2", color: "#DC2626", fontSize: 13, borderBottom: "1px solid #FECACA" }}>
            ⚠️ {error} —{" "}
            <button onClick={fetchAll} style={{ background: "none", border: "none", color: "#DC2626", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
              Reintentar
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading ? (
          <div className="cal-loading">
            <div className="cal-spinner" />
            Cargando servicios...
          </div>
        ) : (
          <div className="cal-body" style={{ flex: 1, overflowY: "auto" }}>
            {/* Cabecera días */}
            <div className="cal-days-header">
              {DIAS_SEMANA.map((d, i) => (
                <div key={d} className={`cal-day-name${i === 0 || i === 6 ? " weekend" : ""}`}>{d}</div>
              ))}
            </div>

            {/* Cuadrícula */}
            <div className="cal-grid">
              {diasEnCuadricula.map(({ date, currentMonth }, idx) => {
                const clave = date.toISOString().split("T")[0];
                const eventos = porFecha[clave] || [];
                const esHoy =
                  date.getDate() === hoy.getDate() &&
                  date.getMonth() === hoy.getMonth() &&
                  date.getFullYear() === hoy.getFullYear();
                return (
                  <CalCell
                    key={idx}
                    date={date}
                    isCurrentMonth={currentMonth}
                    isToday={esHoy}
                    eventos={eventos}
                    onSelectEvento={setSelected}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── MODAL DETALLE ── */}
        {selected && <ModalDetalle item={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
