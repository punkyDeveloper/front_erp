import  { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Update from './update';

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


  return (
    <Table responsive striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>#</th>
          {usuarios.length > 0 && Object.keys(usuarios[0]).map((key, index) => (
            <th key={index}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
          ))}
          <th>Opciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            {Object.values(usuario).map((value, idx) => (
              <td key={idx}>
                {typeof value === 'object' && value !== null 
                  ? JSON.stringify(value) 
                  : value}
              </td>
            ))}
            <td><Update usuario={usuario} /></td>
          </tr>
        ))}
      </tbody> 
    </Table>
  );
}

export default ResponsiveExample;