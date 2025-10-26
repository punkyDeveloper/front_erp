import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function Example() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Estados para el formulario de compañía
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nit, setNit] = useState("");
  const [dv, setDv] = useState("");
  const [nombreCompany, setNombreCompany] = useState("");

  // Función para calcular el dígito de verificación
  const calcularDV = (nit) => {
    if (!nit || nit.length === 0) return "";
    
    const nitLimpio = nit.replace(/\D/g, '');
    if (nitLimpio.length === 0) return "";
    
    const vpri = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let suma = 0;
    
    for (let i = 0; i < nitLimpio.length && i < vpri.length; i++) {
      suma += parseInt(nitLimpio[nitLimpio.length - 1 - i]) * vpri[i];
    }
    
    const residuo = suma % 11;
    return residuo > 1 ? (11 - residuo).toString() : residuo.toString();
  };

  // Manejar cambio de NIT y calcular DV automáticamente
  const handleNitChange = (e) => {
    const nuevoNit = e.target.value;
    setNit(nuevoNit);
    setDv(calcularDV(nuevoNit));
  };

  // Modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      // Validar que todos los campos estén llenos
      if (!email || !password || !nombre || !apellido || !nit || !nombreCompany) {
        alert("Todos los campos son obligatorios");
        return;
      }

      const response = await fetch("http://localhost:3001/v1/companias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          nombre,
          apellido,
          nit,
          dv,
          nombreCompany,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Limpiar formulario
        setEmail("");
        setPassword("");
        setNombre("");
        setApellido("");
        setNit("");
        setDv("");
        setNombreCompany("");
        
        handleClose();
        setShowSuccessModal(true);
      } else {
        alert(data.msg || "Error al crear la compañía");
      }
    } catch (error) {
      console.error("Error al guardar la compañía:", error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Gestión de Compañías</h3>

        <Button variant="primary" onClick={handleShow}>
          Registrar Compañía
        </Button>
      </div>

      {/* Modal de Registro */}
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nueva Compañía</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="m-3">
            <div className="form-group m-2">
              <label htmlFor="nombreCompany">Nombre de la Compañía</label>
              <input
                type="text"
                className="form-control"
                id="nombreCompany"
                value={nombreCompany}
                onChange={(e) => setNombreCompany(e.target.value)}
                placeholder="Ingrese el nombre de la compañía"
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="nit">NIT / CC</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  id="nit"
                  value={nit}
                  onChange={handleNitChange}
                  placeholder="Ingrese el NIT"
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: "60px" }}
                  value={dv}
                  disabled
                  placeholder="DV"
                  title="Dígito de Verificación (calculado automáticamente)"
                />
              </div>
            </div>

            <hr className="my-3" />
            <h5 className="mb-3">Datos del Administrador</h5>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group m-2">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ingrese el nombre"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group m-2">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ingrese el apellido"
                  />
                </div>
              </div>
            </div>

            <div className="form-group m-2">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group m-2">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Registrar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de éxito */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>¡Éxito!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>La compañía y el usuario administrador han sido creados exitosamente.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowSuccessModal(false)}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;