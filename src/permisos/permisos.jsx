import React, { useEffect, useState } from 'react';
import Nav from '../assets/nav/nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Modal, Form, Table } from 'react-bootstrap';

const CrearPermisos = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [accionesSeleccionadas, setAccionesSeleccionadas] = useState([]);
  const [permisos, setPermisos] = useState([]);

  const accionesDisponibles = ['Ver', 'Crear', 'Editar', 'Eliminar'];

  const abrirModal = () => {
    setNombre('');
    setDescripcion('');
    setAccionesSeleccionadas([]);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const manejarAccionSeleccionada = (accion) => {
    setAccionesSeleccionadas([accion]);
  };

  const fetchPermisos = async () => {
    try {
      const response = await fetch('http://localhost:3001/v1/permisos');
      if (!response.ok) {
        throw new Error('Error al obtener permisos');
      }
      const data = await response.json();
      setPermisos(data);
    } catch (error) {
      console.error('Error al obtener permisos:', error.message);
    }
  };

  const guardarPermiso = async () => {
    if (!nombre || !descripcion || accionesSeleccionadas.length === 0) {
      alert('Completa todos los campos antes de guardar.');
      return;
    }

    const nuevosPermisos = accionesSeleccionadas.map((accion) => ({
      nombre: `${accion} ${nombre}`,
      descripcion,
      accion,
    }));

    try {
      for (const permiso of nuevosPermisos) {
        const response = await fetch('http://localhost:3001/v1/permisos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(permiso),
        });

        if (!response.ok) {
          throw new Error('Error en el envío');
        }
      }

      alert('Permiso creado exitosamente');
      cerrarModal();
      fetchPermisos(); 
    } catch (error) {
      console.error('Error:', error.message);
      alert('Ocurrió un error');
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Nav />
      <div style={{ marginLeft: '10px', padding: '5px', width: '100%' }}>
        <Container className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Gestión de Permisos</h3>
            <Button onClick={abrirModal}>+ Nuevo Permiso</Button>
          </div>

          <Table bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Acción</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {permisos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">No hay permisos aún</td>
                </tr>
              ) : (
                permisos.map((permiso, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{permiso.nombre}</td>
                    <td>{permiso.accion}</td>
                    <td>{permiso.descripcion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Modal show={mostrarModal} onHide={cerrarModal}>
            <Modal.Header closeButton>
              <Modal.Title>Crear Permiso</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form className="m-3">
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Permiso</Form.Label>
                  <Form.Control
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Acción</Form.Label>
                  {accionesDisponibles.map((accion) => (
                    <Form.Check
                      key={accion}
                      type="radio"
                      name="accionUnica"
                      label={accion}
                      checked={accionesSeleccionadas.includes(accion)}
                      onChange={() => manejarAccionSeleccionada(accion)}
                    />
                  ))}
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cerrarModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={guardarPermiso}
                disabled={!nombre || accionesSeleccionadas.length === 0}
              >
                Guardar
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default CrearPermisos;
