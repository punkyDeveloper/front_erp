import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermisos = useCallback(async () => {
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

      if (!response.ok) {
        throw new Error('Error al obtener permisos');
      }

      const data = await response.json();
      setPermisos(data.permisos || []);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando permisos:', error);
      setPermisos([]);
      setLoading(false);
    }
  }, []);

  // Cargar permisos al montar
  useEffect(() => {
    fetchPermisos();
  }, [fetchPermisos]);

  // 🔥 CRÍTICO: Escuchar evento 'login' para recargar permisos
  useEffect(() => {
    const handleLogin = () => {
      console.log('🔄 Evento login detectado - Recargando permisos...');
      setLoading(true);
      fetchPermisos();
    };

    window.addEventListener('login', handleLogin);
    window.addEventListener('storage', handleLogin);

    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('storage', handleLogin);
    };
  }, [fetchPermisos]);

  const tienePermiso = useCallback((permiso) => {
    return permisos.includes(permiso);
  }, [permisos]);

  const recargarPermisos = useCallback(() => {
    console.log('🔄 Recargando permisos manualmente...');
    setLoading(true);
    fetchPermisos();
  }, [fetchPermisos]);

  // Mostrar loading solo en la carga inicial
  if (loading && permisos.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#1e1e2d',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
          <div>Cargando permisos...</div>
        </div>
      </div>
    );
  }

  return (
    <PermissionsContext.Provider value={{ 
      permisos, 
      tienePermiso, 
      loading, 
      recargarPermisos 
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermisos = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermisos debe ser usado dentro de PermissionsProvider');
  }
  return context;
};