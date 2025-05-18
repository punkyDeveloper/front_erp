import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

function Example() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  const [apellido, setApellido] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Nuevo estado para mostrar password generado
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [opetenerCorreo, serEmail] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (!selectedRol || selectedRol === "Seleccione un rol") {
        alert("El campo rol no puede estar vacío");
        return;
      }

      const response = await fetch('http://localhost:3001/v1/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          user,
          name,
          rol_id: selectedRol,
          apellido,
        }),
      });

      const data = await response.json();


      // Mostrar contraseña si viene en la respuesta
      if (data.password && data.email) {

        setGeneratedPassword(data.password);
        serEmail(data.email);
        setShowPasswordModal(true);
      }

      handleClose();

    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:3001/v1/role');
        const data = await response.json();
        setRoles(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar roles:', error);
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Register
      </Button>

      {/* Modal de Registro */}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="m-3" onSubmit={handleSave}>
            <div className="form-group m-2">
              <label htmlFor="exampleInputEmail1">Email address</label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="user">User</label>
              <input
                type="text"
                className="form-control"
                id="user"
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                className="form-control"
                id="apellido"
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="rolSelect">Rol</label>
              <Form.Select
                id="rolSelect"
                aria-label="Selección de rol"
                disabled={isLoading}
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value)}
              >
                <option value="">Seleccione un rol</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.rol}
                  </option>
                ))}
              </Form.Select>
            </div>

            <Button className="m-3" variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Register
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal de contraseña generada */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Creado Exitoso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Credenciales</h3>
          <p>Correo: <strong>{opetenerCorreo}</strong> </p>
          <p>Contraseña: <strong>{generatedPassword}</strong> </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowPasswordModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;
