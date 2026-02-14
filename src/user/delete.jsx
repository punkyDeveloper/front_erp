import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function DeleteUser({ userId, usuario, onDeleted }) {
  const [show, setShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/usuario/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Error al eliminar usuario');
      
      alert('✅ Usuario eliminado correctamente');
      handleClose();
      
      // Recargar la página completa
      window.location.reload();
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('❌ No se pudo eliminar el usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button className='m-1' size="sm" variant="danger" onClick={handleShow}>
        Eliminar
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar al usuario {usuario.nombre} {usuario.apellido}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeleteUser;