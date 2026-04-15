import { useState, useEffect } from "react";

const modalCSS = `
  .reg-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: regFadeIn 0.2s ease;
  }

  @keyframes regFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .reg-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: regSlideUp 0.25s ease;
    overflow: hidden;
  }

  @keyframes regSlideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .reg-modal-header {
    padding: 22px 26px 18px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .reg-modal-header h3 {
    margin: 0;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reg-close-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .reg-close-btn:hover { background: rgba(255,255,255,0.35); }

  .reg-modal-body {
    padding: 24px 26px;
  }

  .reg-field {
    margin-bottom: 16px;
  }

  .reg-field label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .reg-field input,
  .reg-field select {
    width: 100%;
    padding: 10px 13px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #1e1e2d;
    background: #f9fafb;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .reg-field input:focus,
  .reg-field select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }

  .reg-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .reg-modal-footer {
    padding: 14px 26px 22px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .reg-btn {
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .reg-btn-secondary {
    background: #f3f4f6;
    color: #6b7280;
  }

  .reg-btn-secondary:hover { background: #e5e7eb; }

  .reg-btn-primary {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff;
    min-width: 110px;
  }

  .reg-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .reg-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .reg-open-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff;
    border: none;
    border-radius: 11px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }

  .reg-open-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(99,102,241,0.35); }

  /* Success modal */
  .success-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    padding: 36px 30px;
    text-align: center;
    animation: regSlideUp 0.25s ease;
  }

  .success-icon {
    width: 64px;
    height: 64px;
    background: rgba(16,185,129,0.12);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    color: #10b981;
    margin: 0 auto 18px;
  }

  .success-modal h3 { margin: 0 0 10px; color: #1e1e2d; font-size: 1.1rem; }
  .success-modal p  { margin: 0 0 8px; color: #6b7280; font-size: 0.9rem; }

  .cred-box {
    background: #f8fafc;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 16px 0;
    text-align: left;
  }

  .cred-box .cred-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 0.88rem;
    color: #374151;
  }

  .cred-box .cred-row:last-child { margin-bottom: 0; }
  .cred-box .cred-row i { color: #6366f1; width: 16px; }
  .cred-box .cred-row strong { color: #1e1e2d; }
`;

function RegistrarTrabajador({ onCreated }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  const [apellido, setApellido] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [obtenerCorreo, setObtenerCorreo] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/roles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': 'mi_clave_secreta_12345'
          }
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        const arr = Array.isArray(data) ? data : [];
        setRoles(arr);
        if (arr.length > 0) setSelectedRol(arr[0]._id);
      } catch {
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const resetForm = () => {
    setEmail(""); setUser(""); setName(""); setApellido("");
    setSelectedRol(roles.length > 0 ? roles[0]._id : "");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedRol) { alert("Selecciona un rol"); return; }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/usuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
          'x-api-key': 'mi_clave_secreta_12345'
        },
        body: JSON.stringify({
          email, user, name, apellido,
          rol_id: selectedRol,
          compania: "68c46f3eb4a657d3e15fa56e",
        }),
      });

      const data = await response.json();

      if (data.email) {
        setObtenerCorreo(data.email);
        setGeneratedPassword(data.password || "Enviada al correo");
        setShowSuccess(true);
      }

      setShow(false);
      resetForm();
      if (onCreated) onCreated();
    } catch {
      alert("Error al registrar el trabajador");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{modalCSS}</style>

      <button className="reg-open-btn" onClick={() => setShow(true)}>
        <i className="fas fa-user-plus"></i>
        Nuevo Trabajador
      </button>

      {/* Modal de Registro */}
      {show && (
        <div className="reg-overlay" onClick={(e) => e.target === e.currentTarget && setShow(false)}>
          <div className="reg-modal">
            <div className="reg-modal-header">
              <h3><i className="fas fa-user-plus"></i> Registrar Trabajador</h3>
              <button className="reg-close-btn" onClick={() => setShow(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="reg-modal-body">

                <div className="reg-field">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label>Nombre de usuario</label>
                  <input
                    type="text"
                    placeholder="usuario123"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                  />
                </div>

                <div className="reg-row">
                  <div className="reg-field">
                    <label>Nombre</label>
                    <input
                      type="text"
                      placeholder="Juan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="reg-field">
                    <label>Apellido</label>
                    <input
                      type="text"
                      placeholder="Pérez"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="reg-field">
                  <label>Rol</label>
                  <select
                    disabled={isLoading}
                    value={selectedRol}
                    onChange={(e) => setSelectedRol(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol._id} value={rol._id}>{rol.rol}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="reg-modal-footer">
                <button type="button" className="reg-btn reg-btn-secondary" onClick={() => setShow(false)}>
                  Cancelar
                </button>
                <button type="submit" className="reg-btn reg-btn-primary" disabled={isSaving}>
                  {isSaving ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-check"></i> Registrar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="reg-overlay" onClick={(e) => e.target === e.currentTarget && setShowSuccess(false)}>
          <div className="success-modal">
            <div className="success-icon"><i className="fas fa-check"></i></div>
            <h3>Trabajador Registrado</h3>
            <p>Las credenciales han sido generadas exitosamente.</p>

            <div className="cred-box">
              <div className="cred-row">
                <i className="fas fa-envelope"></i>
                Correo: <strong>{obtenerCorreo}</strong>
              </div>
              {generatedPassword && generatedPassword !== "Enviada al correo" && (
                <div className="cred-row">
                  <i className="fas fa-key"></i>
                  Contraseña: <strong>{generatedPassword}</strong>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              Comparte estas credenciales de forma segura con el trabajador.
            </p>

            <button
              className="reg-btn reg-btn-primary"
              style={{ marginTop: 8 }}
              onClick={() => setShowSuccess(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RegistrarTrabajador;
