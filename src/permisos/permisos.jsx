import React, { useState } from 'react';
import Nav from '../assets/nav/nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Modal, Form, Table } from 'react-bootstrap';

const CrearPermisos = () => {
  // Estado para gestionar los permisos
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [accionesSeleccionadas, setAccionesSeleccionadas] = useState([]);
  const [permisos, setPermisos] = useState([]);

  // Acciones disponibles
  const accionesDisponibles = ['ver', 'crear', 'editar', 'eliminar'];

  // Funciones para abrir y cerrar el modal
  const abrirModal = () => {
    setNombre('');
    setDescripcion('');
    setAccionesSeleccionadas([]);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  // Función para seleccionar una acción
  const manejarAccionSeleccionada = (accion) => {
    setAccionesSeleccionadas([accion]);  // Solo se puede seleccionar una acción
  };

  // Función para guardar el nuevo permiso
  const guardarPermiso = () => {
    const nuevosPermisos = accionesSeleccionadas.map((accion) => ({
      nombre: `${accion.charAt(0).toUpperCase() + accion.slice(1)} ${nombre}`,
      id: `${accion}`,
      descripcion,
      accion,
    }));

    setPermisos([...permisos, ...nuevosPermisos]);
    cerrarModal();
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Nav />
      {/* Contenido principal */}
      <div style={{ marginLeft: '10px', padding: '5px', width: '100%' }}>
        <Container className="mt-4">
          {/* Cabecera */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Gestión de Permisos</h3>
            <Button onClick={abrirModal}>+ Nuevo Permiso</Button>
          </div>

          {/* Tabla de permisos */}
          <Table bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Acción</th>
                <th>ID</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {permisos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">No hay permisos aún</td>
                </tr>
              ) : (
                permisos.map((permiso, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{permiso.nombre}</td>
                    <td>{permiso.accion}</td>
                    <td>{permiso.id}</td>
                    <td>{permiso.descripcion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Modal para crear o editar permisos */}
          <Modal show={mostrarModal} onHide={cerrarModal}>
            <Modal.Header closeButton>
              <Modal.Title>Crear Permiso</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {/* Nombre del permiso */}
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Permiso</Form.Label>
                  <Form.Control
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </Form.Group>

                {/* Descripción del permiso */}
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </Form.Group>

                {/* Selección de acción (solo una acción) */}
                <Form.Group className="mb-3">
                  <Form.Label>Acción</Form.Label>
                    {accionesDisponibles.map((accion) => (
                  <div>
                      <Form.Check
                        key={accion}
                        type="checkbox"
                        name="acciones"
                        label={accion.charAt(0).toUpperCase() + accion.slice(1)}
                        checked={accionesSeleccionadas.includes(accion)}
                        onChange={() => manejarAccionSeleccionada(accion)}
                      />
                  </div>
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
