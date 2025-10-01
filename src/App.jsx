import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './nn.css'
function App() {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async  (event) => {
    event.preventDefault();
    // Validaciones del fromato
    const form = event.currentTarget;
    if (form.checkValidity() === false ) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);


    // Enviar infoformacion a el cervidor 
    if (!email || !password) {
      setError('Por favor, ingrese ambos email y contraseña.');
      return;
    }

    if(password.length < 8){
      setError("No puedes ser menor a 8 caracteres");
      return;
    }

try {
  const response = await fetch(`http://localhost:3001/v1/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Login exitoso:', data);
    // Aquí puedes redirigir al usuario o guardar el token, etc.  
    
  }
} catch (err) {
  setError(err.message || "Ocurrió un error inesperado");
}

  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col className='col-12'>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className='login' as={Col} md="12" >
              <Form.Label>Email address</Form.Label>
              <Form.Control 
                required
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                />
                
            </Form.Group>

            <Form.Group className='login' as={Col} md="12" >
              <Form.Label>Password</Form.Label>
              <Form.Control required 
              id="password"
              name="password"
              value={password}
              type="password" 
              placeholder="Enter password" 
              onChange={(e) => setPassword(e.target.value)}/>

                {/* Agregar mas validaciones  */}
            </Form.Group>
            {error && <p className="text-red-500">{error}</p>}
            <Button className="mt-3" type="submit">
              Submit form
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
