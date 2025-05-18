import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function Example() {
  const [show, setShow] = useState(false);
  const [rol, setRol] = useState("");
  const [describe, setDescribe] = useState("");
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const res = await fetch("http://localhost:3001/v1/permisosN");
        const data = await res.json();
        setPermisosDisponibles(data); // NO se crea id artificial
      } catch (error) {
        console.error("Error al obtener permisos:", error);
      }
    };

    fetchPermisos();
  }, []);

  const permisosFiltrados = permisosDisponibles.filter((permiso) =>
    permiso.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const togglePermiso = (permiso) => {
    setPermisosSeleccionados((prev) =>
      prev.some((p) => p.nombre === permiso.nombre)
        ? prev.filter((p) => p.nombre !== permiso.nombre)
        : [...prev, permiso]
    );
  };

  const seleccionarTodos = () => {
    setPermisosSeleccionados((prev) => {
      const nuevos = permisosFiltrados.filter(
        (permiso) => !prev.some((p) => p.nombre === permiso.nombre)
      );
      return [...prev, ...nuevos];
    });
  };

  const deseleccionarTodos = () => setPermisosSeleccionados([]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!rol.trim()) return alert("El campo rol no puede estar vacío");
    if (!describe.trim()) return alert("El campo descripción no puede estar vacío");

    try {
      const response = await fetch("http://localhost:3001/v1/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rol,
          describe,
          permisos: permisosSeleccionados,
        }),
      });

      await response.json();
      handleClose();
    } catch (error) {
      console.error("Error al crear el rol:", error);
      alert("Error al crear el rol");
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Crear rol
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="m-3" onSubmit={handleSave}>
            <div className="form-group m-2">
              <label>Rol</label>
              <input
                className="form-control"
                onChange={(e) => setRol(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label>Descripción</label>
              <input
                className="form-control"
                onChange={(e) => setDescribe(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label>Buscar permisos</label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <div className="mb-2">
                <Button size="sm" variant="outline-primary" onClick={seleccionarTodos}>
                  Seleccionar todos
                </Button>{" "}
                <Button size="sm" variant="outline-secondary" onClick={deseleccionarTodos}>
                  Deseleccionar todos
                </Button>
              </div>

              <div className="d-flex flex-wrap" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {permisosFiltrados.map((permiso) => (
                  <div key={permiso.nombre} className="form-check me-4" style={{ width: "45%" }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`permiso-${permiso.nombre}`}
                      checked={permisosSeleccionados.some((p) => p.nombre === permiso.nombre)}
                      onChange={() => togglePermiso(permiso)}
                    />
                    <label className="form-check-label" htmlFor={`permiso-${permiso.nombre}`}>
                      {permiso.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button className="m-3" variant="secondary" onClick={handleClose}>
              Cerrar
            </Button>
            <Button type="submit" variant="primary">
              Enviar
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Example;
