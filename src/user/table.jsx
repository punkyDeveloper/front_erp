import { useEffect, useState } from 'react';
import UpdateUser from './update';
import DeleteUser from './delete';

const tableCSS = `
  .trab-table-wrap {
    overflow-x: auto;
    width: 100%;
  }

  .trab-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
    color: #374151;
  }

  .trab-table thead tr {
    background: #f8fafc;
    border-bottom: 2px solid #e5e7eb;
  }

  .trab-table thead th {
    padding: 13px 18px;
    text-align: left;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9ca3af;
    white-space: nowrap;
  }

  .trab-table tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.15s;
  }

  .trab-table tbody tr:hover {
    background: #f8fafc;
  }

  .trab-table tbody td {
    padding: 13px 18px;
    vertical-align: middle;
    white-space: nowrap;
  }

  .trab-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
    margin-right: 10px;
  }

  .trab-name-cell {
    display: flex;
    align-items: center;
  }

  .trab-name-cell .trab-full-name {
    font-weight: 600;
    color: #1e1e2d;
    display: block;
  }

  .trab-name-cell .trab-username {
    font-size: 0.78rem;
    color: #9ca3af;
    display: block;
  }

  .trab-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.76rem;
    font-weight: 600;
  }

  .trab-badge.activo {
    background: rgba(16,185,129,0.1);
    color: #059669;
  }

  .trab-badge.inactivo {
    background: rgba(239,68,68,0.1);
    color: #dc2626;
  }

  .trab-badge.dot::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    background: currentColor;
  }

  .trab-rol-badge {
    display: inline-block;
    padding: 3px 10px;
    background: rgba(99,102,241,0.1);
    color: #4f46e5;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .trab-actions {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .trab-empty {
    text-align: center;
    padding: 48px 20px;
    color: #9ca3af;
  }

  .trab-empty i {
    font-size: 2.5rem;
    margin-bottom: 12px;
    color: #d1d5db;
  }

  .trab-empty p {
    margin: 0;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .trab-table thead th:nth-child(n+4) { display: none; }
    .trab-table tbody td:nth-child(n+4)  { display: none; }
  }
`;

function TablaTrabajadores({ onUpdated }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': 'mi_clave_secreta_12345'
        }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUsuarios(data);
    } catch {
      console.error('Error al cargar trabajadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleRefresh = () => {
    fetchUsuarios();
    if (onUpdated) onUpdated();
  };

  const getInitials = (nombre, apellido) => {
    const n = (nombre || '?')[0].toUpperCase();
    const a = (apellido || '')[0]?.toUpperCase() || '';
    return n + a;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getRolNombre = (rol) => {
    if (!rol) return 'Sin rol';
    if (typeof rol === 'object') return rol.nombre || rol.name || rol.rol || 'Sin rol';
    return rol;
  };

  return (
    <>
      <style>{tableCSS}</style>
      <div className="trab-table-wrap">
        {loading ? (
          <div className="trab-empty">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando trabajadores...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="trab-empty">
            <i className="fas fa-users-slash"></i>
            <p>No hay trabajadores registrados aún.</p>
          </div>
        ) : (
          <table className="trab-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Trabajador</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={u._id || i}>
                  <td style={{ color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                  <td>
                    <div className="trab-name-cell">
                      <div className="trab-avatar">{getInitials(u.nombre, u.apellido)}</div>
                      <div>
                        <span className="trab-full-name">{u.nombre || '—'} {u.apellido || ''}</span>
                        <span className="trab-username">@{u.user || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{u.email || '—'}</td>
                  <td>
                    <span className="trab-rol-badge">{getRolNombre(u.rol)}</span>
                  </td>
                  <td>
                    <span className={`trab-badge dot ${u.estado ? 'activo' : 'inactivo'}`}>
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ color: '#9ca3af' }}>{formatFecha(u.createdAt || u.fecha_creacion)}</td>
                  <td>
                    <div className="trab-actions">
                      <UpdateUser userId={u._id} usuario={u} onUpdated={handleRefresh} />
                      <DeleteUser userId={u._id} usuario={u} onUpdated={handleRefresh} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default TablaTrabajadores;
