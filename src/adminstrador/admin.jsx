import Nav from '../assets/nav/nav';
import Example from './crear';
import ResponsiveExample from './tabla';

export default function User() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Nav />

      {/* Contenido derecho */}
      <div style={{ overflowY: 'auto',  width: '100%' }}>
      <div className=' m-2'>
       <Example />
       </div>
       <div className=' m-2'>

       <  ResponsiveExample />
       </div>
      </div>
    </div>
  );
}
