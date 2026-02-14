import { useState, useEffect } from "react";
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
  const [selectedRol, setSelectedRol] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
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

        if (!response.ok) throw new Error('Error al obtener roles');

        const data = await response.json();
        const rolesArray = Array.isArray(data) ? data : [];
        setRoles(rolesArray);

        if (rolesArray.length > 0) {
          setSelectedRol(rolesArray[0]._id);
        }
      } catch (error) {
        console.error("Error al cargar roles:", error);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!selectedRol) {
      alert("El campo rol no puede estar vacío");
      return;
    }

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
          email,
          user,
          name,
          rol_id: selectedRol,
          apellido,
          compania: "68c46f3eb4a657d3e15fa56e",
        }),
      });

      const data = await response.json();

      if (data.password && data.email) {
        setGeneratedPassword(data.password);
        setObtenerCorreo(data.email);
        setShowPasswordModal(true);
      }

      handleClose();
      setEmail("");
      setUser("");
      setName("");
      setApellido("");
      setSelectedRol(roles.length > 0 ? roles[0]._id : "");
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      alert("Error al guardar el usuario");
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Gestión de Usuario</h3>
        <Button variant="primary" onClick={handleShow}>
          Register
        </Button>
      </div>

      {/* Modal de Registro */}
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="user">User</label>
              <input
                type="text"
                className="form-control"
                id="user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                className="form-control"
                id="apellido"
                value={apellido}
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
                  <option key={rol._id} value={rol._id}>
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
          <p>
            Correo: <strong>{obtenerCorreo}</strong>
          </p>
          <p>
            Contraseña: <strong>{generatedPassword}</strong>
          </p>
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