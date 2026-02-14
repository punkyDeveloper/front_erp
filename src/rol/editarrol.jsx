import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function EditarRol({ rol, onClose, onRolEditado }) {
  const [nombre, setNombre] = useState(rol.rol);
  const [descripcion, setDescripcion] = useState(rol.descripcion);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState(rol.permisos || []);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/permisos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": "mi_clave_secreta_12345",
          },
        });
        const data = await res.json();
        setPermisosDisponibles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener permisos:", error);
        setPermisosDisponibles([]);
      }
    };
    fetchPermisos();
  }, []);

  const permisosFiltrados = Array.isArray(permisosDisponibles)
    ? permisosDisponibles.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  const togglePermiso = (nombrePermiso) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(nombrePermiso)
        ? prev.filter((p) => p !== nombrePermiso)
        : [...prev, nombrePermiso]
    );
  };

  const seleccionarTodos = () => {
    const nuevos = permisosFiltrados
      .map((p) => p.nombre)
      .filter((n) => !permisosSeleccionados.includes(n));
    setPermisosSeleccionados((prev) => [...prev, ...nuevos]);
  };

  const deseleccionarTodos = () => setPermisosSeleccionados([]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !descripcion.trim() || permisosSeleccionados.length === 0) {
      return alert("Completa todos los campos");
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/roles/${rol._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": "mi_clave_secreta_12345",
        },
        body: JSON.stringify({
          rol: nombre,
          descripcion,
          permisos: permisosSeleccionados,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      alert("Rol actualizado correctamente");
      onClose();
      if (onRolEditado) onRolEditado();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Editar Rol: {rol.rol}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="fw-bold">Nombre del Rol *</label>
            <input
              className="form-control"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="fw-bold">Descripción *</label>
            <input
              className="form-control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <label className="fw-bold">Permisos ({permisosSeleccionados.length} seleccionados)</label>
          <input
            className="form-control mb-2"
            placeholder="Buscar permisos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="mb-2">
            <Button size="sm" variant="primary" onClick={seleccionarTodos} className="me-2">
              ✓ Seleccionar todos
            </Button>
            <Button size="sm" variant="secondary" onClick={deseleccionarTodos}>
              ✗ Deseleccionar todos
            </Button>
          </div>

          <div className="border rounded p-2 bg-light" style={{ maxHeight: 300, overflowY: "auto" }}>
            {permisosFiltrados.length > 0 ? (
              permisosFiltrados.map((permiso) => (
                <div key={permiso.nombre} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`edit-${permiso.nombre}`}
                    checked={permisosSeleccionados.includes(permiso.nombre)}
                    onChange={() => togglePermiso(permiso.nombre)}
                  />
                  <label className="form-check-label" htmlFor={`edit-${permiso.nombre}`}>
                    <strong>{permiso.nombre}</strong>
                    <br />
                    <small className="text-muted">{permiso.descripcion}</small>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">No hay permisos disponibles</p>
            )}
          </div>

          <div className="d-flex justify-content-end mt-3 gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="warning">
              💾 Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default EditarRol;