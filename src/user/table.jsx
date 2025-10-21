import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Update from './update';
import Delete from './delete';

function ResponsiveExample() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    let ignore = false;

    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:3001/v1/usuarios');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!ignore) setUsuarios(data);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
      }
    };

    fetchUsuarios();

    return () => {
      ignore = true;
    };
  }, []);

  // Función para formatear la fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Table responsive striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Email</th>
          <th>User</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Creado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario, index) => (
          <tr key={usuario._id || index}>
            <td>{index + 1}</td>
            <td>{usuario.nombre || 'N/A'}</td>
            <td>{usuario.apellido || 'N/A'}</td>
            <td>{usuario.email || 'N/A'}</td>
            <td>{usuario.user || 'N/A'}</td>
            <td>
              {typeof usuario.rol === 'object' && usuario.rol !== null
                ? usuario.rol.nombre || usuario.rol.name || 'N/A'
                : usuario.rol || 'N/A'}
            </td>
            <td>
              {usuario.estado ? (
                <span style={{ color: 'limegreen', fontWeight: 'bold' }}>
                  🟢 Activo
                </span>
              ) : (
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                  🔴 Inactivo
                </span>
              )}
            </td>
            <td>{formatFecha(usuario.createdAt || usuario.fecha_creacion)}</td>
            <td>
              <Update 
                userId={usuario._id} 
                usuario={usuario} 
                onUpdated={() => {
                  // Recargar la lista después de actualizar
                  fetch('http://localhost:3001/v1/usuarios')
                    .then(res => res.json())
                    .then(data => setUsuarios(data))
                    .catch(err => console.error('Error al recargar:', err));
                }} 
              />            
              <Delete 
                userId={usuario._id} 
                usuario={usuario} 
                onUpdated={() => {
                  // Recargar la lista después de actualizar
                  fetch('http://localhost:3001/v1/usuarios')
                    .then(res => res.json())
                    .then(data => setUsuarios(data))
                    .catch(err => console.error('Error al recargar:', err));
                }} 
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default ResponsiveExample;