import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePermisos } from '../context/PermissionsContext';
import Nav from '../assets/nav/nav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/v1';

/* ═══════════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════════ */

const CATEGORIAS_EGRESO = [
  { valor: 'nomina',      label: 'Nómina',              color: '#6366f1' },
  { valor: 'arriendo',    label: 'Arriendo',            color: '#f59e0b' },
  { valor: 'servicios',   label: 'Servicios públicos',  color: '#0ea5e9' },
  { valor: 'proveedores', label: 'Proveedores',         color: '#64748b' },
  { valor: 'materiales',  label: 'Materiales',          color: '#78716c' },
  { valor: 'equipo',      label: 'Equipo',              color: '#10b981' },
  { valor: 'impuestos',   label: 'Impuestos',           color: '#ef4444' },
  { valor: 'marketing',   label: 'Marketing',           color: '#ec4899' },
  { valor: 'otros',       label: 'Otros',               color: '#94a3b8' },
];

const MODULOS_INGRESO = [
  { valor: 'pos',         label: 'POS / Caja',  color: '#10b981' },
  { valor: 'mecanica',    label: 'Mecánica',    color: '#3b82f6' },
  { valor: 'restaurante', label: 'Restaurante', color: '#f59e0b' },
  { valor: 'general',     label: 'General',     color: '#64748b' },
];

const METODOS_PAGO = [
  { valor: 'efectivo',      label: 'Efectivo'      },
  { valor: 'tarjeta',       label: 'Tarjeta'       },
  { valor: 'transferencia', label: 'Transferencia' },
  { valor: 'credito',       label: 'Crédito'       },
  { valor: 'cheque',        label: 'Cheque'        },
];

/* ═══════════════════════════════════════════════════════════
   ESTILOS GLOBALES
═══════════════════════════════════════════════════════════ */

