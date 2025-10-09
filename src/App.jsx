import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './nn.css';

function App() {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); // Hook para redirección

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validaciones del formato
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    
    setValidated(true);
    setError(""); // Limpiar errores previos

    // Validación de campos
    if (!email || !password) {
      setError('Por favor, ingrese ambos email y contraseña.');
      return;
    }

    if (password.length < 8) {
      setError("La contraseña no puede ser menor a 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mi_clave_secreta_12345' // ✅ API Key agregada
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login exitoso:', data);
        
        // ✅ Guardar token en cookie
        document.cookie = `token=${data.token}; path=/; max-age=3600; SameSite=Strict`;
        
        // ✅ Guardar companiaId en cookie
        if (data.user?.companiaId) {
          document.cookie = `companiaId=${data.user.companiaId}; path=/; max-age=3600; SameSite=Strict`;
        }
        
        // ✅ Guardar datos del usuario en localStorage (opcional)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ✅ Redireccionar a /bienvenida
        navigate('/bienvenida');
        
      } else {
        // Error del servidor (credenciales incorrectas, etc.)
        setError(data.msg || 'Error al iniciar sesión');
      }
      
    } catch (err) {
      console.error('Error en login:', err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col className='col-12'>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className='login' as={Col} md="12">
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
              <Form.Control.Feedback type="invalid">
                Por favor ingrese un email válido.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='login' as={Col} md="12">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                required 
                id="password"
                name="password"
                value={password}
                type="password" 
                placeholder="Enter password" 
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
              <Form.Control.Feedback type="invalid">
                La contraseña debe tener al menos 8 caracteres.
              </Form.Control.Feedback>
            </Form.Group>

            {error && <p className="text-danger mt-2">{error}</p>}

            <Button 
              className="mt-3" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default App;