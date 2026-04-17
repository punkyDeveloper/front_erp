import { useEffect, useState } from "react";

const updateCSS = `
  .upd-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .upd-btn-edit {
    background: rgba(99,102,241,0.1);
    color: #4f46e5;
  }

  .upd-btn-edit:hover {
    background: rgba(99,102,241,0.2);
  }

  .upd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: updFade 0.2s ease;
    padding: 16px;
  }

  @keyframes updFade { from { opacity:0; } to { opacity:1; } }

  .upd-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: updSlide 0.25s ease;
  }

  @keyframes updSlide {
    from { transform: translateY(20px); opacity:0; }
    to   { transform: translateY(0);    opacity:1; }
  }

  .upd-modal-header {
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #1e1e2d, #2d2d44);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .upd-modal-header h3 {
    margin: 0;
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .upd-close-btn {
    background: rgba(255,255,255,0.15);
    border: none;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .upd-close-btn:hover { background: rgba(255,255,255,0.28); }

  .upd-modal-body { padding: 22px 24px; }

  .upd-section-title {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .upd-section-title i { color: #6366f1; }

  .upd-field {
    margin-bottom: 14px;
  }

  .upd-field label {
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .upd-field input,
  .upd-field select {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid #e5e7eb;
    border-radius: 9px;
    font-size: 0.88rem;
    color: #1e1e2d;
    background: #f9fafb;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .upd-field input:focus,
  .upd-field select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }

  .upd-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .upd-toggle-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .upd-toggle {
    position: relative;
    width: 42px;
    height: 22px;
  }

  .upd-toggle input { opacity: 0; width: 0; height: 0; }

  .upd-slider {
    position: absolute;
    inset: 0;
    background: #e5e7eb;
    border-radius: 22px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .upd-slider::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 3px;
    top: 3px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }

  .upd-toggle input:checked + .upd-slider { background: #10b981; }
  .upd-toggle input:checked + .upd-slider::before { transform: translateX(20px); }

  .upd-toggle-label {
    font-size: 0.86rem;
    font-weight: 600;
    color: #374151;
  }

  /* Sección contraseña */
  .upd-pwd-section {
    margin-top: 20px;
  }

  .upd-pwd-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(245,158,11,0.08);
    color: #d97706;
    border: 1.5px dashed rgba(245,158,11,0.4);
    border-radius: 9px;
    padding: 9px 14px;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;
  }

  .upd-pwd-toggle-btn:hover {
    background: rgba(245,158,11,0.14);
    border-style: solid;
  }

  .upd-pwd-fields {
    margin-top: 14px;
    padding: 16px;
    background: #fffbeb;
    border: 1.5px solid rgba(245,158,11,0.25);
    border-radius: 10px;
    animation: updFade 0.2s ease;
  }

  .upd-pwd-note {
    font-size: 0.77rem;
    color: #92400e;
    background: rgba(245,158,11,0.1);
    border-radius: 7px;
    padding: 8px 10px;
    margin-bottom: 12px;
    display: flex;
    gap: 7px;
    align-items: flex-start;
  }

  .upd-pwd-note i { margin-top: 1px; color: #d97706; }

  .upd-pwd-input-wrap {
    position: relative;
  }

  .upd-pwd-input-wrap input {
    padding-right: 40px !important;
  }

  .upd-pwd-eye {
    position: absolute;
    right: 11px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 2px;
    font-size: 0.9rem;
  }

  .upd-pwd-eye:hover { color: #6366f1; }

  .upd-modal-footer {
    padding: 14px 24px 22px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #f3f4f6;
  }

  .upd-footer-btn {
    padding: 9px 20px;
    border-radius: 9px;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .upd-footer-btn.secondary {
    background: #f3f4f6;
    color: #6b7280;
  }

  .upd-footer-btn.secondary:hover { background: #e5e7eb; }

  .upd-footer-btn.primary {
    background: linear-gradient(135deg, #1e1e2d, #3b3b5c);
    color: #fff;
    min-width: 110px;
  }

  .upd-footer-btn.primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .upd-footer-btn.primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

function UpdateUser({ userId, usuario, onUpdated }) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contraseña
  const [showPwdSection, setShowPwdSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/roles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': 'mi_clave_secreta_12345'
          }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRoles(Array.isArray(data) ? data : []);
      } catch {
        console.error("Error al cargar roles");
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (usuario) {
      let rolNombre = "";
      if (usuario.rol) {
        if (typeof usuario.rol === "object" && usuario.rol.rol) {
          rolNombre = usuario.rol.rol;
        } else if (typeof usuario.rol === "string") {
          rolNombre = usuario.rol;
        }
      }
      setFormData({
        name: usuario.nombre || "",
        apellido: usuario.apellido || "",
        user: usuario.user || "",
        email: usuario.email || "",
        rol_id: rolNombre || "",
        compania: usuario.compania || "",
        estado: usuario.estado ?? true,
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleClose = () => {
    setShow(false);
    setShowPwdSection(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData) return;

    if (showPwdSection && newPassword) {
      if (newPassword.length < 8) {
        alert("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const body = { ...formData };
      if (showPwdSection && newPassword) {
        body.newPassword = newPassword;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/usuario/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
          'x-api-key': 'mi_clave_secreta_12345'
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error al actualizar");

      handleClose();
      if (onUpdated) onUpdated();
    } catch (error) {
      alert("No se pudo actualizar: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{updateCSS}</style>

      <button className="upd-btn upd-btn-edit" onClick={() => setShow(true)}>
        <i className="fas fa-pen"></i> Editar
      </button>

      {show && (
        <div className="upd-overlay">
          <div className="upd-modal">
            <div className="upd-modal-header">
              <h3><i className="fas fa-user-pen"></i> Editar Trabajador</h3>
              <button className="upd-close-btn" onClick={handleClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {!formData ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className="upd-modal-body">

                  {/* Info general */}
                  <div className="upd-section-title">
                    <i className="fas fa-user"></i> Información General
                  </div>

                  <div className="upd-row">
                    <div className="upd-field">
                      <label>Nombre</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="upd-field">
                      <label>Apellido</label>
                      <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="upd-field">
                    <label>Usuario</label>
                    <input type="text" name="user" value={formData.user} onChange={handleChange} required />
                  </div>

                  <div className="upd-field">
                    <label>Correo electrónico</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>

                  <div className="upd-row">
                    <div className="upd-field">
                      <label>Rol</label>
                      <select name="rol_id" value={formData.rol_id} onChange={handleChange} required>
                        <option value="">Seleccione un rol</option>
                        {roles.map((r) => (
                          <option key={r._id} value={r.rol}>{r.rol}</option>
                        ))}
                      </select>
                    </div>
                    <div className="upd-field">
                      <label>Estado</label>
                      <div className="upd-toggle-wrap" style={{ marginTop: 10 }}>
                        <label className="upd-toggle">
                          <input
                            type="checkbox"
                            name="estado"
                            checked={formData.estado}
                            onChange={handleChange}
                          />
                          <span className="upd-slider"></span>
                        </label>
                        <span className="upd-toggle-label">{formData.estado ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sección contraseña */}
                  <div className="upd-pwd-section">
                    <div className="upd-section-title">
                      <i className="fas fa-lock"></i> Seguridad
                    </div>

                    <button
                      type="button"
                      className="upd-pwd-toggle-btn"
                      onClick={() => { setShowPwdSection(!showPwdSection); setNewPassword(""); setConfirmPassword(""); }}
                    >
                      <i className={`fas fa-${showPwdSection ? 'times' : 'key'}`}></i>
                      {showPwdSection ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
                    </button>

                    {showPwdSection && (
                      <div className="upd-pwd-fields">
                        <div className="upd-pwd-note">
                          <i className="fas fa-circle-info"></i>
                          <span>La nueva contraseña debe tener al menos 8 caracteres. El trabajador recibirá la nueva contraseña.</span>
                        </div>

                        <div className="upd-field">
                          <label>Nueva contraseña</label>
                          <div className="upd-pwd-input-wrap">
                            <input
                              type={showNewPwd ? "text" : "password"}
                              placeholder="Mínimo 8 caracteres"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required={showPwdSection}
                              minLength={8}
                            />
                            <button type="button" className="upd-pwd-eye" onClick={() => setShowNewPwd(!showNewPwd)}>
                              <i className={`fas fa-${showNewPwd ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                          </div>
                        </div>

                        <div className="upd-field" style={{ marginBottom: 0 }}>
                          <label>Confirmar contraseña</label>
                          <div className="upd-pwd-input-wrap">
                            <input
                              type={showConfirmPwd ? "text" : "password"}
                              placeholder="Repite la contraseña"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required={showPwdSection}
                            />
                            <button type="button" className="upd-pwd-eye" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                              <i className={`fas fa-${showConfirmPwd ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                          </div>
                          {confirmPassword && newPassword !== confirmPassword && (
                            <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 5, marginBottom: 0 }}>
                              <i className="fas fa-triangle-exclamation"></i> Las contraseñas no coinciden
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                <div className="upd-modal-footer">
                  <button type="button" className="upd-footer-btn secondary" onClick={handleClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="upd-footer-btn primary" disabled={isSubmitting}>
                    {isSubmitting
                      ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                      : <><i className="fas fa-check"></i> Actualizar</>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default UpdateUser;