const CSS = `
  .lc-wrap { background: #f1f5f9; min-height: 100vh; flex: 1; overflow-y: auto; }

  /* ── Period bar ── */
  .lc-period-bar {
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    padding: 16px 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .lc-period-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #94a3b8;
    margin-right: 4px;
  }
  .lc-period-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .lc-period-btn {
    padding: 8px 20px;
    border-radius: 50px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all .2s;
    white-space: nowrap;
  }
  .lc-period-btn:hover { border-color: #6366f1; color: #6366f1; }
  .lc-period-btn.active {
    background: #6366f1;
    border-color: #6366f1;
    color: #fff;
    box-shadow: 0 2px 8px rgba(99,102,241,.35);
  }
  .lc-date-range {
    font-size: 0.82rem;
    color: #475569;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }
  .lc-date-input {
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 0.82rem;
    color: #334155;
    outline: none;
    transition: border-color .2s;
  }
  .lc-date-input:focus { border-color: #6366f1; }

  /* ── Header ── */
  .lc-header {
    background: #fff;
    padding: 24px 24px 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .lc-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
  .lc-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 2px 0 0; }

  /* ── KPI Cards ── */
  .lc-kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 20px 24px;
  }
  @media (max-width: 1100px) { .lc-kpi-row { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .lc-kpi-row { grid-template-columns: 1fr; } }
  .lc-kpi {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
    border-left: 4px solid transparent;
    transition: box-shadow .2s;
  }
  .lc-kpi:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
  .lc-kpi-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; }
  .lc-kpi-value { font-size: 1.55rem; font-weight: 800; line-height: 1.1; }
  .lc-kpi-sub   { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }
  .lc-kpi.green  { border-left-color: #10b981; }
  .lc-kpi.green .lc-kpi-value  { color: #059669; }
  .lc-kpi.red    { border-left-color: #ef4444; }
  .lc-kpi.red .lc-kpi-value    { color: #dc2626; }
  .lc-kpi.blue   { border-left-color: #3b82f6; }
  .lc-kpi.blue .lc-kpi-value   { color: #2563eb; }
  .lc-kpi.purple { border-left-color: #8b5cf6; }
  .lc-kpi.purple .lc-kpi-value { color: #7c3aed; }

  /* ── Tabs ── */
  .lc-tabs { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; gap: 0; }
  .lc-tab-btn {
    padding: 14px 22px;
    font-size: 0.86rem;
    font-weight: 600;
    color: #94a3b8;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2.5px solid transparent;
    transition: all .2s;
    white-space: nowrap;
  }
  .lc-tab-btn:hover { color: #334155; }
  .lc-tab-btn.active { color: #6366f1; border-bottom-color: #6366f1; }

  /* ── Content area ── */
  .lc-content { padding: 24px; }

  /* ── Table ── */
  .lc-table-wrap {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
  }
  .lc-table-toolbar {
    padding: 16px 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
  }
  .lc-search {
    flex: 1;
    min-width: 200px;
    padding: 8px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.84rem;
    color: #334155;
    outline: none;
    transition: border-color .2s;
  }
  .lc-search:focus { border-color: #6366f1; }
  .lc-select {
    padding: 8px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.84rem;
    color: #334155;
    background: #fff;
    outline: none;
    cursor: pointer;
    transition: border-color .2s;
  }
  .lc-select:focus { border-color: #6366f1; }
  .lc-icon-btn {
    padding: 8px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    color: #64748b;
    font-size: 0.84rem;
    cursor: pointer;
    font-weight: 600;
    transition: all .2s;
  }
  .lc-icon-btn:hover { border-color: #6366f1; color: #6366f1; }
  .lc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.84rem;
  }
  .lc-table thead th {
    padding: 12px 16px;
    background: #f8fafc;
    color: #64748b;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }
  .lc-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background .15s;
  }
  .lc-table tbody tr:hover { background: #f8fafc; }
  .lc-table tbody tr:last-child { border-bottom: none; }
  .lc-table td { padding: 12px 16px; color: #334155; vertical-align: middle; }
  .lc-table tfoot td {
    padding: 12px 16px;
    background: #f8fafc;
    font-weight: 700;
    border-top: 2px solid #e2e8f0;
    font-size: 0.82rem;
  }

  /* ── Badges ── */
  .lc-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 50px;
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
  }
  .lc-badge.in  { background: #dcfce7; color: #16a34a; }
  .lc-badge.out { background: #fee2e2; color: #dc2626; }
  .lc-badge.ok  { background: #dcfce7; color: #16a34a; }
  .lc-badge.pnd { background: #fef9c3; color: #ca8a04; }
  .lc-badge.ann { background: #f1f5f9; color: #94a3b8; }

  /* ── Botones acción ── */
  .lc-btn {
    padding: 7px 16px;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all .2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .lc-btn.primary   { background: #6366f1; color: #fff; }
  .lc-btn.primary:hover { background: #4f46e5; }
  .lc-btn.danger    { background: #ef4444; color: #fff; }
  .lc-btn.danger:hover  { background: #dc2626; }
  .lc-btn.ghost     { background: #f1f5f9; color: #475569; }
  .lc-btn.ghost:hover   { background: #e2e8f0; }
  .lc-btn.outline   { background: #fff; color: #475569; border: 1.5px solid #e2e8f0; }
  .lc-btn.outline:hover { border-color: #6366f1; color: #6366f1; }
  .lc-btn:disabled  { opacity: .5; cursor: not-allowed; }

  /* ── Empty state ── */
  .lc-empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
  .lc-empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
  .lc-empty p { font-size: 0.9rem; margin: 0; }

  /* ── Modal ── */
  .lc-backdrop {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1050;
    padding: 16px;
  }
  .lc-modal {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0,0,0,.2);
    overflow: hidden;
  }
  .lc-modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .lc-modal-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
  .lc-modal-close {
    background: #f1f5f9; border: none; border-radius: 50%;
    width: 32px; height: 32px; font-size: 1rem;
    cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .lc-modal-close:hover { background: #e2e8f0; }
  .lc-modal-body { padding: 20px 24px; }
  .lc-modal-footer { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; justify-content: flex-end; }

  .lc-detail-amount {
    text-align: center;
    padding: 20px;
    background: #f8fafc;
    border-radius: 14px;
    margin-bottom: 20px;
  }
  .lc-detail-amount .label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
  .lc-detail-amount .value { font-size: 2rem; font-weight: 800; }

  .lc-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.84rem;
  }
  .lc-detail-row:last-child { border-bottom: none; }
  .lc-detail-row .key { color: #94a3b8; font-weight: 500; }
  .lc-detail-row .val { font-weight: 600; color: #334155; text-align: right; }

  /* ── Balance ── */
  .lc-balance-bar-wrap {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
    margin-bottom: 16px;
  }
  .lc-balance-bar {
    height: 16px;
    border-radius: 50px;
    overflow: hidden;
    background: #f1f5f9;
    display: flex;
    margin: 16px 0;
  }
  .lc-bar-in  { background: #10b981; transition: width .6s ease; }
  .lc-bar-out { background: #ef4444; transition: width .6s ease; }
  .lc-balance-nums {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 20px;
  }
  .lc-balance-num {
    text-align: center;
    padding: 16px;
    border-radius: 12px;
  }
  .lc-balance-num .lbl { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
  .lc-balance-num .val { font-size: 1.2rem; font-weight: 800; margin-top: 6px; }
  .lc-balance-num .sub { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }

  /* ── Form egreso ── */
  .lc-form-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
    margin-bottom: 16px;
    border-top: 4px solid #ef4444;
  }
  .lc-form-header { padding: 16px 20px; background: #fff5f5; }
  .lc-form-header h6 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #dc2626; }
  .lc-form-body { padding: 20px; }
  .lc-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media (max-width: 600px) { .lc-form-grid { grid-template-columns: 1fr; } }
  .lc-form-full { grid-column: 1 / -1; }
  .lc-label { font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 5px; display: block; text-transform: uppercase; letter-spacing: .04em; }
  .lc-input, .lc-select-f {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.85rem;
    color: #334155;
    background: #fff;
    outline: none;
    transition: border-color .2s;
    box-sizing: border-box;
  }
  .lc-input:focus, .lc-select-f:focus { border-color: #6366f1; }

  /* ── Factura modal ── */
  .lc-modal.wide { max-width: 640px; }
  .lc-factura-num { font-size: 0.75rem; color: #94a3b8; }
  .lc-factura-items { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.82rem; }
  .lc-factura-items th { padding: 8px 10px; background: #f8fafc; color: #64748b; font-size: 0.7rem; text-transform: uppercase; text-align: left; }
  .lc-factura-items td { padding: 8px 10px; border-top: 1px solid #f1f5f9; }
  .lc-factura-totals { border-top: 2px solid #e2e8f0; margin-top: 4px; }
  .lc-factura-totals .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.84rem; }
  .lc-factura-totals .row.bold { font-weight: 700; font-size: 1rem; color: #0f172a; }
`;

/* ═══════════════════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════════════════ */

const fmt$ = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const fmtHora = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

const hoy = () => new Date().toISOString().slice(0, 10);

function inicioSemana() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function inicioMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function getRango(p) {
  const h = hoy();
  if (p === 'hoy')    return { desde: h,              hasta: h };
  if (p === 'semana') return { desde: inicioSemana(), hasta: h };
  if (p === 'mes')    return { desde: inicioMes(),    hasta: h };
  return null;
}

const getPayload = () => {
  try {
    const t = localStorage.getItem('token');
    return t ? JSON.parse(atob(t.split('.')[1])) : {};
  } catch { return {}; }
};

const catInfo = (v) => CATEGORIAS_EGRESO.find(c => c.valor === v) ?? CATEGORIAS_EGRESO.at(-1);
const modInfo = (v) => MODULOS_INGRESO.find(m => m.valor === v) ?? MODULOS_INGRESO.at(-1);

/* ═══════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════ */

