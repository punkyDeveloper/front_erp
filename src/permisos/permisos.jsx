import { useEffect, useState, useCallback } from 'react';
import Nav from '../assets/nav/nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container, Button, Modal, Form, Table,
  Badge, Pagination, Spinner, Alert
} from 'react-bootstrap';

// ─── CONFIG ────────────────────────────────────────────────
const API_URL = `${process.env.REACT_APP_API_URL}/permisos`;
const API_KEY = 'mi_clave_secreta_12345';
const ACCIONES_DISPONIBLES = ['Ver', 'Crear', 'Editar', 'Eliminar'];
const PAGE_OPTIONS = [10, 20, 50];

const accionBadge = {
  Ver: 'info',
  Crear: 'success',
  Editar: 'warning',
  Eliminar: 'danger',
};

// ─── STYLES ────────────────────────────────────────────────
const customStyles = `
  .permisos-page {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f4f6f9;
    min-height: 100vh;
  }

  .permisos-header {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    color: #fff;
    padding: 28px 32px 24px;
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(30, 41, 59, 0.15);
  }

  .permisos-header h3 {
    font-weight: 700;
    font-size: 1.5rem;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .permisos-header p {
    margin: 4px 0 0;
    opacity: 0.7;
    font-size: 0.875rem;
  }

  .stat-card {
    background: #fff;
    border: 1px solid #e8ecf1;
    border-radius: 12px;
    padding: 18px 20px;
    text-align: center;
    transition: box-shadow 0.2s;
  }

  .stat-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }

  .stat-card .stat-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
  }

  .stat-card .stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
    font-weight: 600;
    margin-top: 6px;
  }

  .table-container {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e8ecf1;
    overflow: hidden;
  }

  .table-container .table {
    margin: 0;
    font-size: 0.9rem;
  }

  .table-container .table thead th {
    background: #f8fafc;
    border-bottom: 2px solid #e8ecf1;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    font-weight: 700;
    padding: 14px 16px;
    white-space: nowrap;
  }

  .table-container .table tbody td {
    padding: 14px 16px;
    vertical-align: middle;
    border-color: #f1f5f9;
    color: #334155;
  }

  .table-container .table tbody tr {
    transition: background 0.15s;
  }

  .table-container .table tbody tr:hover {
    background: #f8fafc;
  }

  .search-input {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 10px 16px 10px 40px;
    font-size: 0.9rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") 14px center no-repeat;
  }

  .search-input:focus {
    border-color: #475569;
    box-shadow: 0 0 0 3px rgba(71, 85, 105, 0.1);
  }

  .btn-primary-custom {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: -0.01em;
    transition: opacity 0.2s, transform 0.15s;
  }

  .btn-primary-custom:hover {
    opacity: 0.9;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  .btn-primary-custom:active {
    transform: scale(0.97);
  }

  .modal-custom .modal-content {
    border: none;
    border-radius: 16px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.15);
  }

  .modal-custom .modal-header {
    border-bottom: 1px solid #f1f5f9;
    padding: 20px 24px;
  }

  .modal-custom .modal-title {
    font-weight: 700;
    font-size: 1.15rem;
    color: #1e293b;
  }

  .modal-custom .modal-body {
    padding: 24px;
  }

  .modal-custom .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 16px 24px;
  }

  .accion-radio-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .accion-radio-btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
    transition: all 0.2s;
    user-select: none;
  }

  .accion-radio-btn:hover {
    border-color: #94a3b8;
    background: #f8fafc;
  }

  .accion-radio-btn.active {
    border-color: #1e293b;
    background: #1e293b;
    color: #fff;
  }

  .nombre-preview {
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 0.85rem;
    color: #475569;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .empty-state {
    padding: 48px 20px;
    text-align: center;
    color: #94a3b8;
  }

  .empty-state .icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-top: 1px solid #f1f5f9;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.85rem;
    color: #64748b;
  }

  .action-btns .btn {
    padding: 4px 10px;
    font-size: 0.8rem;
    border-radius: 6px;
  }

  @media (max-width: 768px) {
    .permisos-header {
      padding: 20px;
      border-radius: 12px;
    }
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .toolbar-row {
      flex-direction: column !important;
    }
    .table-responsive-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .table-responsive-wrapper table {
      min-width: 600px;
    }
    .pagination-bar {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
    }
    .accion-radio-group {
      flex-direction: column;
    }
  }
`;

// ─── HELPERS ───────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-api-key': API_KEY,
  };
};

