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


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <PermissionsProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/bienvenida" element={<Bienvenida />} />
          <Route path="/dashboard" element={<Board />} />
          <Route path="/Usuarios" element={<RegistrarUsuario />} />
          <Route path="/user" element={<User />} />
          <Route path="/Pos" element={<Pos />} />
          <Route path="/Time" element={<Time />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/cierre/chef" element={<Chef />} />
          <Route path="/config/role/rol" element={<Rol />} />
          <Route path="/config/role/permisos" element={<Permisos />} />
          <Route path="/config/administrador" element={<Administrador />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/mecanica" element={<Mecanica />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/egresos" element={<Egresos />} />
          <Route path="/cierres" element={<Cierre />} />
        </Routes>
      </PermissionsProvider>
    </Router>
  </React.StrictMode>
);