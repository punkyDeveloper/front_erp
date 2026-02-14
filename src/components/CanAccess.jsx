import { usePermisos } from '../context/PermissionsContext';

const CanAccess = ({ permiso, children, fallback = null }) => {
  const { tienePermiso } = usePermisos();

  if (!tienePermiso(permiso)) {
    return fallback;
  }

  return children;
};

export default CanAccess;