"use client";

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, FormControl, Badge, ListGroup, Form, InputGroup, Modal } from 'react-bootstrap';
import '../assets/style/pos.css';

function VisualAgregarProductos() {
    const [productos, setProductos] = useState([
        {
            id: 1,
            nombre: "Camiseta Estampada",
            precio: 1200,
            talla: "M",
            color: "Rojo",
            inventario: 0,
            codigo: "1234567890123",
            imagen: "https://via.placeholder.com/150?text=Camiseta+Estampada"
        },
        {
            id: 2,
            nombre: "Jeans Slim Fit",
            precio: 2500,
            talla: "L",
            color: "Azul",
            inventario: 30,
            codigo: "2345678901234",
            imagen: "https://via.placeholder.com/150?text=Jeans+Slim+Fit"
        },
        {
            id: 3,
            nombre: "Chaqueta de Cuero",
            precio: 4500,
            talla: "XL",
            color: "Negro",
            inventario: 20,
            codigo: "3456789012345",
            imagen: "https://via.placeholder.com/150?text=Chaqueta+de+Cuero"
        },
        {
            id: 4,
            nombre: "Camisa de Manga Larga",
            precio: 1800,
            talla: "S",
            color: "Blanco",
            inventario: 40,
            codigo: "4567890123456",
            imagen: "https://via.placeholder.com/150?text=Camisa+de+Manga+Larga"
        },
        {
            id: 5,
            nombre: "Short Deportivo",
            precio: 900,
            talla: "M",
            color: "Gris",
            inventario: 60,
            codigo: "5678901234567",
            imagen: "https://via.placeholder.com/150?text=Short+Deportivo"
        },
        {
            id: 6,
            nombre: "Zapatos Casual",
            precio: 3500,
            talla: "42",
            color: "Marrón",
            inventario: 25,
            codigo: "6789012345678",
            imagen: "https://via.placeholder.com/150?text=Zapatos+Casual"
        }
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.includes(searchTerm)
    );

    const handleCancel = () => {
        setShowModal(true);
    };

    const confirmCancel = () => {
        // Lógica para cancelar el pedido
        console.log("Pedido cancelado");
        setShowModal(false);
    };

    const handleClose = () => setShowModal(false);

    const handleAgregarProducto = (producto) => {
        setProductosSeleccionados((prevSeleccionados) => {
            const index = prevSeleccionados.findIndex(p => p.id === producto.id);
            if (index > -1) {
                const newSeleccionados = [...prevSeleccionados];
                newSeleccionados[index].cantidad += 1;
                return newSeleccionados;
            } else {
                return [...prevSeleccionados, { ...producto, cantidad: 1 }];
            }
        });
    };

    const handleEliminarProducto = (id) => {
        setProductosSeleccionados((prevSeleccionados) => 
            prevSeleccionados.filter(p => p.id !== id)
        );
    };

    return (
        <Container fluid className="">
            <Row className="mb-4">
                <Col md={8}>
                    {/* Barra de búsqueda */}
                    <InputGroup className="mb-4">
                        <FormControl
                            placeholder="Código, Referencia"
                            aria-label="Código, Referencia"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Button variant="outline-secondary">Buscar</Button>
                    </InputGroup>
                </Col>
                <Col md={4} className="d-flex justify-content-end align-items-center">
                    <Button variant="danger" onClick={handleCancel}>Cancelar</Button>
                </Col>
            </Row>

            <Row>
                <Col md={8} className="overflow-auto" style={{ maxHeight: '80vh' }}>
                    {/* Productos filtrados */}
                    <Row>
                        {filteredProducts.map((producto) => (
                            <Col md={4} key={producto.id} className="mb-4">
                                <Card className="shadow-sm border-0">
                                    <Card.Img variant="top" src={producto.imagen} />
                                    <Card.Body>
                                        <Card.Title className="mb-3">{producto.nombre}</Card.Title>
                                        <Card.Text className="text-muted">
                                            <strong>Precio:</strong> ${producto.precio.toLocaleString()}<br />
                                            <strong>Talla:</strong> {producto.talla}<br />
                                            <strong>Color:</strong> {producto.color}<br />
                                            <strong>Código:</strong> {producto.codigo}
                                        </Card.Text>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Badge bg={producto.inventario > 0 ? "success" : "danger"}>
                                                Inventario: {producto.inventario}
                                            </Badge>
                                            
                                        </div>
                                        <Button
                                            variant="outline-primary"
                                            className="w-100"
                                            disabled={producto.inventario === 0}
                                            onClick={() => handleAgregarProducto(producto)}
                                        >
                                            {producto.inventario > 0 ? "Agregar" : "Agotado"}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>

                <Col md={4} className="position-sticky" style={{ top: '0' }}>
                    {/* Resumen de la Venta */}
                    <Form>
                    <Form.Group className="mb-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
    <Form.Label>Productos Seleccionados:</Form.Label>
    {productosSeleccionados.length === 0 ? (
        <p>No se encuentran productos seleccionados</p>
    ) : (
        <ListGroup>
            {productosSeleccionados.map((producto) => (
                <ListGroup.Item key={producto.id} className="d-flex align-items-center">
                    <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                    />
                    <div className="d-flex flex-grow-1 justify-content-between align-items-center">
                        <span>{producto.nombre}</span>
  
                        <span>
                        Cantidad:
                            <FormControl
                                type="number"
                                value={producto.cantidad}
                                onChange={(e) => handlePrecioChange(producto.id, parseFloat(e.target.value))}
                                style={{ width: '100px' }}
                            />
                        </span>
                        <span>Precio: $ {producto.precio}</span>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarProducto(producto.id)}
                        >
                            x
                        </Button>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    )}
</Form.Group>


                        <Form.Group className="mb-3">
                            <Form.Label>Cliente:</Form.Label>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>venta tienda</span>
                                <Button variant="outline-secondary" size="sm">Cambiar</Button>
                            </div>
                            <div>C.C. 11111111111111</div>
                        </Form.Group>



                        <ListGroup>
                            <ListGroup.Item>Subtotal: $0</ListGroup.Item>
                            <ListGroup.Item>Impuesto Bolsa: $0</ListGroup.Item>
                            <ListGroup.Item>Descuento: $0</ListGroup.Item>
                            <ListGroup.Item>Total: $0</ListGroup.Item>
                        </ListGroup>
                        <Button variant="primary">Pagar</Button>
                    </Form>
                </Col>
            </Row>

            {/* Modal de confirmación */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas cancelar el pedido?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        No
                    </Button>
                    <Button variant="danger" onClick={confirmCancel}>
                        Sí, cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default VisualAgregarProductos;