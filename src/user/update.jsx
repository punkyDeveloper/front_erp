import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { MDBIcon } from 'mdb-react-ui-kit';
import Form from "react-bootstrap/Form";

function Example() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        <MDBIcon fas icon="pencil-alt" />
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form className="m-3">
            <div className="form-group m-2">
              <label htmlFor="exampleInputEmail1">Email address</label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />

            </div>

            <div className="form-group m-2">
              <label htmlFor="exampleInputEmail1">User</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="exampleInputPassword1">name</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputPassword1"
              />
            </div>

              <div className="form-group m-2">

              
            <label htmlFor="exampleInputEmail1">Rol</label>

            <Form.Select aria-label="Floating label select example">
              <option>Option</option>
              <option value="1">mesera</option>
              <option value="2">Master</option>
              <option value="3">Coordinadora</option>
              <option value="4">Cajera</option>
              <option value="5">Chef</option>
              <option value="6">Chef auxiliar</option>
            </Form.Select>
            </div>
            <div className='form-group m-2'>
              <Button >
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => alert('Action confirmed!')}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;
