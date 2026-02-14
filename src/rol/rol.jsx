import { useEffect, useState } from 'react';
import Nav from '../assets/nav/nav';
import CrearRol from './crearrol';
import EditarRol from './editarrol';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

export default function Board() {
  const [roles, setRoles] = useState([]);
  const [rolEditar, setRolEditar] = useState(null);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': 'mi_clave_secreta_12345'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener roles');
      }
      
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener roles:', error.message);
      setRoles([]);
    }
  }

  const handleEditar = (rol) => {
    setRolEditar(rol);
  };

  const handleCerrarEditar = () => {
    setRolEditar(null);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <div className='m-2'>
          <CrearRol onRolCreado={fetchRoles} />
        </div>
        <div className='m-2'>
          <Table responsive striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Permisos</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.length > 0 ? (
                roles.map((rol, index) => (
                  <tr key={rol._id || index}>
                    <td>{index + 1}</td>
                    <td>{rol.rol}</td>
                    <td>{rol.descripcion}</td>
                    <td>{rol.permisos?.length || 0} permisos</td>
                    <td>{new Date(rol.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="warning" 
                        size="sm"
                        onClick={() => handleEditar(rol)}
                      >
                        ✏️ Editar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No hay roles disponibles</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {rolEditar && (
          <EditarRol 
            rol={rolEditar} 
            onClose={handleCerrarEditar} 
            onRolEditado={fetchRoles}
          />
        )}
      </div>
    </div>
  );
}