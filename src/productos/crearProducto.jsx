import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

function CrearProducto({ onProductCreated }) {
  const [show, setShow] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [compania, setCompania] = useState("");
  const [companias, setCompanias] = useState([]);

  const [venta, setVenta] = useState(false);
  const [alquiler, setAlquiler] = useState(false);

  const [imagenFile, setImagenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [uploading, setUploading] = useState(false);

  const maxFileSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

// cargar compañias (opcional) revisar para enviarlo desde una coockie a el backend
  // useEffect(() => {
  //   // Cargar compañías desde API (ajusta la URL)
  //   const fetchCompanias = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3001/companias");
  //       if (!res.ok) throw new Error("No hay compañias");
  //       const data = await res.json();
  //       setCompanias(Array.isArray(data) ? data : []);
  //     } catch (err) {
  //       setCompanias([]);
  //     }
  //   };
  //   fetchCompanias();
  // }, []);

  // limpiar preview al desmontar o cambiar imagen
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (e) {}
      }
    };
  }, [previewUrl]);

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setStock("");
    setCompania("");
    setVenta(false);
    setAlquiler(false);
    setImagenFile(null);
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
      setPreviewUrl(null);
    }
    setUploading(false);
  };

  const handleShow = () => setShow(true);
  const handleClose = () => {
    if (uploading) return;
    resetForm();
    setShow(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImagenFile(null);
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (e) {}
        setPreviewUrl(null);
      }
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de archivo no permitido. Usa jpg, png o gif.");
      e.target.value = null;
      return;
    }

    if (file.size > maxFileSize) {
      alert("El archivo supera 2MB. Selecciona otro archivo.");
      e.target.value = null;
      return;
    }

    setImagenFile(file);
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return alert("Nombre requerido");
    if (!descripcion.trim()) return alert("Descripción requerida");
    if (!precio || isNaN(precio)) return alert("Precio inválido");
    if (!stock || isNaN(stock)) return alert("Stock inválido");
    if (!imagenFile) return alert("Debes adjuntar una imagen del producto");

    try {
      setUploading(true);

      const formData = new FormData();
      // 👇 los nombres deben coincidir con el backend
      formData.append("name", nombre);
      formData.append("description", descripcion);
      formData.append("price", String(precio));
      formData.append("stock", String(stock));
      formData.append("compania", compania);
      formData.append("venta", String(venta));
      formData.append("alquiler", String(alquiler));
      formData.append("img", imagenFile); // 👈 coincide con upload.single("img")
      console.log("Enviando datos:", {
        nombre,
        descripcion,
        precio,
        stock,
        compania,
        venta,
        alquiler,
        imagenFile,
      });

      const resp = await fetch("http://localhost:3001/v1/productos", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => null);
        throw new Error(text || "Error en la API");
      }

      const created = await resp.json();

      if (typeof onProductCreated === "function") onProductCreated(created);

      alert("✅ Producto creado correctamente");
      resetForm();
      setShow(false);
    } catch (err) {
      console.error("Error subiendo producto:", err);
      alert("❌ Error al subir producto: " + (err.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        ➕ Crear producto
      </Button>

      <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={!uploading}>
        <Modal.Header closeButton={!uploading}>
          <Modal.Title>Registrar producto</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSave}>
            <div className="row">
              <div className="col-md-8">
                <Form.Group className="mb-3" controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del producto"
                    disabled={uploading}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="descripcion">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción breve"
                    disabled={uploading}
                    required
                  />
                </Form.Group>

                <div className="row">
                  <div className="col-md-4">
                    <Form.Group className="mb-3" controlId="precio">
                      <Form.Label>Precio</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        placeholder="0.00"
                        disabled={uploading}
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group className="mb-3" controlId="stock">
                      <Form.Label>Stock</Form.Label>
                      <Form.Control
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        disabled={uploading}
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group className="mb-3" controlId="compania">
                      <Form.Label>Compañía</Form.Label>
                      {companias && companias.length > 0 ? (
                        <Form.Select
                          value={compania}
                          onChange={(e) => setCompania(e.target.value)}
                          disabled={uploading}
                        >
                          <option value="">Selecciona compañía</option>
                          {companias.map((c) => (
                            <option key={c._id || c.id || c.nombre} value={c._id || c.id || c.nombre}>
                              {c.nombre || c.name || c.razonSocial || (c._id || c.id)}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type="text"
                          value={compania}
                          onChange={(e) => setCompania(e.target.value)}
                          placeholder="Compañía (texto o id)"
                          disabled={uploading}
                        />
                      )}
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex gap-3 mb-3">
                  <Form.Check
                    type="checkbox"
                    id="ventaCheck"
                    label="Venta"
                    checked={venta}
                    onChange={(e) => setVenta(e.target.checked)}
                    disabled={uploading}
                  />
                  <Form.Check
                    type="checkbox"
                    id="alquilerCheck"
                    label="Alquiler"
                    checked={alquiler}
                    onChange={(e) => setAlquiler(e.target.checked)}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3" controlId="imagen">
                  <Form.Label>Imagen (max 2MB)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </Form.Group>

                {previewUrl && (
                  <div className="mb-3 text-center">
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{ maxWidth: "100%", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}
                    />
                  </div>
                )}

                {uploading && (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" /> <span>Subiendo...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleClose} disabled={uploading} className="me-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" /> Subiendo...
                  </>
                ) : (
                  "Guardar producto"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CrearProducto;
