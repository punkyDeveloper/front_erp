import { useEffect, useState, useCallback } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";

const API_URL = `${process.env.REACT_APP_API_URL}/administradores`;

function Administradores() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modales ──
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Form editar ──
  const [formNombre, setFormNombre] = useState("");
  const [formApellido, setFormApellido] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formEstado, setFormEstado] = useState(true);

  // ── Auth headers ──
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ── Fetch ──
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, { headers: getHeaders() });
      if (!response.ok) throw new Error("Error al obtener administradores");
      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching administradores:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // ── Formatear fecha ──
  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // ── Abrir editar ──
  const handleOpenEdit = (usuario) => {
    setEditing(usuario);
    setFormNombre(usuario.nombre || "");
    setFormApellido(usuario.apellido || "");
    setFormEmail(usuario.email || "");
    setFormEstado(usuario.estado !== false);
    setShowEdit(true);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setEditing(null);
  };

  // ── Guardar edición ──
  const handleSaveEdit = async () => {
    if (!formNombre || !formApellido || !formEmail) {
      alert("Nombre, apellido y email son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/${editing._id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          nombre: formNombre,
          apellido: formApellido,
          email: formEmail,
          estado: formEstado,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.msg || "Error al actualizar");
        return;
      }

      handleCloseEdit();
      fetchUsuarios();
    } catch (error) {
      console.error("Error al actualizar:", error);
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
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el administrador");
    }
  };

  // ── Obtener nombre del rol ──
  const getRolNombre = (rol) => {
    if (!rol) return "N/A";
    if (typeof rol === "object" && rol !== null) {
      return rol.nombre || rol.name || "N/A";
    }
    return rol;
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Administradores</h3>
      </div>

      {/* ── Tabla ── */}
      <Table responsive striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>User</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="text-center py-4">
                Cargando...
              </td>
            </tr>
          ) : usuarios.length > 0 ? (
            usuarios.map((usuario, index) => (
              <tr key={usuario._id || index}>
                <td>{index + 1}</td>
                <td>{usuario.nombre || "N/A"}</td>
                <td>{usuario.apellido || "N/A"}</td>
                <td>{usuario.email || "N/A"}</td>
                <td>{usuario.user || "N/A"}</td>
                <td>
                  <Badge bg="info">{getRolNombre(usuario.rol)}</Badge>
                </td>
                <td>
                  {usuario.estado !== false ? (
                    <Badge bg="success">🟢 Activo</Badge>
                  ) : (
                    <Badge bg="danger">🔴 Inactivo</Badge>
                  )}
                </td>
                <td>
                  {formatFecha(usuario.createdAt || usuario.fecha_creacion)}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleOpenEdit(usuario)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setDeleteTarget(usuario)}
                    >
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-4 text-muted">
                No hay administradores registrados
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* ── Modal Editar ── */}
      <Modal show={showEdit} onHide={handleCloseEdit} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Administrador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group mb-3">
            <label>Nombre</label>
            <input
              type="text"
              className="form-control"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <label>Apellido</label>
            <input
              type="text"
              className="form-control"
              value={formApellido}
              onChange={(e) => setFormApellido(e.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <label>Estado</label>
            <select
              className="form-control"
              value={formEstado ? "activo" : "inactivo"}
              onChange={(e) => setFormEstado(e.target.value === "activo")}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveEdit}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Actualizar"}
          </Button>
        </Modal.Footer>
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
            ¿Estás seguro de eliminar al administrador{" "}
            <strong>
              {deleteTarget?.nombre} {deleteTarget?.apellido}
            </strong>
            ?
          </p>
          <p className="text-danger small">Esta acción no se puede deshacer.</p>
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
    </>
  );
}

export default Administradores;