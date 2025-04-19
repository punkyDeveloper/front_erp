import { useEffect, useState } from 'react';
import Nav from '../assets/nav/nav';
import CrearRol from './crearrol';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

export default function Board() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/v1/role", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setRoles(data);
      })
      .catch(error => console.error("Error al obtener roles:", error));
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Nav />

      {/* Contenido derecho */}
      <div style={{ marginLeft: '10px', padding: '5px', width: '100%' }}>
        <div className='m-2'>
          <CrearRol />
        </div>
        <div className='m-2'>
          <Table responsive striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.length > 0 ? (
                roles.map((rol, index) => (
                  <tr key={rol.id || index}>
                    <td>{index + 1}</td>
                    <td>{rol.rol}</td>
                    <td>{rol.descripcion}</td>
                    <td>{rol.createdAt}</td>
                    <td><Button variant="primary">Editar</Button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No hay roles disponibles</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
