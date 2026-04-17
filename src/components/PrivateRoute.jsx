import { Navigate } from 'react-router-dom';
import { usePermisos } from '../context/PermissionsContext';

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
 * Protege rutas que requieren autenticación y opcionalmente un permiso específico.
 * Si no hay token o está vencido, redirige al login (/).
 * Si se pasa `permission` y el usuario no lo tiene, redirige a /bienvenida.
 */
const PrivateRoute = ({ children, permission }) => {
  const token = localStorage.getItem('token');
  const { tienePermiso } = usePermisos();

  if (!token || isTokenExpired(token)) {
    clearSession();
    return <Navigate to="/" replace />;
  }

  if (permission && !tienePermiso(permission)) {
    return <Navigate to="/bienvenida" replace />;
  }

  return children;
};

export default PrivateRoute;
