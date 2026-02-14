import { createContext, useContext, useState, useEffect } from 'react';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermisos();
  }, []);

  const fetchPermisos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPermisos([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/me/permisos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': 'mi_clave_secreta_12345'
        }
      });

      const data = await response.json();
      setPermisos(data.permisos || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setPermisos([]);
      setLoading(false);
    }
  };

  const tienePermiso = (permiso) => {
    return permisos.includes(permiso);
  };

  if (loading) {
    return <div>Cargando permisos...</div>;
  }
const recargarPermisos = () => {
  setLoading(true);
  fetchPermisos();
};
  return (
    <PermissionsContext.Provider value={{ permisos, tienePermiso, loading, recargarPermisos }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermisos = () => useContext(PermissionsContext);