import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3001/v1';

// ── Utilidades ───────────────────────────────────────────────────────────────
const formatMoney = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);

const formatHora = (iso) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

const formatFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const getPayload = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? JSON.parse(atob(token.split('.')[1])) : {};
  } catch {
    return {};
  }
};

// ── Constantes ───────────────────────────────────────────────────────────────
const ESTADO_BADGE = {
  pagada:    { cls: 'bg-success',          label: 'Pagada' },
  pendiente: { cls: 'bg-warning text-dark', label: 'Pendiente' },
  anulada:   { cls: 'bg-danger',            label: 'Anulada' },
};

const METODO = {
  efectivo:      { icon: 'bi-cash-coin',          label: 'Efectivo' },
  tarjeta:       { icon: 'bi-credit-card-2-front', label: 'Tarjeta' },
  transferencia: { icon: 'bi-bank',               label: 'Transferencia' },
  credito:       { icon: 'bi-clock-history',       label: 'Crédito' },
};

const MODULO_BADGE = {
  pos:         { cls: 'text-bg-primary',   label: 'POS' },
  mecanica:    { cls: 'text-bg-warning',   label: 'Mecánica' },
  restaurante: { cls: 'text-bg-success',   label: 'Restaurante' },
  general:     { cls: 'text-bg-secondary', label: 'General' },
};

// ── Hook useFetch ────────────────────────────────────────────────────────────
const useFetch = (url, interval = null) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    if (interval) {
      const id = setInterval(fetchData, interval);
      return () => clearInterval(id);
    }
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
};

