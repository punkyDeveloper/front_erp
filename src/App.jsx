import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mi_clave_secreta_12345'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      console.log('📥 RESPUESTA BACKEND:', result);

      if (!response.ok || !result.success) {
        setError(result.message || 'Error en login');
        setLoading(false);
        return;
      }

      const user = result.data;

      // 1️⃣ Limpiar localStorage anterior (por si acaso)
      localStorage.clear();

      // 2️⃣ Guardar token y usuario
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 3️⃣ Guardar cookie de company
      document.cookie = `company=${user.nombreCompany}; path=/; max-age=36000; SameSite=Lax`;

      console.log('✅ Token guardado:', user.token);
      console.log('✅ Usuario guardado:', user);

      // 4️⃣ Disparar evento 'login' para que Nav y PermissionsContext se actualicen
      window.dispatchEvent(new Event('login'));
      console.log('🔥 Evento "login" disparado');

      // 5️⃣ Esperar un momento para que los permisos se carguen
      // Esto es crucial porque fetchPermisos() es asíncrono
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('🚀 Navegando a /bienvenida');
      
      // 6️⃣ Navegar a la página de bienvenida
      navigate('/bienvenida', { replace: true });

    } catch (err) {
      console.error('❌ Error en login:', err);
      setError('Error de conexión con el servidor');
      setLoading(false);
    }
    // ⚠️ NO pongas setLoading(false) aquí porque queremos mantener el loading
    // hasta que la navegación ocurra
  };

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100" style={{ maxWidth: '400px' }}>
        <Col>
          <div className="text-center mb-4">
            <h2>Iniciar Sesión</h2>
          </div>

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                Por favor ingresa un email válido
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                La contraseña es requerida
              </Form.Control.Feedback>
            </Form.Group>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-100"
              variant="primary"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Cargando permisos...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;