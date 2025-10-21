import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

function UpdateUser({ userId, usuario, onUpdated }) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // 🔹 Cargar roles al montar el componente
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://localhost:3001/v1/role");
        if (!res.ok) throw new Error("Error al cargar roles");
        const data = await res.json();
        setRoles(data);
      } catch (error) {
        console.error("Error al cargar roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // 🔹 Prellenar formulario con los datos del usuario recibido
  useEffect(() => {
    if (usuario) {
      let rolNombre = "";

      // Extraer el NOMBRE del rol
      if (usuario.rol) {
        if (typeof usuario.rol === "object" && usuario.rol.rol) {
          rolNombre = usuario.rol.rol; // Nombre del rol desde el objeto
        } else if (typeof usuario.rol === "string") {
          rolNombre = usuario.rol; // Ya es el nombre del rol
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

  // 🔹 Manejar cambios de los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Actualizar usuario
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/v1/usuario/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.msg || "Error al actualizar");

      alert("✅ Usuario actualizado correctamente");
      handleClose();
      if (onUpdated) onUpdated();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ No se pudo actualizar el usuario: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button className='m-1' variant="warning" size="sm" onClick={handleShow}>
        Editar
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Usuario</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!formData ? (
            <p>Cargando datos...</p>
          ) : (
            <form onSubmit={handleUpdate}>
              <Form.Group className="m-2">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="m-2">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="m-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="m-2">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="m-2">
                <Form.Label>Rol</Form.Label>
                <Form.Select
                  name="rol_id"
                  value={formData.rol_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r.rol}>
                      {r.rol}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="m-2">
                <Form.Check
                  type="switch"
                  name="estado"
                  label={formData.estado ? "Activo" : "Inactivo"}
                  checked={formData.estado}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="text-end mt-3">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
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