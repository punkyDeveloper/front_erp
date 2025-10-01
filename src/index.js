import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
import Bienvenida from './bienvenida/bienvenida';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/bienvenida" element={<Bienvenida />} />
        <Route path="/doard" element={<Board />} />
        <Route path="/Usuarios" element={<RegistrarUsuario />} />
        <Route path="/user" element={<User />} />
        <Route path="/Pos" element={<Pos />} />
        <Route path="/Time" element={<Time />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/cierre/chef" element={<Chef />} />
        <Route path="/config/role/rol" element={<Rol />} />
        <Route path="/config/role/permisos" element={<Permisos />} />


      </Routes>
    </Router>
  </React.StrictMode>
  </>
);
