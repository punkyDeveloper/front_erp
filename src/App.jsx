import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

function Login() {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setError('');

    if (!email || !password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mi_clave_secreta_12345'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      console.log('RESPUESTA BACKEND:', result);

      if (!response.ok || !result.success) {
        setError(result.message || 'Error en login');
        return;
      }

      const user = result.data;

      // Guardar token y usuario
      localStorage.setItem('token', user.token); // NUEVO
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('login'));
      document.cookie = `company=${user.nombreCompany}; path=/; max-age=36000; SameSite=Lax`;

      navigate('/bienvenida');

    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <Col>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Cargando...' : 'Ingresar'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;