// ── Tarjeta resumen ──────────────────────────────────────────────────────────
const TarjetaResumen = ({ titulo, valor, icono, color, sub }) => (
  <div className="col-md-3 col-sm-6">
    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: `4px solid var(--bs-${color})` }}>
      <div className="card-body d-flex align-items-center gap-3">
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center text-${color}`}
          style={{ width: 50, height: 50, background: `rgba(var(--bs-${color}-rgb), 0.12)`, fontSize: 22, flexShrink: 0 }}
        >
          <i className={`bi ${icono}`}></i>
        </div>
        <div className="overflow-hidden">
          <div className="text-muted small text-truncate">{titulo}</div>
          <div className="fw-bold fs-5 text-truncate">{valor}</div>
          {sub && <div className="text-muted" style={{ fontSize: 11 }}>{sub}</div>}
        </div>
      </div>
    </div>
  </div>
);

// ── Modal detalle factura ────────────────────────────────────────────────────
const FacturaDetalle = ({ factura, puedeAnular, onCerrar, onAnulada }) => {
  const [anulando,    setAnulando]    = useState(false);
  const [errorAnular, setErrorAnular] = useState(null);
  const [confirmar,   setConfirmar]   = useState(false);

  const handleAnular = async () => {
    setAnulando(true);
    setErrorAnular(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/facturas/${factura._id}/anular`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.mensaje || 'Error al anular');
      }
      onAnulada();
    } catch (err) {
      setErrorAnular(err.message);
    } finally {
      setAnulando(false);
      setConfirmar(false);
    }
  };

  const estado  = ESTADO_BADGE[factura.estado]    || ESTADO_BADGE.pagada;
  const metodo  = METODO[factura.metodoPago]       || METODO.efectivo;
  const modulo  = MODULO_BADGE[factura.modulo]     || MODULO_BADGE.general;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCerrar} style={{ zIndex: 1040 }} />
      <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg">

            {/* Header */}
            <div className="modal-header border-0 pb-0">
              <div>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-receipt me-2 text-primary"></i>
                  {factura.numero}
                </h5>
                <p className="text-muted small mb-0">
                  {formatFecha(factura.createdAt)}&nbsp;·&nbsp;
                  <span className={`badge ${modulo.cls}`}>{modulo.label}</span>
                  &nbsp;
                  <span className={`badge ${estado.cls}`}>{estado.label}</span>
                </p>
              </div>
              <button className="btn-close" onClick={onCerrar}></button>
            </div>

            <div className="modal-body pt-2">
              {/* Info cliente + pago */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="p-3 rounded-3 bg-light h-100">
                    <div className="small text-muted fw-semibold text-uppercase mb-2" style={{ letterSpacing: 1 }}>
                      Cliente
                    </div>
                    <div className="fw-bold">{factura.cliente?.nombre}</div>
                    {factura.cliente?.documento && <div className="small text-muted">Doc: {factura.cliente.documento}</div>}
                    {factura.cliente?.telefono  && <div className="small text-muted"><i className="bi bi-telephone me-1"></i>{factura.cliente.telefono}</div>}
                    {factura.cliente?.email     && <div className="small text-muted"><i className="bi bi-envelope me-1"></i>{factura.cliente.email}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-3 bg-light h-100">
                    <div className="small text-muted fw-semibold text-uppercase mb-2" style={{ letterSpacing: 1 }}>
                      Pago
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className={`bi ${metodo.icon} text-primary`}></i>
                      <span className="fw-medium">{metodo.label}</span>
                    </div>
                    {factura.creadoPor && (
                      <div className="small text-muted">
                        <i className="bi bi-person me-1"></i>Generado por: {factura.creadoPor}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabla detalles */}
              <div className="small text-muted fw-semibold text-uppercase mb-2" style={{ letterSpacing: 1 }}>
                Productos / Servicios
              </div>
              <div className="table-responsive mb-3">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Descripción</th>
                      <th className="text-center" style={{ width: 70 }}>Cant.</th>
                      <th className="text-end"    style={{ width: 120 }}>P. Unit.</th>
                      <th className="text-end"    style={{ width: 120 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(factura.detalles || []).map((d, i) => (
                      <tr key={i}>
                        <td>{d.descripcion}</td>
                        <td className="text-center">{d.cantidad}</td>
                        <td className="text-end">{formatMoney(d.precioUnit)}</td>
                        <td className="text-end fw-medium">{formatMoney(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="row justify-content-end">
                <div className="col-md-5">
                  <div className="p-3 rounded-3 bg-light">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatMoney(factura.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">IVA ({factura.impuesto || 0}%)</span>
                      <span>{formatMoney(factura.impuesto > 0 ? factura.totalImpuesto : 0)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span className="text-primary fs-5">{formatMoney(factura.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {factura.notas && (
                <div className="mt-3 p-3 rounded-3 border border-warning-subtle bg-warning-subtle">
                  <div className="small text-muted mb-1 fw-semibold">
                    <i className="bi bi-sticky me-1"></i>Notas
                  </div>
                  <div className="small">{factura.notas}</div>
                </div>
              )}

              {errorAnular && (
                <div className="alert alert-danger small mt-3 mb-0">
                  <i className="bi bi-exclamation-circle me-1"></i>{errorAnular}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 pt-0 flex-wrap gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
                <i className="bi bi-printer me-1"></i>Imprimir
              </button>

              {puedeAnular && factura.estado !== 'anulada' && (
                confirmar ? (
                  <div className="d-flex gap-2 align-items-center">
                    <span className="text-danger small">¿Confirmar anulación?</span>
                    <button className="btn btn-danger btn-sm" onClick={handleAnular} disabled={anulando}>
                      {anulando
                        ? <span className="spinner-border spinner-border-sm"></span>
                        : 'Sí, anular'}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmar(false)}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-outline-danger btn-sm" onClick={() => setConfirmar(true)}>
                    <i className="bi bi-x-circle me-1"></i>Anular
                  </button>
                )
              )}

              <button className="btn btn-primary btn-sm ms-auto" onClick={onCerrar}>
                Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

// ── Fila de la tabla ─────────────────────────────────────────────────────────
const FilaFactura = ({ factura, onVer }) => {
  const estado = ESTADO_BADGE[factura.estado]    || ESTADO_BADGE.pagada;
  const metodo = METODO[factura.metodoPago]       || METODO.efectivo;
  const modulo = MODULO_BADGE[factura.modulo]     || MODULO_BADGE.general;

  return (
    <tr className="align-middle">
      <td className="fw-semibold text-primary">{factura.numero}</td>
      <td>
        <div className="fw-medium">{factura.cliente?.nombre}</div>
        <div className="text-muted small">{factura.cliente?.documento || '—'}</div>
      </td>
      <td><span className={`badge ${modulo.cls}`}>{modulo.label}</span></td>
      <td>
        <i className={`bi ${metodo.icon} me-1 text-secondary`}></i>
        <span className="small">{metodo.label}</span>
      </td>
      <td className="fw-bold">{formatMoney(factura.total)}</td>
      <td><span className={`badge ${estado.cls}`}>{estado.label}</span></td>
      <td className="text-muted small">{formatHora(factura.createdAt)}</td>
      <td>
        <button className="btn btn-sm btn-outline-primary" onClick={() => onVer(factura)} title="Ver detalle">
          <i className="bi bi-eye"></i>
        </button>
      </td>
    </tr>
  );
};

// ── MÓDULO PRINCIPAL ─────────────────────────────────────────────────────────
const ModuloFacturacion = () => {
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [filtroEstado,        setFiltroEstado]        = useState('todos');
  const [filtroModulo,        setFiltroModulo]        = useState('todos');
  const [filtroMetodo,        setFiltroMetodo]        = useState('todos');
  const [busqueda,            setBusqueda]            = useState('');

  const payload     = getPayload();
  const empresa     = payload.empresa  || 'demo';
  const permisos    = payload.permisos || [];
  const puedeAnular = permisos.includes('anular_facturas') || permisos.includes('admin');

  const { data: facturas, loading, error, refetch } = useFetch(
    `${API}/facturas/hoy?empresa=${empresa}`,
    30000
  );

  const { data: resumen, refetch: refetchResumen } = useFetch(
    `${API}/facturas/resumen-hoy?empresa=${empresa}`,
    30000
  );

  const handleRefresh = () => { refetch(); refetchResumen(); };

  const handleAnulada = () => {
    setFacturaSeleccionada(null);
    handleRefresh();
  };

  // Filtrado
  const facturasFiltradas = (facturas || []).filter((f) => {
    const ok_estado  = filtroEstado === 'todos' || f.estado === filtroEstado;
    const ok_modulo  = filtroModulo === 'todos' || f.modulo === filtroModulo;
    const ok_metodo  = filtroMetodo === 'todos' || f.metodoPago === filtroMetodo;
    const ok_busq    = !busqueda
      || f.numero.toLowerCase().includes(busqueda.toLowerCase())
      || f.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      || f.cliente?.documento?.includes(busqueda);
    return ok_estado && ok_modulo && ok_metodo && ok_busq;
  });

  const totalFiltrado = facturasFiltradas
    .filter((f) => f.estado !== 'anulada')
    .reduce((acc, f) => acc + f.total, 0);

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="p-3 p-md-4">

      {/* ── Encabezado ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-receipt-cutoff me-2 text-primary"></i>
            Facturación del Día
          </h4>
          <p className="text-muted small mb-0 text-capitalize">{fechaHoy}</p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>
          <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>

      {/* ── Tarjetas resumen ── */}
      <div className="row g-3 mb-4">
        <TarjetaResumen
          titulo="Total Facturado"
          valor={formatMoney(resumen?.totalFacturado)}
          icono="bi-cash-stack"
          color="primary"
          sub={`${resumen?.cantidadFacturas || 0} facturas`}
        />
        <TarjetaResumen
          titulo="Efectivo"
          valor={formatMoney(resumen?.efectivo)}
          icono="bi-cash-coin"
          color="success"
        />
        <TarjetaResumen
          titulo="Tarjeta / Transferencia"
          valor={formatMoney((resumen?.tarjeta || 0) + (resumen?.transferencia || 0))}
          icono="bi-credit-card-2-front"
          color="info"
        />
        <TarjetaResumen
          titulo="Impuestos"
          valor={formatMoney(resumen?.totalImpuestos)}
          icono="bi-percent"
          color="warning"
        />
      </div>

      {/* ── Filtros ── */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="N° factura, cliente o documento..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button className="btn btn-outline-secondary" onClick={() => setBusqueda('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="pagada">Pagada</option>
                <option value="pendiente">Pendiente</option>
                <option value="anulada">Anulada</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filtroModulo} onChange={(e) => setFiltroModulo(e.target.value)}>
                <option value="todos">Todos los módulos</option>
                <option value="pos">POS</option>
                <option value="mecanica">Mecánica</option>
                <option value="restaurante">Restaurante</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)}>
                <option value="todos">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <span className="text-muted small">
                {facturasFiltradas.length} resultado(s) ·{' '}
                <span className="fw-semibold text-dark">{formatMoney(totalFiltrado)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Cargando facturas...
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">
              <i className="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
              Error al cargar: {error}
              <div className="mt-2">
                <button className="btn btn-sm btn-outline-danger" onClick={refetch}>
                  Reintentar
                </button>
              </div>
            </div>
          ) : facturasFiltradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
              {(facturas || []).length === 0
                ? 'No hay facturas generadas hoy'
                : 'Sin resultados para los filtros aplicados'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>N° Factura</th>
                    <th>Cliente</th>
                    <th>Módulo</th>
                    <th>Método de Pago</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Hora</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map((f) => (
                    <FilaFactura
                      key={f._id}
                      factura={f}
                      onVer={setFacturaSeleccionada}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal detalle ── */}
      {facturaSeleccionada && (
        <FacturaDetalle
          factura={facturaSeleccionada}
          puedeAnular={puedeAnular}
          onCerrar={() => setFacturaSeleccionada(null)}
          onAnulada={handleAnulada}
        />
      )}
    </div>
  );
};

export default ModuloFacturacion;