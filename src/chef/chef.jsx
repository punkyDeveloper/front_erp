import Nav from '../assets/nav/nav';
import Table from './tabla';
import Button from 'react-bootstrap/Button';
import Buscador from './buacar';
function Chef() {
  return(
    
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Nav />

      {/* Contenido derecho */}
      <div style={{ marginLeft: '10px', padding: '5px', width: '100%' }}>
        <h1>Chef</h1>
        <div className='m-2'>

        <Button variant="secondary">Crear cierre</Button>
          
        </div>
        <div className='m-2'>

          <Buscador/>
        </div>
        <div className='m-2'>
          <Table/>
        </div>
      </div>
    </div>

  );
}

export default Chef