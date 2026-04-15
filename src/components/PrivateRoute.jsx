import { Navigate } from 'react-router-dom';

/**
 * Limpia todos los datos de sesión del localStorage.
 */
export const clearSession = () => {
  localStorage.clear();
};

/**
 * Verifica si un JWT está vencido.
 * Retorna true si está vencido o es inválido.
 */
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp está en segundos, Date.now() en ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Si no se puede decodificar, se considera inválido
  }
};

/**
 * Protege rutas que requieren autenticación.
 * Si no hay token o está vencido, limpia el localStorage y redirige al login (/).
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    clearSession();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
