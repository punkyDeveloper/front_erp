import Nav from './assets/nav/nav';
import Form from 'react-bootstrap/Form';
export default function Board() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Nav />

      {/* Contenido derecho */}
      <div style={{ marginLeft: '10px', padding: '5px', width: '100%' }}>
        <h1>hola</h1>
        <Form.Select aria-label="Default select example">
      <option>Open this select menu</option>
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
    </Form.Select>
      </div>
    </div>
  );
}
