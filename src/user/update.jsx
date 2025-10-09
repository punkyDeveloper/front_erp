import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { MDBIcon } from 'mdb-react-ui-kit';
import Form from "react-bootstrap/Form";


function Example({ usuario }) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    user: '',
    name: '',
    rol: ''
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // 👉 Cada vez que se abre el modal, cargamos los datos del usuario
  useEffect(() => {
    if (show && usuario) {
      setFormData({
        email: usuario.email || '',
        user: usuario.user || '',
        name: usuario.nombre || '',
        rol: usuario.rol || ''
      });
    }
  }, [show, usuario]);

  // 👉 Para manejar cambios en los campos
  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        <MDBIcon fas icon="pencil-alt" /> Editar
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="m-3" >
            <div className="form-group m-2">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group m-2">
              <label>User</label>
              <input
                type="text"
                name="user"
                className="form-control"
                value={formData.user}
                onChange={handleChange}
              />
            </div>

            <div className="form-group m-2">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group m-2">
              <label>Rol</label>
              <Form.Select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="">Selecciona un rol</option>
                <option value="mesera">Mesera</option>
                <option value="master">Master</option>
                <option value="coordinadora">Coordinadora</option>
                <option value="cajera">Cajera</option>
                <option value="chef">Chef</option>
                <option value="chef_auxiliar">Chef Auxiliar</option>
                <option value="Adminsitrador">Adminsitrador</option>
              </Form.Select>
            </div>

            <div className='form-group m-2'>
              <Button>
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              console.log('Datos actualizados:', formData);
              // Aquí podrías enviar `formData` al backend
              handleClose();
            }}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;


// roles

// <option value="mesera">Mesera</option>
// <option value="master">Master</option>
// <option value="coordinadora">Coordinadora</option>
// <option value="cajera">Cajera</option>
// <option value="chef">Chef</option>
// <option value="chef_auxiliar">Chef Auxiliar</option>
// <option value="Adminsitrador">Adminsitrador</option>