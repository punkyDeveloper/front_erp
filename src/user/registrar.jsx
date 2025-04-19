import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { use } from "react";
function Example() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  // const [password, setPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState('');
  const [isLoading, setIsLoading] = useState(true);



  const handleSave = async (e) => {
    
    e.preventDefault();
   console.log(email, user, name, selectedRol);
    try {
      const response = await fetch('http://localhost:3001/v1/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          user,
          name,
          rol_id: selectedRol
        }),
      });
      const data = await response.json();
      console.log(data);
      handleClose();
      // Aquí puedes manejar la respuesta del servidor si es necesarioqueee
      
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      
    }
    
  }
  useEffect(() => {
    // Función para obtener roles
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:3001/v1/role');
        const data = await response.json();
        console.log(data.descripcion);
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
                aria-describedby="emailHelp"
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            <div className="form-group m-2">
              <label htmlFor="exampleInputEmail1">User</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="exampleInputPassword1">Name</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputPassword1"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
      <label htmlFor="rolSelect">Rol</label>
      <Form.Select 
        id="rolSelect" 
        aria-label="Selección de rol" 
        disabled={isLoading}
        value={selectedRol}
        onChange={(e) => setSelectedRol(e.target.value)}
      >
        <option value="">Seleccione un rol</option>
        {roles.map(rol => (
          <option key={rol.id} value={rol.id}>{rol.rol}</option>
        ))}
      </Form.Select>
    </div>
          <Button className="m-3" variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" type="submit">Register</Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Example;
