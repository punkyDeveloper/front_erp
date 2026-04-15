import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PermissionsProvider } from './context/PermissionsContext';

import App from './App';
import Board from './Board';
import RegistrarUsuario from './registrarUsuarios';
import User from "./user/user";
import Pos from "./pos/pos";
import Time from "./time/Time";
import Configuracion from "./confuracion/configuracion";
import Chef from './chef/chef';
import Rol from './rol/rol';
import Permisos from './permisos/permisos';
import Administrador from './adminstrador/admin';
import Bienvenida from './bienvenida/bienvenida';
import Productos from './productos/productos';
import Mecanica from './mecanica/mecanica';
import Servicios from './servicio/servio';
import Ingresos from './ingreso/ingresos';
import Egresos from './egresos/egresos';
import Cierre from './cierres/cierres';
import Factucion from './facturacion/facturacion';
import Clientes from './clientes/clientes';
import Ventas   from './ventas/ventas';
import LibroContable from './facturacion/LibroContable';
import Calendario from './calendario/calendario';
import PrivateRoute from './components/PrivateRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <PermissionsProvider>
        <Routes>
          {/* Pública: login */}
          <Route path="/" element={<App />} />

          {/* Rutas protegidas */}
          <Route path="/bienvenida"           element={<PrivateRoute><Bienvenida /></PrivateRoute>} />
          <Route path="/dashboard"            element={<PrivateRoute><Board /></PrivateRoute>} />
          <Route path="/Usuarios"             element={<PrivateRoute><RegistrarUsuario /></PrivateRoute>} />
          <Route path="/user"                 element={<PrivateRoute><User /></PrivateRoute>} />
          <Route path="/Pos"                  element={<PrivateRoute><Pos /></PrivateRoute>} />
          <Route path="/Time"                 element={<PrivateRoute><Time /></PrivateRoute>} />
          <Route path="/configuracion"        element={<PrivateRoute><Configuracion /></PrivateRoute>} />
          <Route path="/cierre/chef"          element={<PrivateRoute><Chef /></PrivateRoute>} />
          <Route path="/config/role/rol"      element={<PrivateRoute><Rol /></PrivateRoute>} />
          <Route path="/config/role/permisos" element={<PrivateRoute><Permisos /></PrivateRoute>} />
          <Route path="/config/administrador" element={<PrivateRoute><Administrador /></PrivateRoute>} />
          <Route path="/productos"            element={<PrivateRoute><Productos /></PrivateRoute>} />
          <Route path="/mecanica"             element={<PrivateRoute><Mecanica /></PrivateRoute>} />
          <Route path="/servicios"            element={<PrivateRoute><Servicios /></PrivateRoute>} />
          <Route path="/ingresos"             element={<PrivateRoute><Ingresos /></PrivateRoute>} />
          <Route path="/egresos"              element={<PrivateRoute><Egresos /></PrivateRoute>} />
          <Route path="/cierres"              element={<PrivateRoute><Cierre /></PrivateRoute>} />
          <Route path="/facturacion"          element={<PrivateRoute><Factucion /></PrivateRoute>} />
          <Route path="/libro-contable"       element={<PrivateRoute><LibroContable /></PrivateRoute>} />
          <Route path="/clientes"             element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/ventas"               element={<PrivateRoute><Ventas /></PrivateRoute>} />
          <Route path="/calendario"           element={<PrivateRoute><Calendario /></PrivateRoute>} />
        </Routes>
      </PermissionsProvider>
    </Router>
  </React.StrictMode>
);