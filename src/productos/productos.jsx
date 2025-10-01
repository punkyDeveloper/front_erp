import Nav from '../assets/nav/nav';
import Registrar from './crearProducto';
import Tabla from './tablaProductos';


const Productos = () => {
 

  return (
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
          <Nav />

        {/* Contenido derecho */}
        <div style={{ marginLeft: '10px', padding: '5px', width: '100%' }}>
          <div className='m-2'>
            <Registrar  />
          </div>
          <div className='m-2'>
            <Tabla />
          </div>

        </div>
      </div>
      

  );
};

export default Productos;
