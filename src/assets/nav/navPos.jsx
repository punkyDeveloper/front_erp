"use client";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';

function ColorSchemesExample() {
  return (
    <>
      <Navbar bg="dark" expand="lg" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">Tu Tienda</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/Board">ERP</Nav.Link>
              <Nav.Link href="/pos">POS</Nav.Link>
              <Nav.Link href="/Traslados">Traslados</Nav.Link>
              <Nav.Link href="/egresos">Egresos</Nav.Link>
              <Nav.Link href="/Pedidos">Pedidos</Nav.Link>
              <Nav.Link href="/Devolucion">Devolucion</Nav.Link>
              <NavDropdown title="Cierre" id="navbarScrollingDropdown">
              <NavDropdown.Item href="/Cierre1">Cierre Tienda</NavDropdown.Item>
              <NavDropdown.Item href="/Cierre2">Cierre Temporal</NavDropdown.Item>
            </NavDropdown>
            </Nav>
            <Navbar.Text className="m-3">
              Usuario: <a href="#login">Santi</a>
            </Navbar.Text>
            <Navbar.Text className="m-3">
              Rol: <a href="#login">Master</a>
            </Navbar.Text>
            <Button variant="outline-danger">Salir</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default ColorSchemesExample;