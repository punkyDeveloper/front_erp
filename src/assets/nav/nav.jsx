import React, { useState } from 'react';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { NavLink } from 'react-router-dom';

const Nav = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isRoleOpen, setIsRolesOpen] = useState(false)
  const [isChefOpne, setISChefOpne] = useState(false)
  const toggleConfigMenu = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  const toggleUserMenu = () => {
    setIsUserOpen(!isUserOpen);
  };
  const toggleRoleMenu = () => {
    setIsRolesOpen(!isRoleOpen)
  }
  const toggleChef = () => {
    setISChefOpne(!isChefOpne)
  }

  return (
    <>
      <div style={{ display: 'flex', height: '100vh' }}>
        <CDBSidebar textColor="#fff" backgroundColor="#333">
          <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
            <a href="/" className="text-decoration-none" style={{ color: 'inherit' }}>
              name
            </a>
          </CDBSidebarHeader>

          <CDBSidebarContent className="sidebar-content">
            <CDBSidebarMenu>
              <NavLink exact to="/doard" activeClassName="activeClicked">
                <CDBSidebarMenuItem  icon="columns">Dashboard</CDBSidebarMenuItem>
                
              </NavLink>              
              <NavLink exact to="/productos" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="shopping-bag">Productos</CDBSidebarMenuItem>
              </NavLink>
              <NavLink exact to="/Time" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="table">Time</CDBSidebarMenuItem>
              </NavLink>
              <div>

              <CDBSidebarMenuItem
                  fas icon="lock" 
                  onClick={toggleChef}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Cierre
                  <i className={`m-3 fa ${isChefOpne ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                </CDBSidebarMenuItem>
                {isChefOpne && (
                  <div style={{ paddingLeft: '20px' }}>
              <NavLink exact to="/cierre/chef" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="hamburger">Chef</CDBSidebarMenuItem>
              </NavLink>
                  </div>
                )}
              </div>

              {/* User con Menú Desplegable */}
              <div>
                <CDBSidebarMenuItem
                  icon="user"
                  onClick={toggleUserMenu}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  User
                  <i className={`m-3 fa ${isUserOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                </CDBSidebarMenuItem>
                {isUserOpen && (
                  <div style={{ paddingLeft: '20px' }}>
                    <NavLink exact to="/user" activeClassName="activeClicked">
                      <CDBSidebarMenuItem icon="user-circle">Profile</CDBSidebarMenuItem>
                    </NavLink>
                    <NavLink exact to="#" activeClassName="activeClicked">
                      <CDBSidebarMenuItem icon="user-circle">Clientes</CDBSidebarMenuItem>
                    </NavLink>
                   
                  </div>
                )}
              </div>
              <NavLink exact to="/Pos" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="shopping-cart">POS</CDBSidebarMenuItem>
              
            </NavLink>
              {/* Config con Menú Desplegable */}
              <div>
                <CDBSidebarMenuItem
                  icon="cog"
                  onClick={toggleConfigMenu}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Config
                  <i className={`m-3 fa ${isConfigOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                </CDBSidebarMenuItem>
                {isConfigOpen && (
                  <div style={{ paddingLeft: '20px' }}>
                    <div>
                    <CDBSidebarMenuItem
                     icon="user-cog"
                      onClick={toggleRoleMenu}
                     style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      role
                      <i className={`m-3 fa ${isRoleOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                    </CDBSidebarMenuItem>
                    {isRoleOpen && (
                      <div style={{ paddingLeft: '20px' }}>
                        <NavLink exact to="/config/role/rol" activeClassName="activeClicked">
                          <CDBSidebarMenuItem >Rol</CDBSidebarMenuItem>
                        </NavLink>
                        <NavLink exact to="/config/role/permisos" activeClassName="activeClicked">
                          <CDBSidebarMenuItem >Permisos</CDBSidebarMenuItem>
                        </NavLink>
                        </div>
                    )}
                    </div>
                    <NavLink exact to="#" activeClassName="activeClicked">
                      <CDBSidebarMenuItem icon="wrench">Restaurante</CDBSidebarMenuItem>
                    </NavLink>
                    <NavLink exact to="#" activeClassName="activeClicked">
                      <CDBSidebarMenuItem icon="sliders-h">Bodega</CDBSidebarMenuItem>
                    </NavLink>
                    <NavLink exact to="/config/administrador" activeClassName="activeClicked">
                      <CDBSidebarMenuItem icon="user-circle">Nuevo administrador</CDBSidebarMenuItem>
                    </NavLink>
                  </div>
                )}
              </div>
            </CDBSidebarMenu>
          </CDBSidebarContent>

          <CDBSidebarFooter style={{ textAlign: 'center' }}>
            <div>
              <CDBSidebarMenu>
                <NavLink exact to="/" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="sign-out-alt">Salir</CDBSidebarMenuItem>
                </NavLink>
              </CDBSidebarMenu>
            </div>
          </CDBSidebarFooter>
        </CDBSidebar>
      </div>
    </>
  );
};

export default Nav;
