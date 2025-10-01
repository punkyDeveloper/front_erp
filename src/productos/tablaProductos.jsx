import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';

function ProductosTable() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    let ignore = false;

    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:3001/v1/productos'); // 🔹 tu backend
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!ignore) setProductos(data);
      } catch (error) {
        console.error('Error fetching productos:', error);
      }
    };

    fetchProductos();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Table responsive striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>#</th>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Opciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto: any, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>
              {producto.img ? (
                <img 
                  src={producto.img} 
                  alt={producto.nombre} 
                  style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                />
              ) : (
                "Sin imagen"
              )}
            </td>
            <td>{producto.name}</td>
            <td>{producto.description}</td>
            <td>${producto.price}</td>
            <td>{producto.stock}</td>
            <td>{producto.venta}</td>
            <td>{producto.alquiler}</td>
            <td>
              {/* Aquí puedes poner botones de editar/eliminar */}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default ProductosTable;
