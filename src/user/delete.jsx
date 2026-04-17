import { useState } from 'react';

const deleteCSS = `
  .del-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: rgba(239,68,68,0.1);
    color: #dc2626;
    transition: all 0.2s;
  }

  .del-btn:hover { background: rgba(239,68,68,0.2); }

  .del-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: delFade 0.2s ease;
    padding: 16px;
  }

  @keyframes delFade { from { opacity:0; } to { opacity:1; } }

  .del-modal {
    background: #fff;
    border-radius: 16px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    overflow: hidden;
    animation: delSlide 0.25s ease;
  }

  @keyframes delSlide {
    from { transform: translateY(16px); opacity:0; }
    to   { transform: translateY(0);    opacity:1; }
  }

  .del-modal-icon {
    padding: 28px 24px 16px;
    text-align: center;
  }

  .del-icon-circle {
    width: 60px;
    height: 60px;
    background: rgba(239,68,68,0.1);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    color: #ef4444;
  }

  .del-modal-body {
    padding: 0 24px 20px;
    text-align: center;
  }

  .del-modal-body h3 {
    margin: 0 0 8px;
    font-size: 1rem;
    font-weight: 700;
    color: #1e1e2d;
  }

  .del-modal-body p {
    margin: 0;
    font-size: 0.88rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .del-modal-body strong { color: #1e1e2d; }

  .del-modal-footer {
    padding: 16px 24px 20px;
    display: flex;
    gap: 10px;
    border-top: 1px solid #f3f4f6;
  }

  .del-footer-btn {
    flex: 1;
    padding: 10px;
    border-radius: 9px;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .del-footer-btn.secondary {
    background: #f3f4f6;
    color: #6b7280;
  }

  .del-footer-btn.secondary:hover { background: #e5e7eb; }

  .del-footer-btn.danger {
    background: #ef4444;
    color: #fff;
  }

  .del-footer-btn.danger:hover { background: #dc2626; }
  .del-footer-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;

function DeleteUser({ userId, usuario, onUpdated }) {
  const [show, setShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/usuario/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': 'mi_clave_secreta_12345'
        }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setShow(false);
      if (onUpdated) onUpdated();
    } catch {
      alert('No se pudo eliminar el trabajador');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <style>{deleteCSS}</style>

      <button className="del-btn" onClick={() => setShow(true)}>
        <i className="fas fa-trash"></i> Eliminar
      </button>

      {show && (
        <div className="del-overlay">
          <div className="del-modal">
            <div className="del-modal-icon">
              <div className="del-icon-circle"><i className="fas fa-trash"></i></div>
            </div>
            <div className="del-modal-body">
              <h3>Eliminar Trabajador</h3>
              <p>
                ¿Estás seguro de que deseas eliminar a{' '}
                <strong>{usuario.nombre} {usuario.apellido}</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="del-modal-footer">
              <button className="del-footer-btn secondary" onClick={() => setShow(false)} disabled={isDeleting}>
                Cancelar
              </button>
              <button className="del-footer-btn danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <><i className="fas fa-spinner fa-spin"></i> Eliminando...</> : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteUser;
