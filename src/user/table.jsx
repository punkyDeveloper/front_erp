import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Update from './update';
function ResponsiveExample() {
  const [usuarios, setUsuarios] = useState([]);


  useEffect(() => {

    try {
      
      const nn = async () => {
        const response = await fetch('http://localhost:3001/v1/user');
        const data = await response.json();
        console.log(data);
        setUsuarios(data);
      }

    } catch (error) {
      console.error('Error al cargar roles:', error);
      
    }

  })
  return (
    <Table responsive striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>#</th>
          {Array.from({ length: 5 }).map((_, index) => (
            <th key={index}>Table heading</th>
          ))}
          <td>Opciones</td>

        </tr>
        
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          {Array.from({ length: 5 }).map((_, index) => (
            <td key={index}>Table cell {index}</td>
          ))}
          <td><Update/></td>

        </tr>
        <tr>
          <td>2</td>
          {Array.from({ length: 5 }).map((_, index) => (
            <td key={index}>Table cell {index}</td>
          ))}
          <td><Update/></td>


        </tr>
        <tr>
          <td>3</td>
          {Array.from({ length: 5 }).map((_, index) => (
            <td key={index}>Table cell {index}</td>
          ))}
          <td><Update/></td>


        </tr>
      </tbody>
    </Table>
  );
}

export default ResponsiveExample;