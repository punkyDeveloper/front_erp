
import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav       from 'react-bootstrap/Nav';
import Navbar    from 'react-bootstrap/Navbar';
import Button    from 'react-bootstrap/Button';

/* ── Decodifica el JWT y extrae nombre + rol ── */
const getUsuario = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { nombre: 'Usuario', rol: '' };
    const payload = JSON.parse(atob(token.split('.')[1]));
    const nombre =
      payload.nombre ||
      payload.name   ||
      payload.email?.split('@')[0] ||
      'Usuario';
    const rol =
      typeof payload.rol === 'string'
        ? payload.rol
        : (payload.rol?.nombre || payload.role || '');
    return { nombre, rol };
  } catch {
    return { nombre: 'Usuario', rol: '' };
  }
};

/* ── Módulos del POS ── */
const MODULOS = [
  { label: 'ERP',    href: '/dashboard' },
  { label: 'POS',    href: '/Pos'       },
  { label: 'Ventas', href: '/ventas'    },
];

export default function NavPos() {
  const [user, setUser] = useState({ nombre: '', rol: '' });

  useEffect(() => { setUser(getUsuario()); }, []);

  const salir = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <Navbar bg="dark" expand="lg" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/Pos" style={{ fontWeight: 700, letterSpacing: '.5px' }}>
          Tu Tienda · POS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navpos-collapse" />
        <Navbar.Collapse id="navpos-collapse">
          <Nav className="me-auto">
            {MODULOS.map(m => (
              <Nav.Link key={m.href} href={m.href}>{m.label}</Nav.Link>
            ))}
          </Nav>
          <Navbar.Text className="mx-2" style={{ fontSize: 14 }}>
            👤 <strong>{user.nombre}</strong>
          </Navbar.Text>
          {user.rol && (
            <Navbar.Text className="mx-2" style={{ fontSize: 13, color: '#94A3B8' }}>
              {user.rol}
            </Navbar.Text>
          )}
          <Button variant="outline-danger" size="sm" className="ms-2" onClick={salir}>
            Salir
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
