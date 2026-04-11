import { Navigate } from 'react-router-dom';

/**
 * Protege rutas que requieren autenticación.
 * Si no hay token en localStorage redirige al login (/).
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
