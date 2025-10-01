

import NavAdmin from "../assets/nav/navPos";
import VisualAgregarPorductos from "./agregarProductos";

import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

export default function Pos() {
  const [isLoading, setLoading] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);

  useEffect(() => {
    function simulateNetworkRequest() {
      return new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (isLoading) {
      simulateNetworkRequest().then(() => {
        setLoading(false);
        setShowNewOrder(true); // Mostrar el nuevo componente una vez que termine de cargar
      });
    }
  }, [isLoading]);

  const handleClick = () => setLoading(true);

  return (
    <div>
      <div>
        <NavAdmin />
      </div>
      <div className="m-5">
        {!showNewOrder ? (
          <Button
            variant="secondary"
            disabled={isLoading}
            onClick={!isLoading ? handleClick : null}
          >
            {isLoading ? 'Loading…' : 'Crear nuevo pedido'}
          </Button>
        ) : (
          <VisualAgregarPorductos />
        )}
      </div>
    </div>
  );
}