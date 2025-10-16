import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

function UpdateUser({ userId, onUpdated, usuarios }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
console.log(userId);

  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Cargar usuario y roles al abrir modal
  useEffect(() => {
    if (!show || !userId) return;

    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          fetch(`http://localhost:3001/v1/usuario/${userId}`),
          fetch("http://localhost:3001/v1/role"),
        ]);

        if (!userRes.ok || !rolesRes.ok)
          throw new Error("Error al cargar datos");

        const userData = await userRes.json();
        const rolesData = await rolesRes.json();

        setUsuario({
          ...userData,
          name: userData.nombre || "",
          apellido: userData.apellido || "",
          user: userData.user || "",
          email: userData.email || "",
          rol_id: userData.rol?._id || userData.rol || "",
          compania: userData.compania || "",
          estado: userData.estado ?? true,
        });
        setRoles(rolesData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [show, userId]);

  // 🔹 Manejar cambios de los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUsuario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Guardar actualización
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!usuario) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: usuario.name,
        apellido: usuario.apellido,
        email: usuario.email,
        user: usuario.user,
        rol_id: usuario.rol_id,
        compania: usuario.compania,
        estado: usuario.estado,
        updatedAt: new Date().toISOString(), // ✅ fecha de actualización
      };

      const response = await fetch(
        `http://localhost:3001/v1/usuario/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al actualizar");

      alert("Usuario actualizado correctamente");
      handleClose();
      if (onUpdated) onUpdated(); // refresca tabla u otro componente
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("No se pudo actualizar el usuario: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="warning" onClick={handleShow}>
        Editar Usuario
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Usuario</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {isLoading ? (
            <p>Cargando datos...</p>
          ) : (
            <form onSubmit={handleUpdate}>
              <div className="form-group m-2">
                <label>Correo</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={usuario.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group m-2">
                <label>Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  name="user"
                  value={usuario.user}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group m-2">
                <label>Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={usuario.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group m-2">
                <label>Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  name="apellido"
                  value={usuario.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group m-2">
                <label>Rol</label>
                <Form.Select
                  name="rol_id"
                  value={usuario.rol_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.rol}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="form-group m-2">
                <label>Estado</label>
                <Form.Check
                  type="switch"
                  name="estado"
                  label={usuario.estado ? "Activo" : "Inactivo"}
                  checked={usuario.estado}
                  onChange={handleChange}
                />
              </div>

              <div className="text-end mt-3">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Actualizar"}
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default UpdateUser;
