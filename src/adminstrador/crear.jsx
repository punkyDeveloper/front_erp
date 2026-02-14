import { useEffect, useState, useCallback } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";


const API_URL = `${process.env.REACT_APP_API_URL}/companias`;

function Companias() {
  // ── Lista ──
  const [companias, setCompanias] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modal crear/editar ──
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Modal éxito ──
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ── Modal eliminar ──
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Form ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nit, setNit] = useState("");
  const [dv, setDv] = useState("");
  const [nombreCompany, setNombreCompany] = useState("");

  // ── Auth headers ──
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ── Fetch compañías ──
  const fetchCompanias = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, { headers: getHeaders() });
      if (!response.ok) throw new Error("Error al obtener compañías");
      const data = await response.json();
      setCompanias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching compañías:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanias();
  }, [fetchCompanias]);

  // ── Calcular DV ──
  const calcularDV = (nit) => {
    if (!nit || nit.length === 0) return "";
    const nitLimpio = nit.replace(/\D/g, "");
    if (nitLimpio.length === 0) return "";
    const vpri = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let suma = 0;
    for (let i = 0; i < nitLimpio.length && i < vpri.length; i++) {
      suma += parseInt(nitLimpio[nitLimpio.length - 1 - i]) * vpri[i];
    }
    const residuo = suma % 11;
    return residuo > 1 ? (11 - residuo).toString() : residuo.toString();
  };

  const handleNitChange = (e) => {
    const nuevoNit = e.target.value;
    setNit(nuevoNit);
    setDv(calcularDV(nuevoNit));
  };

  // ── Limpiar form ──
  const limpiarForm = () => {
    setEmail("");
    setPassword("");
    setNombre("");
    setApellido("");
    setNit("");
    setDv("");
    setNombreCompany("");
  };

  // ── Abrir modal crear ──
  const handleOpenCreate = () => {
    setEditing(null);
    limpiarForm();
    setShow(true);
  };

  // ── Abrir modal editar ──
  const handleOpenEdit = (compania) => {
    setEditing(compania);
    setNombreCompany(compania.nombreCompany || "");
    setNit(compania.nit || "");
    setDv(compania.dv || "");
    // No cargamos email/password/nombre/apellido porque son del admin, no de la compañía
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setEditing(null);
  };

  // ── Guardar (crear o editar) ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        // ── Editar compañía ──
        if (!nombreCompany || !nit) {
          alert("Nombre de compañía y NIT son obligatorios");
          setSaving(false);
          return;
        }

        const response = await fetch(`${API_URL}/${editing._id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ nombreCompany, nit, dv }),
        });

        if (!response.ok) {
          const data = await response.json();
          alert(data.msg || "Error al actualizar");
          setSaving(false);
          return;
        }

        setSuccessMsg("Compañía actualizada exitosamente");
      } else {
        // ── Crear compañía + admin ──
        if (!email || !password || !nombre || !apellido || !nit || !nombreCompany) {
          alert("Todos los campos son obligatorios");
          setSaving(false);
          return;
        }

        const response = await fetch(API_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            email,
            password,
            nombre,
            apellido,
            nit,
            dv,
            nombreCompany,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.msg || "Error al crear la compañía");
          setSaving(false);
          return;
        }

        setSuccessMsg("Compañía y administrador creados exitosamente");
      }

      limpiarForm();
      handleClose();
      setShowSuccess(true);
      fetchCompanias();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`${API_URL}/${deleteTarget._id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error();
      setDeleteTarget(null);
      setSuccessMsg("Compañía eliminada");
      setShowSuccess(true);
      fetchCompanias();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la compañía");
    }
  };

  // ── Formatear fecha ──
  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <Button variant="primary" onClick={handleOpenCreate}>
          + Registrar Compañía
        </Button>
      </div>


      {/* ── Modal Crear / Editar ── */}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size={editing ? "md" : "lg"}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Editar Compañía" : "Registrar Nueva Compañía"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="m-3">
            <div className="form-group m-2">
              <label htmlFor="nombreCompany">Nombre de la Compañía</label>
              <input
                type="text"
                className="form-control"
                id="nombreCompany"
                value={nombreCompany}
                onChange={(e) => setNombreCompany(e.target.value)}
                placeholder="Ingrese el nombre de la compañía"
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="nit">NIT / CC</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  id="nit"
                  value={nit}
                  onChange={handleNitChange}
                  placeholder="Ingrese el NIT"
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: "60px" }}
                  value={dv}
                  disabled
                  placeholder="DV"
                  title="Dígito de Verificación (calculado automáticamente)"
                />
              </div>
            </div>

            {/* Solo mostrar datos del admin al CREAR */}
            {!editing && (
              <>
                <hr className="my-3" />
                <h5 className="mb-3">Datos del Administrador</h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group m-2">
                      <label htmlFor="nombre">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ingrese el nombre"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group m-2">
                      <label htmlFor="apellido">Apellido</label>
                      <input
                        type="text"
                        className="form-control"
                        id="apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Ingrese el apellido"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group m-2">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="form-group m-2">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese la contraseña"
                  />
                </div>
              </>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? "Guardando..."
                  : editing
                  ? "Actualizar"
                  : "Registrar"}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Modal Confirmar Eliminar ── */}
      <Modal
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de eliminar la compañía{" "}
            <strong>{deleteTarget?.nombreCompany}</strong> (NIT:{" "}
            {deleteTarget?.nit})?
          </p>
          <p className="text-danger small">
            Esta acción eliminará la compañía y todos sus datos asociados.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal Éxito ── */}
      <Modal show={showSuccess} onHide={() => setShowSuccess(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>✅ ¡Éxito!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{successMsg}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccess(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Companias;