// ─── COMPONENT ─────────────────────────────────────────────
const CrearPermisos = () => {
  // Data
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [modulo, setModulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [accionSeleccionada, setAccionSeleccionada] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Delete modal
  const [eliminandoPermiso, setEliminandoPermiso] = useState(null);

  // Filtros y paginación
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ─── FETCH ─────────────────────────────────────────────
  const fetchPermisos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, { headers: getHeaders() });
      if (!response.ok) throw new Error('Error al obtener permisos');
      const data = await response.json();
      setPermisos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setPermisos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermisos(); }, [fetchPermisos]);

  // ─── FILTRADO Y PAGINACIÓN ─────────────────────────────
  const permisosFiltrados = permisos.filter((p) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.modulo?.toLowerCase().includes(q) ||
      p.accion?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(permisosFiltrados.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginados = permisosFiltrados.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );
  const startRecord = permisosFiltrados.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(safePage * rowsPerPage, permisosFiltrados.length);

  useEffect(() => { setCurrentPage(1); }, [busqueda, rowsPerPage]);

  // ─── STATS ─────────────────────────────────────────────
  const stats = {
    total: permisos.length,
    ver: permisos.filter((p) => p.accion === 'Ver').length,
    crear: permisos.filter((p) => p.accion === 'Crear').length,
    editar: permisos.filter((p) => p.accion === 'Editar').length,
    eliminar: permisos.filter((p) => p.accion === 'Eliminar').length,
  };

  // ─── MODAL ─────────────────────────────────────────────
  const nombreGenerado =
    accionSeleccionada && modulo
      ? `${accionSeleccionada.toLowerCase()}_${modulo.toLowerCase().replace(/\s+/g, '_')}`
      : '';

  const abrirCrear = () => {
    setEditandoId(null);
    setModulo('');
    setDescripcion('');
    setAccionSeleccionada('');
    setMostrarModal(true);
  };

  const abrirEditar = (permiso) => {
    setEditandoId(permiso._id);
    setModulo(permiso.modulo || '');
    setDescripcion(permiso.descripcion || '');
    setAccionSeleccionada(permiso.accion || '');
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEditandoId(null);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ─── GUARDAR (crear / editar) ──────────────────────────
  const guardarPermiso = async () => {
    if (!modulo || !descripcion || !accionSeleccionada) {
      setError('Completa todos los campos antes de guardar.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const payload = {
      nombre: nombreGenerado,
      modulo: modulo.toLowerCase().trim(),
      descripcion: descripcion.trim(),
      accion: accionSeleccionada,
      activo: true,
    };

    try {
      setGuardando(true);
      const isEdit = !!editandoId;
      const url = isEdit ? `${API_URL}/${editandoId}` : API_URL;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || 'Error en el servidor');
      }

      showSuccess(isEdit ? 'Permiso actualizado exitosamente' : 'Permiso creado exitosamente');
      cerrarModal();
      fetchPermisos();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setGuardando(false);
    }
  };

  // ─── ELIMINAR ──────────────────────────────────────────
  const confirmarEliminar = async () => {
    if (!eliminandoPermiso) return;
    try {
      const response = await fetch(`${API_URL}/${eliminandoPermiso._id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error('Error al eliminar');

      showSuccess('Permiso eliminado');
      setEliminandoPermiso(null);
      fetchPermisos();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
      setEliminandoPermiso(null);
    }
  };

  // ─── RENDER ────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <style>{customStyles}</style>
      <Nav />

      <div className="permisos-page" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <Container fluid className="px-lg-4" style={{ maxWidth: 1100 }}>

          {/* Alerts */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}
              style={{ borderRadius: 10, fontSize: '0.9rem' }}>
              {error}
            </Alert>
          )}
          {successMsg && (
            <Alert variant="success" dismissible onClose={() => setSuccessMsg('')}
              style={{ borderRadius: 10, fontSize: '0.9rem' }}>
              ✓ {successMsg}
            </Alert>
          )}

          {/* HEADER */}
          <div className="permisos-header d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3>Gestión de Permisos</h3>
              <p className="mb-0">Administra los permisos de acceso al sistema</p>
            </div>
            <Button className="btn-primary-custom" onClick={abrirCrear}>
              + Nuevo Permiso
            </Button>
          </div>

          {/* STATS */}
          <div className="stats-grid mb-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
          }}>
            {[
              { label: 'Total', value: stats.total, color: '#1e293b' },
              { label: 'Ver', value: stats.ver, color: '#0ea5e9' },
              { label: 'Crear', value: stats.crear, color: '#22c55e' },
              { label: 'Editar / Eliminar', value: stats.editar + stats.eliminar, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* TOOLBAR */}
          <div className="toolbar-row d-flex justify-content-between align-items-center mb-3 gap-3"
            style={{ flexWrap: 'wrap' }}>
            <input
              className="search-input form-control"
              style={{ maxWidth: 360 }}
              placeholder="Buscar por nombre, módulo, acción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#64748b' }}>
              <span>Mostrar</span>
              <Form.Select
                size="sm"
                style={{ width: 'auto', borderRadius: 8, fontSize: '0.85rem' }}
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                {PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Form.Select>
              <span>por página</span>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            <div className="table-responsive-wrapper">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Nombre</th>
                    <th>Módulo</th>
                    <th>Acción</th>
                    <th>Descripción</th>
                    <th style={{ width: 120, textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Cargando permisos...
                      </td>
                    </tr>
                  ) : paginados.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <div className="icon">🔐</div>
                          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#475569' }}>
                            {busqueda ? 'Sin resultados' : 'No hay permisos aún'}
                          </div>
                          <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                            {busqueda
                              ? 'Intenta con otra búsqueda'
                              : 'Crea el primer permiso para comenzar'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginados.map((permiso, index) => (
                      <tr key={permiso._id || index}>
                        <td style={{ color: '#94a3b8', fontWeight: 600 }}>
                          {startRecord + index}
                        </td>
                        <td>
                          <code style={{
                            background: '#f1f5f9',
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#334155',
                          }}>
                            {permiso.nombre}
                          </code>
                        </td>
                        <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {permiso.modulo}
                        </td>
                        <td>
                          <Badge
                            bg={accionBadge[permiso.accion] || 'secondary'}
                            style={{ fontSize: '0.78rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6 }}
                          >
                            {permiso.accion}
                          </Badge>
                        </td>
                        <td style={{ color: '#64748b', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {permiso.descripcion}
                        </td>
                        <td className="text-center action-btns">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-1"
                            title="Editar"
                            onClick={() => abrirEditar(permiso)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Eliminar"
                            onClick={() => setEliminandoPermiso(permiso)}
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* PAGINATION BAR */}
            {!loading && permisosFiltrados.length > 0 && (
              <div className="pagination-bar">
                <span>
                  {startRecord}–{endRecord} de {permisosFiltrados.length} registros
                </span>

                <Pagination size="sm" className="mb-0">
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={safePage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                  />
                  {(() => {
                    const pages = [];
                    let start = Math.max(1, safePage - 2);
                    let end = Math.min(totalPages, start + 4);
                    if (end - start < 4) start = Math.max(1, end - 4);
                    for (let i = start; i <= end; i++) pages.push(i);
                    return pages.map((p) => (
                      <Pagination.Item
                        key={p}
                        active={p === safePage}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Pagination.Item>
                    ));
                  })()}
                  <Pagination.Next
                    onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                    disabled={safePage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safePage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </div>

        </Container>
      </div>

      {/* ─── MODAL CREAR / EDITAR ─── */}
      <Modal show={mostrarModal} onHide={cerrarModal} centered className="modal-custom">
        <Modal.Header closeButton>
          <Modal.Title>
            {editandoId ? '✏️ Editar Permiso' : '➕ Crear Permiso'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>
                Módulo
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: productos, usuarios, ventas"
                value={modulo}
                onChange={(e) => setModulo(e.target.value)}
                style={{ borderRadius: 10, padding: '10px 14px' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>
                Acción
              </Form.Label>
              <div className="accion-radio-group">
                {ACCIONES_DISPONIBLES.map((accion) => (
                  <div
                    key={accion}
                    className={`accion-radio-btn ${accionSeleccionada === accion ? 'active' : ''}`}
                    onClick={() => setAccionSeleccionada(accion)}
                  >
                    {accion}
                  </div>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>
                Nombre del permiso
                <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6 }}>(auto-generado)</span>
              </Form.Label>
              <div className="nombre-preview">
                {nombreGenerado || 'accion_modulo'}
              </div>
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>
                Descripción
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Describe brevemente qué permite este permiso"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ borderRadius: 10, padding: '10px 14px', resize: 'vertical' }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={cerrarModal} style={{ borderRadius: 10, fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            className="btn-primary-custom"
            onClick={guardarPermiso}
            disabled={!modulo || !descripcion || !accionSeleccionada || guardando}
          >
            {guardando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              editandoId ? 'Guardar cambios' : 'Crear permiso'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ─── MODAL ELIMINAR ─── */}
      <Modal show={!!eliminandoPermiso} onHide={() => setEliminandoPermiso(null)} centered size="sm" className="modal-custom">
        <Modal.Body className="text-center py-4">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
          <h5 style={{ fontWeight: 700, color: '#1e293b' }}>¿Eliminar permiso?</h5>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '8px 0 4px' }}>
            <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>
              {eliminandoPermiso?.nombre}
            </code>
          </p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Esta acción no se puede deshacer.
          </p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button variant="light" onClick={() => setEliminandoPermiso(null)}
              style={{ borderRadius: 10, fontWeight: 600 }}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarEliminar}
              style={{ borderRadius: 10, fontWeight: 600 }}>
              Sí, eliminar
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default CrearPermisos;