function useFetch(url) {
  const [data,    setData   ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState(null);

  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true); setError(null);
    try {
      const tok = localStorage.getItem('token');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState(null);

  const mutate = useCallback(async (path, method = 'POST', body = null) => {
    setLoading(true); setError(null);
    try {
      const tok = localStorage.getItem('token');
      const res = await fetch(`${API}${path}`, {
        method,
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || `Error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTES BASE
═══════════════════════════════════════════════════════════ */

function Spinner() {
  return (
    <div className="lc-empty">
      <div className="spinner-border text-primary" style={{ width: 36, height: 36 }} role="status" />
      <p style={{ marginTop: 12 }}>Cargando…</p>
    </div>
  );
}

function Badge({ tipo, estado }) {
  if (tipo === 'tipo') {
    return estado === 'ingreso'
      ? <span className="lc-badge in">▲ Ingreso</span>
      : <span className="lc-badge out">▼ Egreso</span>;
  }
  const map = {
    pagada:    <span className="lc-badge ok">Pagada</span>,
    activo:    <span className="lc-badge ok">Activo</span>,
    pendiente: <span className="lc-badge pnd">Pendiente</span>,
    anulada:   <span className="lc-badge ann">Anulada</span>,
    anulado:   <span className="lc-badge ann">Anulado</span>,
  };
  return map[estado] ?? <span className="lc-badge ann">{estado ?? '—'}</span>;
}

function CatPill({ valor, tipo = 'egreso' }) {
  const info = tipo === 'egreso' ? catInfo(valor) : modInfo(valor);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 50,
        fontSize: '0.72rem',
        fontWeight: 700,
        background: info.color + '18',
        color: info.color,
        whiteSpace: 'nowrap',
      }}
    >
      {info.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL DETALLE EGRESO
═══════════════════════════════════════════════════════════ */

function ModalEgreso({ egreso, onCerrar, onAnulado, puedeAnular }) {
  const { mutate, loading } = useMutation();
  const [confirm, setConfirm] = useState(false);
  const anulado = (egreso.estado ?? 'activo') === 'anulado';

  const anular = async () => {
    try {
      await mutate(`/egresos/${egreso.id}/anular`, 'PATCH');
      onAnulado(egreso.id);
    } catch { /* manejado en hook */ }
  };

  return (
    <div className="lc-backdrop">
      <div className="lc-modal">
        <div className="lc-modal-header">
          <h5 className="lc-modal-title">Detalle del Egreso</h5>
          <button className="lc-modal-close" onClick={onCerrar}>×</button>
        </div>
        <div className="lc-modal-body">
          {/* Descripción destacada */}
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Descripción</div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{egreso.concepto}</div>
            {egreso.notas && (
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, borderTop: '1px solid #fecaca', paddingTop: 6 }}>{egreso.notas}</div>
            )}
          </div>

          <div className="lc-detail-row"><span className="key">Categoría</span><span className="val"><CatPill valor={egreso.categoria} tipo="egreso" /></span></div>
          <div className="lc-detail-row"><span className="key">Fecha</span><span className="val">{fmtFecha(egreso.fecha)}</span></div>
          <div className="lc-detail-row"><span className="key">Método</span><span className="val">{egreso.metodo_pago}</span></div>
          {egreso.proveedor  && <div className="lc-detail-row"><span className="key">Proveedor</span><span className="val">{egreso.proveedor}</span></div>}
          {egreso.referencia && <div className="lc-detail-row"><span className="key">Referencia</span><span className="val"><code>{egreso.referencia}</code></span></div>}
          <div className="lc-detail-row"><span className="key">Registrado por</span><span className="val">{egreso.usuario_nombre ?? '—'}</span></div>
          <div className="lc-detail-row"><span className="key">Estado</span><span className="val"><Badge estado={egreso.estado ?? 'activo'} /></span></div>

          {/* Total destacado */}
          <div style={{ marginTop: 16, background: '#fef2f2', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #fecaca' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>{fmt$(egreso.monto)}</span>
          </div>
        </div>
        {puedeAnular && !anulado && (
          <div className="lc-modal-footer" style={{ justifyContent: 'space-between' }}>
            {!confirm ? (
              <button className="lc-btn ghost" onClick={() => setConfirm(true)}>Anular egreso</button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>¿Confirmar anulación?</span>
                <button className="lc-btn danger" onClick={anular} disabled={loading}>
                  {loading ? '…' : 'Sí, anular'}
                </button>
                <button className="lc-btn ghost" onClick={() => setConfirm(false)}>No</button>
              </div>
            )}
            <button className="lc-btn outline" onClick={onCerrar}>Cerrar</button>
          </div>
        )}
        {(anulado || !puedeAnular) && (
          <div className="lc-modal-footer">
            <button className="lc-btn ghost" onClick={onCerrar}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL VER FACTURA
═══════════════════════════════════════════════════════════ */

function ModalFactura({ factura, onCerrar }) {
  const servicios = factura.servicios ?? [];
  const productos = factura.productos ?? [];
  const items     = factura.items ?? factura.detalle ?? [];
  const usaDetalleMecanica = servicios.length > 0 || productos.length > 0;

  const totalServicios = servicios.reduce((s, x) => s + (Number(x.precio) || 0), 0);
  const totalProductos = productos.reduce((s, p) => s + ((Number(p.precioVenta) || 0) * (Number(p.cantidad) || 1)), 0);
  const subtotalGenerico = items.reduce((s, i) => s + (i.subtotal ?? i.precio_total ?? 0), 0);
  const subtotal = factura.subtotal ?? (usaDetalleMecanica ? totalServicios + totalProductos : subtotalGenerico);
  const iva      = factura.iva ?? 0;
  const total    = factura.total ?? subtotal + iva;

  const seccionLabel = (icon, label, color) => (
    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color, marginBottom: 6, marginTop: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
      <span>{icon}</span>{label}
    </div>
  );

  return (
    <div className="lc-backdrop">
      <div className="lc-modal wide">
        <div className="lc-modal-header">
          <div>
            <h5 className="lc-modal-title">Factura</h5>
            <span className="lc-factura-num">{factura.numero_factura ?? `#${factura.id}`}</span>
          </div>
          <button className="lc-modal-close" onClick={onCerrar}>×</button>
        </div>

        <div className="lc-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Datos cliente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Cliente</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{factura.cliente_nombre ?? factura.nombreCliente ?? 'Consumidor final'}</div>
              {(factura.cliente_documento ?? factura.cedula) && (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{factura.cliente_documento ?? factura.cedula}</div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Fecha</div>
              <div style={{ fontWeight: 600, color: '#334155' }}>{fmtFecha(factura.created_at ?? factura.fecha)}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{fmtHora(factura.created_at ?? factura.fecha)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Badge estado={factura.estado} />
            <CatPill valor={factura.modulo ?? 'general'} tipo="ingreso" />
            {factura.metodo_pago && (
              <span style={{ fontSize: '0.78rem', color: '#64748b', padding: '3px 10px', background: '#f1f5f9', borderRadius: 50 }}>
                {factura.metodo_pago}
              </span>
            )}
          </div>

          {usaDetalleMecanica ? (
            <>
              {/* ── Servicios realizados ── */}
              {servicios.length > 0 && (
                <>
                  {seccionLabel('🔧', 'Servicios realizados', '#4338ca')}
                  <table className="lc-factura-items">
                    <thead>
                      <tr>
                        <th>Servicio</th>
                        <th style={{ textAlign: 'right' }}>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicios.map((s, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{s.nombre || '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#4338ca' }}>{fmt$(s.precio)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* ── Productos / Repuestos ── */}
              {productos.length > 0 && (
                <>
                  {seccionLabel('📦', 'Productos / Repuestos', '#0369a1')}
                  <table className="lc-factura-items">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th style={{ textAlign: 'center' }}>Cantidad</th>
                        <th style={{ textAlign: 'right' }}>Precio unitario</th>
                        <th style={{ textAlign: 'right' }}>Mi costo real</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{p.nombre || '—'}</td>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>{p.cantidad ?? 1}</td>
                          <td style={{ textAlign: 'right', color: '#0369a1', fontWeight: 600 }}>{fmt$(p.precioVenta ?? p.precio_unitario)}</td>
                          <td style={{ textAlign: 'right', color: '#7c3aed', fontWeight: 600 }}>{fmt$(p.costo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          ) : items.length > 0 ? (
            <table className="lc-factura-items">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Precio</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{item.nombre ?? item.descripcion ?? `Ítem ${i + 1}`}</td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{item.cantidad ?? 1}</td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>{fmt$(item.precio_unitario ?? item.precio ?? 0)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt$(item.subtotal ?? item.precio_total ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem', marginBottom: 16 }}>
              Sin detalle de ítems disponible
            </div>
          )}

          {/* ── Totales ── */}
          <div className="lc-factura-totals" style={{ marginTop: 16 }}>
            {usaDetalleMecanica && totalServicios > 0 && (
              <div className="row"><span style={{ color: '#64748b' }}>Subtotal servicios</span><span style={{ fontWeight: 600 }}>{fmt$(totalServicios)}</span></div>
            )}
            {usaDetalleMecanica && totalProductos > 0 && (
              <div className="row"><span style={{ color: '#64748b' }}>Subtotal productos</span><span style={{ fontWeight: 600 }}>{fmt$(totalProductos)}</span></div>
            )}
            {!usaDetalleMecanica && (
              <div className="row"><span style={{ color: '#64748b' }}>Subtotal</span><span style={{ fontWeight: 600 }}>{fmt$(subtotal)}</span></div>
            )}
            {iva > 0 && <div className="row"><span style={{ color: '#64748b' }}>IVA</span><span style={{ fontWeight: 600 }}>{fmt$(iva)}</span></div>}
            <div className="row bold" style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
              <span>Total</span><span style={{ color: '#059669' }}>{fmt$(total)}</span>
            </div>
          </div>

          {factura.notas && (
            <div style={{ marginTop: 12, background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: '#475569' }}>
              <strong>Notas:</strong> {factura.notas}
            </div>
          )}
        </div>

        <div className="lc-modal-footer">
          <button className="lc-btn ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FORMULARIO EGRESO
═══════════════════════════════════════════════════════════ */

function FormEgreso({ empresa, onGuardado, onCancelar }) {
  const { mutate, loading, error } = useMutation();
  const [f, setF] = useState({
    concepto: '', categoria: 'otros', monto: '', metodo_pago: 'efectivo',
    proveedor: '', referencia: '', notas: '', fecha: hoy(),
  });

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.concepto.trim() || !f.monto || Number(f.monto) <= 0) return;
    try {
      const res = await mutate('/egresos', 'POST', { ...f, empresa_id: empresa, monto: Number(f.monto) });
      onGuardado(res);
    } catch { /* manejado en hook */ }
  };

  return (
    <div className="lc-form-card">
      <div className="lc-form-header">
        <h6>Registrar nuevo egreso</h6>
      </div>
      <div className="lc-form-body">
        <form onSubmit={submit}>
          <div className="lc-form-grid">
            <div className="lc-form-full">
              <label className="lc-label">Concepto *</label>
              <input className="lc-input" placeholder="Descripción del gasto" value={f.concepto} onChange={e => set('concepto', e.target.value)} required />
            </div>
            <div>
              <label className="lc-label">Categoría *</label>
              <select className="lc-select-f" value={f.categoria} onChange={e => set('categoria', e.target.value)}>
                {CATEGORIAS_EGRESO.map(c => <option key={c.valor} value={c.valor}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="lc-label">Monto (COP) *</label>
              <input className="lc-input" type="number" placeholder="0" min={1} value={f.monto} onChange={e => set('monto', e.target.value)} required />
            </div>
            <div>
              <label className="lc-label">Método de pago</label>
              <select className="lc-select-f" value={f.metodo_pago} onChange={e => set('metodo_pago', e.target.value)}>
                {METODOS_PAGO.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="lc-label">Fecha</label>
              <input className="lc-input" type="date" value={f.fecha} max={hoy()} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div>
              <label className="lc-label">N° Referencia / Soporte</label>
              <input className="lc-input" placeholder="Ej: INV-001" value={f.referencia} onChange={e => set('referencia', e.target.value)} />
            </div>
            <div>
              <label className="lc-label">Proveedor</label>
              <input className="lc-input" placeholder="Nombre del proveedor" value={f.proveedor} onChange={e => set('proveedor', e.target.value)} />
            </div>
            <div className="lc-form-full">
              <label className="lc-label">Notas</label>
              <input className="lc-input" placeholder="Información adicional (opcional)" value={f.notas} onChange={e => set('notas', e.target.value)} />
            </div>
          </div>
          {error && <div style={{ marginTop: 12, padding: '8px 14px', background: '#fee2e2', borderRadius: 10, fontSize: '0.82rem', color: '#dc2626' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="lc-btn ghost" onClick={onCancelar} disabled={loading}>Cancelar</button>
            <button type="submit" className="lc-btn danger" disabled={loading}>
              {loading ? 'Guardando…' : 'Registrar egreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB — LIBRO DIARIO
═══════════════════════════════════════════════════════════ */

function TabLibroDiario({ url }) {
  const { data, loading, error, refetch } = useFetch(url);
  const [busqueda,   setBusqueda  ] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const asientos = useMemo(() => {
    if (!data?.asientos) return [];
    let saldo = 0;
    return data.asientos.map(a => {
      saldo += a.tipo === 'ingreso' ? (a.monto ?? 0) : -(a.monto ?? 0);
      return { ...a, saldo };
    });
  }, [data]);

  const filtrados = useMemo(() => {
    let list = asientos;
    if (filtroTipo !== 'todos') list = list.filter(a => a.tipo === filtroTipo);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter(a =>
        (a.concepto ?? a.descripcion ?? '').toLowerCase().includes(q) ||
        (a.referencia ?? a.numero_factura ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [asientos, filtroTipo, busqueda]);

  const totIngr = filtrados.reduce((s, a) => a.tipo === 'ingreso' ? s + (a.monto ?? 0) : s, 0);
  const totEgr  = filtrados.reduce((s, a) => a.tipo === 'egreso'  ? s + (a.monto ?? 0) : s, 0);

  if (loading) return <Spinner />;
  if (error)   return (
    <div className="lc-empty">
      <span className="lc-empty-icon">⚠️</span>
      <p style={{ color: '#ef4444' }}>{error}</p>
      <button className="lc-btn outline" style={{ marginTop: 12 }} onClick={refetch}>Reintentar</button>
    </div>
  );

  return (
    <div className="lc-table-wrap">
      <div className="lc-table-toolbar">
        <input className="lc-search" placeholder="Buscar concepto, referencia…" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select className="lc-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="ingreso">Solo ingresos</option>
          <option value="egreso">Solo egresos</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>▲ {fmt$(totIngr)}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>▼ {fmt$(totEgr)}</span>
        <button className="lc-icon-btn" onClick={refetch} title="Actualizar">↻</button>
      </div>

      {filtrados.length === 0 ? (
        <div className="lc-empty">
          <span className="lc-empty-icon">📭</span>
          <p>No hay asientos en el período</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="lc-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Referencia</th>
                <th style={{ textAlign: 'right' }}>Ingreso</th>
                <th style={{ textAlign: 'right' }}>Egreso</th>
                <th style={{ textAlign: 'right' }}>Saldo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a, i) => {
                const anulado = a.estado === 'anulado' || a.estado === 'anulada';
                return (
                  <tr key={a.id ?? i} style={anulado ? { opacity: .45, textDecoration: 'line-through' } : {}}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{fmtFecha(a.fecha ?? a.created_at)}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{fmtHora(a.created_at ?? a.fecha)}</div>
                    </td>
                    <td><Badge tipo="tipo" estado={a.tipo} /></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.concepto ?? a.descripcion}</div>
                      <div style={{ marginTop: 2 }}>
                        <CatPill valor={a.tipo === 'ingreso' ? (a.modulo ?? 'general') : (a.categoria ?? 'otros')} tipo={a.tipo} />
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      <code>{a.referencia ?? a.numero_factura ?? '—'}</code>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                      {a.tipo === 'ingreso' ? fmt$(a.monto) : ''}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                      {a.tipo === 'egreso' ? fmt$(a.monto) : ''}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: a.saldo >= 0 ? '#059669' : '#dc2626' }}>
                      {fmt$(a.saldo)}
                    </td>
                    <td><Badge estado={a.estado ?? (a.tipo === 'ingreso' ? 'pagada' : 'activo')} /></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right', color: '#94a3b8' }}>
                  TOTALES — {filtrados.length} asientos
                </td>
                <td style={{ textAlign: 'right', color: '#059669' }}>{fmt$(totIngr)}</td>
                <td style={{ textAlign: 'right', color: '#dc2626' }}>{fmt$(totEgr)}</td>
                <td style={{ textAlign: 'right', color: totIngr - totEgr >= 0 ? '#059669' : '#dc2626' }}>
                  {fmt$(totIngr - totEgr)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB — INGRESOS (Facturas)
═══════════════════════════════════════════════════════════ */

function TabIngresos({ url }) {
  const { data, loading, error, refetch } = useFetch(url);
  const [busqueda,     setBusqueda    ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroModulo, setFiltroModulo] = useState('todos');
  const [facturaVer,   setFacturaVer  ] = useState(null);

  const facturas = useMemo(() => {
    let list = data?.facturas ?? [];
    if (filtroEstado !== 'todos') list = list.filter(f => f.estado === filtroEstado);
    if (filtroModulo !== 'todos') list = list.filter(f => f.modulo === filtroModulo);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter(f =>
        (f.numero_factura ?? '').toLowerCase().includes(q) ||
        (f.cliente_nombre ?? '').toLowerCase().includes(q) ||
        (f.cliente_documento ?? '').includes(q)
      );
    }
    return list;
  }, [data, filtroEstado, filtroModulo, busqueda]);

  const totalActivo = facturas
    .filter(f => f.estado !== 'anulada')
    .reduce((s, f) => s + (f.total ?? 0), 0);

  if (loading) return <Spinner />;
  if (error)   return (
    <div className="lc-empty">
      <span className="lc-empty-icon">⚠️</span>
      <p style={{ color: '#ef4444' }}>{error}</p>
      <button className="lc-btn outline" style={{ marginTop: 12 }} onClick={refetch}>Reintentar</button>
    </div>
  );

  return (
    <>
      <div className="lc-table-wrap">
        <div className="lc-table-toolbar">
          <input
            className="lc-search"
            placeholder="Buscar # factura, cliente, documento…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <select className="lc-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pagada">Pagada</option>
            <option value="pendiente">Pendiente</option>
            <option value="anulada">Anulada</option>
          </select>
          <select className="lc-select" value={filtroModulo} onChange={e => setFiltroModulo(e.target.value)}>
            <option value="todos">Todos los módulos</option>
            {MODULOS_INGRESO.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
          </select>
          <button className="lc-icon-btn" onClick={refetch} title="Actualizar">↻</button>
        </div>

        {facturas.length === 0 ? (
          <div className="lc-empty">
            <span className="lc-empty-icon">🧾</span>
            <p>No hay facturas en el período seleccionado</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="lc-table">
                <thead>
                  <tr>
                    <th># Factura</th>
                    <th>Cliente</th>
                    <th>Módulo</th>
                    <th>Método</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'right' }}>IVA</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'center' }}>Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f, i) => (
                    <tr key={f.id ?? i} style={f.estado === 'anulada' ? { opacity: .45 } : {}}>
                      <td style={{ fontWeight: 700, color: '#6366f1' }}>{f.numero_factura ?? `#${f.id}`}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{f.cliente_nombre ?? 'Consumidor final'}</div>
                        {f.cliente_documento && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{f.cliente_documento}</div>}
                      </td>
                      <td><CatPill valor={f.modulo ?? 'general'} tipo="ingreso" /></td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{f.metodo_pago ?? '—'}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>{fmt$(f.subtotal)}</td>
                      <td style={{ textAlign: 'right', color: '#94a3b8' }}>{fmt$(f.iva)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>{fmt$(f.total)}</td>
                      <td><Badge estado={f.estado} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="lc-btn outline"
                          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                          onClick={() => setFacturaVer(f)}
                          title="Ver factura"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'right', color: '#94a3b8' }}>
                      TOTAL — {facturas.filter(f => f.estado !== 'anulada').length} facturas activas
                    </td>
                    <td style={{ textAlign: 'right', color: '#059669' }}>{fmt$(totalActivo)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      {facturaVer && (
        <ModalFactura factura={facturaVer} onCerrar={() => setFacturaVer(null)} />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB — EGRESOS
═══════════════════════════════════════════════════════════ */

function TabEgresos({ url, empresa, puedeRegistrar, puedeAnular }) {
  const { data, loading, error, refetch } = useFetch(url);
  const [busqueda,      setBusqueda     ] = useState('');
  const [filtroCateg,   setFiltroCateg  ] = useState('todas');
  const [egresoDetalle, setEgresoDetalle] = useState(null);
  const [mostrarForm,   setMostrarForm  ] = useState(false);

  const egresos = useMemo(() => {
    let list = data?.egresos ?? [];
    if (filtroCateg !== 'todas') list = list.filter(e => e.categoria === filtroCateg);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter(e =>
        (e.concepto ?? '').toLowerCase().includes(q) ||
        (e.proveedor ?? '').toLowerCase().includes(q) ||
        (e.referencia ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, filtroCateg, busqueda]);

  const totalActivo = egresos
    .filter(e => (e.estado ?? 'activo') !== 'anulado')
    .reduce((s, e) => s + (e.monto ?? 0), 0);

  const handleGuardado = () => { setMostrarForm(false); refetch(); };
  const handleAnulado  = () => { setEgresoDetalle(null); refetch(); };

  if (loading && !data) return <Spinner />;

  return (
    <>
      {mostrarForm && (
        <FormEgreso empresa={empresa} onGuardado={handleGuardado} onCancelar={() => setMostrarForm(false)} />
      )}

      <div className="lc-table-wrap">
        <div className="lc-table-toolbar">
          <input className="lc-search" placeholder="Buscar concepto, proveedor, referencia…" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <select className="lc-select" value={filtroCateg} onChange={e => setFiltroCateg(e.target.value)}>
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS_EGRESO.map(c => <option key={c.valor} value={c.valor}>{c.label}</option>)}
          </select>
          <button className="lc-icon-btn" onClick={refetch} title="Actualizar">↻</button>
          {puedeRegistrar && (
            <button
              className={`lc-btn ${mostrarForm ? 'ghost' : 'danger'}`}
              style={{ marginLeft: 'auto' }}
              onClick={() => setMostrarForm(v => !v)}
            >
              {mostrarForm ? 'Cancelar' : '+ Nuevo egreso'}
            </button>
          )}
        </div>

        {error && (
          <div style={{ padding: '12px 20px', background: '#fef9c3', color: '#854d0e', fontSize: '0.82rem' }}>{error}</div>
        )}

        {egresos.length === 0 ? (
          <div className="lc-empty">
            <span className="lc-empty-icon">📭</span>
            <p>No hay egresos en el período</p>
            {puedeRegistrar && !mostrarForm && (
              <button className="lc-btn danger" style={{ marginTop: 12 }} onClick={() => setMostrarForm(true)}>
                + Registrar primer egreso
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="lc-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Método</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'center' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {egresos.map((e, i) => {
                  const anulado = (e.estado ?? 'activo') === 'anulado';
                  return (
                    <tr key={e.id ?? i} style={anulado ? { opacity: .45 } : {}}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{e.concepto}</div>
                        {e.notas && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{e.notas.slice(0, 45)}{e.notas.length > 45 ? '…' : ''}</div>}
                      </td>
                      <td><CatPill valor={e.categoria ?? 'otros'} tipo="egreso" /></td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{e.proveedor ?? '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{e.metodo_pago ?? '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>{fmt$(e.monto)}</td>
                      <td><Badge estado={e.estado ?? 'activo'} /></td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{fmtFecha(e.fecha)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="lc-btn outline"
                          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                          onClick={() => setEgresoDetalle(e)}
                          title="Ver detalle"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', color: '#94a3b8' }}>
                    TOTAL — {egresos.filter(e => (e.estado ?? 'activo') !== 'anulado').length} activos
                  </td>
                  <td style={{ textAlign: 'right', color: '#dc2626' }}>{fmt$(totalActivo)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {egresoDetalle && (
        <ModalEgreso
          egreso={egresoDetalle}
          onCerrar={() => setEgresoDetalle(null)}
          onAnulado={handleAnulado}
          puedeAnular={puedeAnular}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB — BALANCE
═══════════════════════════════════════════════════════════ */

function TabBalance({ url }) {
  const { data, loading, error, refetch } = useFetch(url);

  if (loading) return <Spinner />;
  if (error)   return (
    <div className="lc-empty">
      <span className="lc-empty-icon">⚠️</span>
      <p style={{ color: '#ef4444' }}>{error}</p>
      <button className="lc-btn outline" style={{ marginTop: 12 }} onClick={refetch}>Reintentar</button>
    </div>
  );

  const r        = data?.resumen ?? {};
  const ingresos = r.total_ingresos ?? 0;
  const egresos  = r.total_egresos  ?? 0;
  const utilidad = ingresos - egresos;
  const margen   = ingresos > 0 ? ((utilidad / ingresos) * 100).toFixed(1) : '0.0';
  const pctIngr  = ingresos + egresos > 0 ? (ingresos / (ingresos + egresos)) * 100 : 50;
  const pctEgr   = 100 - pctIngr;

  const porCategoria = r.por_categoria ?? [];
  const porModulo    = r.por_modulo    ?? [];
  const maxCat = Math.max(...porCategoria.map(c => c.monto), 1);
  const maxMod = Math.max(...porModulo.map(m => m.monto), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Barra principal */}
      <div className="lc-balance-bar-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
          <span style={{ color: '#059669' }}>Ingresos {pctIngr.toFixed(1)}%</span>
          <span style={{ color: '#dc2626' }}>Egresos {pctEgr.toFixed(1)}%</span>
        </div>
        <div className="lc-balance-bar">
          <div className="lc-bar-in"  style={{ width: `${pctIngr}%` }} />
          <div className="lc-bar-out" style={{ width: `${pctEgr}%`  }} />
        </div>
        <div className="lc-balance-nums">
          <div className="lc-balance-num" style={{ background: '#f0fdf4' }}>
            <div className="lbl">Ingresos</div>
            <div className="val" style={{ color: '#059669' }}>{fmt$(ingresos)}</div>
            <div className="sub">{r.cantidad_ingresos ?? 0} facturas</div>
          </div>
          <div className="lc-balance-num" style={{ background: '#fef2f2' }}>
            <div className="lbl">Egresos</div>
            <div className="val" style={{ color: '#dc2626' }}>{fmt$(egresos)}</div>
            <div className="sub">{r.cantidad_egresos ?? 0} registros</div>
          </div>
          <div className="lc-balance-num" style={{ background: utilidad >= 0 ? '#f0fdf4' : '#fef2f2' }}>
            <div className="lbl">Utilidad Neta</div>
            <div className="val" style={{ color: utilidad >= 0 ? '#059669' : '#dc2626' }}>{fmt$(utilidad)}</div>
            <div className="sub">Margen {margen}%</div>
          </div>
        </div>
      </div>

      {/* Desglose */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Egresos por categoría */}
        <div className="lc-balance-bar-wrap" style={{ margin: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 16 }}>Egresos por Categoría</div>
          {porCategoria.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>Sin egresos en el período</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...porCategoria].sort((a, b) => b.monto - a.monto).map(c => {
                const cat = catInfo(c.categoria);
                const pct = (c.monto / maxCat) * 100;
                const pctT = egresos > 0 ? ((c.monto / egresos) * 100).toFixed(1) : 0;
                return (
                  <div key={c.categoria}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 5 }}>
                      <span style={{ color: '#475569' }}>{cat.label}</span>
                      <span style={{ fontWeight: 700, color: cat.color }}>{fmt$(c.monto)} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({pctT}%)</span></span>
                    </div>
                    <div style={{ height: 6, borderRadius: 50, background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 50, transition: 'width .5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ingresos por módulo */}
        <div className="lc-balance-bar-wrap" style={{ margin: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 16 }}>Ingresos por Módulo</div>
          {porModulo.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>Sin ingresos en el período</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...porModulo].sort((a, b) => b.monto - a.monto).map(m => {
                const mod = modInfo(m.modulo);
                const pct = (m.monto / maxMod) * 100;
                const pctT = ingresos > 0 ? ((m.monto / ingresos) * 100).toFixed(1) : 0;
                return (
                  <div key={m.modulo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 5 }}>
                      <span style={{ color: '#475569' }}>{mod.label}</span>
                      <span style={{ fontWeight: 700, color: mod.color }}>{fmt$(m.monto)} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({pctT}%)</span></span>
                    </div>
                    <div style={{ height: 6, borderRadius: 50, background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: mod.color, borderRadius: 50, transition: 'width .5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* IVA */}
      {(r.total_iva ?? 0) > 0 && (
        <div className="lc-balance-bar-wrap" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>IVA recaudado en el período</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Base gravable: {fmt$(ingresos - (r.total_iva ?? 0))}</div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{fmt$(r.total_iva)}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */

const PERIODOS = [
  { id: 'hoy',    label: 'Hoy'         },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes',    label: 'Este mes'    },
  { id: 'custom', label: 'Personalizar'},
];

export default function LibroContable() {
  const { empresa } = getPayload();
  const { tienePermiso } = usePermisos();

  const puedeVerLibro   = tienePermiso('ver_libro_contable') || tienePermiso('admin');
  const puedeRegistrar  = tienePermiso('ver_registrar_egreso')   || tienePermiso('admin');
  const puedeAnularEgr  = tienePermiso('ver_anular_egreso')      || tienePermiso('admin');
  const puedeVerBalance = tienePermiso('ver_balance')        || tienePermiso('admin');

  const [periodo, setPeriodo] = useState('mes');
  const [desde,   setDesde  ] = useState(inicioMes);
  const [hasta,   setHasta  ] = useState(hoy);
  const [tab,     setTab    ] = useState('libro');

  const aplicarPeriodo = (p) => {
    setPeriodo(p);
    if (p !== 'custom') {
      const r = getRango(p);
      setDesde(r.desde);
      setHasta(r.hasta);
    }
  };

  const qs          = `empresa=${empresa}&desde=${desde}&hasta=${hasta}`;
  const urlResumen  = `${API}/libro/resumen?${qs}`;
  const urlAsientos = `${API}/libro/asientos?${qs}`;
  const urlFacturas = `${API}/facturas?${qs}`;
  const urlEgresos  = `${API}/egresos?${qs}`;

  const { data: resData, loading: resLoading } = useFetch(urlResumen);
  const r        = resData?.resumen ?? {};
  const ingresos = r.total_ingresos ?? 0;
  const egresos  = r.total_egresos  ?? 0;
  const utilidad = ingresos - egresos;
  const margen   = ingresos > 0 ? ((utilidad / ingresos) * 100).toFixed(1) : '0.0';

  const TABS = [
    { id: 'libro',    label: 'Libro Diario', visible: true              },
    { id: 'ingresos', label: 'Ingresos',     visible: true              },
    { id: 'egresos',  label: 'Egresos',      visible: true              },
    { id: 'balance',  label: 'Balance',      visible: puedeVerBalance   },
  ].filter(t => t.visible);

  // ── Acceso restringido ──
  if (!puedeVerLibro) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <Nav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
            <h4 style={{ fontWeight: 800, color: '#0f172a' }}>Acceso restringido</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Necesitas el permiso <code>ver_libro_contable</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{CSS}</style>
      <Nav />

      <div className="lc-wrap">
        {/* ── SELECTOR DE PERÍODO ── */}
        <div className="lc-period-bar">
          <span className="lc-period-label">Período</span>
          <div className="lc-period-btns">
            {PERIODOS.map(p => (
              <button
                key={p.id}
                className={`lc-period-btn ${periodo === p.id ? 'active' : ''}`}
                onClick={() => aplicarPeriodo(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {periodo === 'custom' ? (
            <div className="lc-date-range">
              <input
                type="date"
                className="lc-date-input"
                value={desde}
                max={hasta}
                onChange={e => setDesde(e.target.value)}
              />
              <span style={{ color: '#cbd5e1' }}>→</span>
              <input
                type="date"
                className="lc-date-input"
                value={hasta}
                min={desde}
                max={hoy()}
                onChange={e => setHasta(e.target.value)}
              />
            </div>
          ) : (
            <div className="lc-date-range">
              <i className="fas fa-calendar-alt" style={{ color: '#cbd5e1' }}></i>
              <span>{fmtFecha(desde)}</span>
              {desde !== hasta && <><span style={{ color: '#cbd5e1' }}>→</span><span>{fmtFecha(hasta)}</span></>}
            </div>
          )}
        </div>

        {/* ── KPI CARDS ── */}
        <div className="lc-kpi-row">
          <div className="lc-kpi green">
            <span className="lc-kpi-label">Total Ingresos</span>
            <span className="lc-kpi-value">{resLoading ? '…' : fmt$(ingresos)}</span>
            <span className="lc-kpi-sub">{r.cantidad_ingresos ?? 0} facturas pagadas</span>
          </div>
          <div className="lc-kpi red">
            <span className="lc-kpi-label">Total Egresos</span>
            <span className="lc-kpi-value">{resLoading ? '…' : fmt$(egresos)}</span>
            <span className="lc-kpi-sub">{r.cantidad_egresos ?? 0} registros activos</span>
          </div>
          <div className={`lc-kpi ${utilidad >= 0 ? 'blue' : 'red'}`}>
            <span className="lc-kpi-label">Utilidad Neta</span>
            <span className="lc-kpi-value">{resLoading ? '…' : fmt$(utilidad)}</span>
            <span className="lc-kpi-sub">Margen {margen}%</span>
          </div>
          <div className="lc-kpi purple">
            <span className="lc-kpi-label">IVA Recaudado</span>
            <span className="lc-kpi-value">{resLoading ? '…' : fmt$(r.total_iva ?? 0)}</span>
            <span className="lc-kpi-sub">IVA de facturas activas</span>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="lc-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`lc-tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── CONTENIDO ── */}
        <div className="lc-content">
          {tab === 'libro'    && <TabLibroDiario url={urlAsientos} />}
          {tab === 'ingresos' && <TabIngresos    url={urlFacturas} />}
          {tab === 'egresos'  && (
            <TabEgresos
              url={urlEgresos}
              empresa={empresa}
              puedeRegistrar={puedeRegistrar}
              puedeAnular={puedeAnularEgr}
            />
          )}
          {tab === 'balance' && puedeVerBalance && <TabBalance url={urlResumen} />}
          {tab === 'balance' && !puedeVerBalance && (
            <div className="lc-empty">
              <span className="lc-empty-icon">🔒</span>
              <p>Necesitas el permiso <code>ver_balance</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
