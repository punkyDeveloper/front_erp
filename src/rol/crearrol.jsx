import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";


function Example() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [rol, setRol] = useState("");
    const [describe, setDescribe] = useState("");
const handleSave  =  async () => {
    
    if(rol === "" || rol === null || rol === undefined || rol === " " || rol === "  "){
      alert("El campo rol no puede estar vacio");
    }

    if(describe){
      alert("El campo descripcion no puede estar vacio");
    }

    const data = await fetch("http://localhost:3001/rol", {

    })
  }
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Crear rol
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
          <form className="m-3" onSubmit={handleSave} >
            <div className="form-group m-2">
              <label htmlFor="rol">Rol</label>
              <input
                type="text"
                className="form-control"
                id="rol"
                name="rol"
                onChange={(e) => setRol(e.target.value)}
                aria-describedby="emailHelp"
              />

            </div>

            <div className="form-group m-2">
              <label htmlFor="exampleInputEmail1">Descripcion</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="exampleInputEmail1">Permis</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>

          <Button className="m-3" variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button type="submit" variant="primary">Enviar</Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Example;
