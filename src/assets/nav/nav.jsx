import { useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { usePermisos } from '../../context/PermissionsContext';

// ─── HOOK: localStorage-synced state ───────────────────────
const useStoredState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// ─── STYLES ────────────────────────────────────────────────
const navCSS = `
  .nav-sidebar {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #1e1e2d;
    color: #fff;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 2px 0 12px rgba(0,0,0,0.15);
    z-index: 100;
    position: relative;
    flex-shrink: 0;
  }

  .nav-sidebar a,
  .nav-sidebar a:visited {
    color: #c5c5d2;
    text-decoration: none;
  }

  .nav-header {
    padding: 18px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.02);
  }

  .nav-toggle {
    background: none;
    border: none;
    color: #8b8b9e;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-toggle:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }

  .nav-user-info h5 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }

  .nav-user-role {
    font-size: 0.72rem;
    color: #6b6b80;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }

  .nav-menu {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0;
    margin: 0;
    list-style: none;
  }

  .nav-menu::-webkit-scrollbar { width: 4px; }
  .nav-menu::-webkit-scrollbar-track { background: transparent; }
  .nav-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 11px 16px;
    cursor: pointer;
    color: #9d9dae;
    font-size: 0.88rem;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    gap: 12px;
    text-decoration: none;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.04);
    color: #e0e0ec;
  }

  .nav-item.active {
    background: rgba(79, 70, 229, 0.15);
    color: #a5b4fc;
    border-left-color: #6366f1;
    font-weight: 600;
  }

  .nav-item .nav-icon {
    width: 20px;
    text-align: center;
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  .nav-item .nav-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-item .nav-chevron {
    margin-left: auto;
    font-size: 0.65rem;
    transition: transform 0.25s;
    opacity: 0.5;
  }

  .nav-item .nav-chevron.open {
    transform: rotate(180deg);
  }

  .nav-submenu {
    list-style: none;
    padding: 0;
    margin: 0;
    background: rgba(0,0,0,0.15);
    overflow: hidden;
    animation: submenuIn 0.25s ease;
  }

  .nav-submenu .nav-item {
    padding-left: 48px;
    font-size: 0.84rem;
  }

  .nav-submenu .nav-submenu .nav-item {
    padding-left: 64px;
    font-size: 0.82rem;
  }

  @keyframes submenuIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .nav-section-label {
    padding: 16px 16px 6px;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #4a4a5e;
    font-weight: 700;
  }

  .nav-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 6px 14px;
  }

  .nav-footer {
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.1);
  }

  .nav-logout-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: rgba(239, 68, 68, 0.08);
    color: #f87171;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .nav-logout-btn:hover {
    background: rgba(239, 68, 68, 0.18);
    color: #fca5a5;
  }

  .nav-logout-btn .nav-icon {
    width: 20px;
    text-align: center;
    font-size: 0.9rem;
  }

  /* ─── COLLAPSED ─── */
  .nav-sidebar.collapsed { width: 64px !important; }
  .nav-sidebar.collapsed .nav-text,
  .nav-sidebar.collapsed .nav-chevron,
  .nav-sidebar.collapsed .nav-user-info,
  .nav-sidebar.collapsed .nav-section-label { display: none !important; }
  .nav-sidebar.collapsed .nav-item { justify-content: center; padding-left: 0; padding-right: 0; border-left: none; }
  .nav-sidebar.collapsed .nav-submenu .nav-item { padding-left: 0; }
  .nav-sidebar.collapsed .nav-logout-btn { justify-content: center; }
  .nav-sidebar.collapsed .nav-header { justify-content: center; }

  /* ─── MOBILE ─── */
  .nav-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99;
    animation: fadeIn 0.2s ease;
  }

  .nav-mobile-toggle {
    display: none;
    position: fixed;
    top: 14px;
    left: 14px;
    z-index: 98;
    background: #1e1e2d;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 768px) {
    .nav-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 260px !important;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
    }
    .nav-sidebar.collapsed { width: 260px !important; }
    .nav-sidebar.mobile-open { transform: translateX(0); }
    .nav-sidebar.mobile-open .nav-text,
    .nav-sidebar.mobile-open .nav-chevron,
    .nav-sidebar.mobile-open .nav-user-info,
    .nav-sidebar.mobile-open .nav-section-label { display: inline !important; }
    .nav-sidebar.mobile-open .nav-item { justify-content: flex-start !important; padding-left: 16px !important; border-left: 3px solid transparent; }
    .nav-sidebar.mobile-open .nav-submenu .nav-item { padding-left: 48px !important; }
    .nav-sidebar.mobile-open .nav-logout-btn { justify-content: flex-start !important; }
    .nav-sidebar.mobile-open .nav-header { justify-content: flex-start !important; }
    .nav-overlay.show { display: block; }
    .nav-mobile-toggle { display: flex; }
  }
`;

// ─── COMPONENT ─────────────────────────────────────────────
const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tienePermiso, recargarPermisos } = usePermisos();

  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useStoredState('nav_collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useStoredState('nav_open_menus', {});

  // ── Cargar user desde localStorage ──
  const cargarUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch { /* ignore */ }
  }, []);

  // Cargar al montar
  useEffect(() => {
    cargarUser();
  }, [cargarUser]);

  // ══════════════════════════════════════════════════════════
  // FIX: Escuchar evento 'login' para refrescar sin recargar
  // En tu componente de Login, después de guardar el token y user:
  //   localStorage.setItem('token', data.token);
  //   localStorage.setItem('user', JSON.stringify(data.user));
  //   window.dispatchEvent(new Event('login'));  ← AGREGAR ESTA LÍNEA
  //   navigate('/dashboard');
  // ══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleLogin = () => {
      cargarUser();
      if (recargarPermisos) recargarPermisos();
    };

    window.addEventListener('login', handleLogin);
    window.addEventListener('storage', handleLogin);

    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('storage', handleLogin);
    };
  }, [cargarUser, recargarPermisos]);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const toggleMenu = useCallback((key) => {
    if (collapsed && !mobileOpen) return;
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  }, [collapsed, mobileOpen, setOpenMenus]);

  const isOpen = (key) => openMenus[key] || false;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const sidebarClass = [
    'nav-sidebar',
    collapsed ? 'collapsed' : '',
    mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ');

  const showText = !collapsed || mobileOpen;

  return (
    <>
      <style>{navCSS}</style>

      {/* Mobile hamburger */}
      <button className="nav-mobile-toggle" onClick={() => setMobileOpen(true)}>
        <i className="fas fa-bars"></i>
      </button>

      {/* Mobile overlay */}
      <div
        className={`nav-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={sidebarClass} style={{ width: collapsed ? 64 : 250 }}>

        {/* HEADER */}
        <div className="nav-header">
          <button className="nav-toggle" onClick={() => {
            if (window.innerWidth <= 768) {
              setMobileOpen(false);
            } else {
              setCollapsed(!collapsed);
            }
          }}>
            <i className={`fas fa-${collapsed && !mobileOpen ? 'angles-right' : 'bars'}`}></i>
          </button>
          <div className="nav-user-info">
            <h5>{user?.nombreCompany || 'Panel'}</h5>
            <div className="nav-user-role">{user?.rol || 'Usuario'}</div>
          </div>
        </div>

        {/* MENU */}
        <ul className="nav-menu">

          {/* ══════════ Principal ══════════ */}
          {showText && <div className="nav-section-label">Principal</div>}

          {tienePermiso('ver_dashboard') && (
            <li>
              <NavLink to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} title="Dashboard">
                <i className="fas fa-chart-line nav-icon"></i>
                <span className="nav-text">Dashboard</span>
              </NavLink>
            </li>
          )}

          {tienePermiso('ver_servicios') && (
            <li>
              <NavLink to="/servicios" className={`nav-item ${isActive('/servicios') ? 'active' : ''}`} title="Servicios">
                <i className="fas fa-tags nav-icon"></i>
                <span className="nav-text">Servicios</span>
              </NavLink>
            </li>
          )}

          {tienePermiso('ver_productos') && (
            <li>
              <NavLink to="/productos" className={`nav-item ${isActive('/productos') ? 'active' : ''}`} title="Productos">
                <i className="fas fa-box-open nav-icon"></i>
                <span className="nav-text">Productos</span>
              </NavLink>
            </li>
          )}

          {tienePermiso('ver_time') && (
            <li>
              <NavLink to="/time" className={`nav-item ${isActive('/time') ? 'active' : ''}`} title="Time">
                <i className="fas fa-clock nav-icon"></i>
                <span className="nav-text">Time</span>
              </NavLink>
            </li>
          )}

          {tienePermiso('ver_pos') && (
            <li>
              <NavLink to="/pos" className={`nav-item ${isActive('/pos') ? 'active' : ''}`} title="POS">
                <i className="fas fa-cash-register nav-icon"></i>
                <span className="nav-text">POS</span>
              </NavLink>
            </li>
          )}

          {/* ══════════ Finanzas ══════════ */}
          {tienePermiso('ver_movimientos') && (
            <>
              {showText && <div className="nav-section-label">Finanzas</div>}

              <li>
                <NavLink to="/ingresos" className={`nav-item ${isActive('/ingresos') ? 'active' : ''}`} title="Ingresos">
                  <i className="fas fa-arrow-trend-up nav-icon" style={{ color: '#10b981' }}></i>
                  <span className="nav-text">Ingresos</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/egresos" className={`nav-item ${isActive('/egresos') ? 'active' : ''}`} title="Egresos">
                  <i className="fas fa-arrow-trend-down nav-icon" style={{ color: '#ef4444' }}></i>
                  <span className="nav-text">Egresos</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ══════════ Operaciones ══════════ */}
          {tienePermiso('ver_cierre') && (
            <>
              {showText && <div className="nav-section-label">Operaciones</div>}
              <li>
                <div className="nav-item" onClick={() => toggleMenu('cierre')} title="Cierre">
                  <i className="fas fa-file-invoice-dollar nav-icon"></i>
                  <span className="nav-text">Cierre</span>
                  <i className={`fas fa-chevron-down nav-chevron ${isOpen('cierre') ? 'open' : ''}`}></i>
                </div>
                {isOpen('cierre') && showText && (
                  <ul className="nav-submenu">
                    {tienePermiso('ver_cierre_chef') && (
                      <li>
                        <NavLink to="/cierre/chef" className={`nav-item ${isActive('/cierre/chef') ? 'active' : ''}`}>
                          <i className="fas fa-utensils nav-icon"></i>
                          <span className="nav-text">Chef</span>
                        </NavLink>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            </>
          )}

          {/* ══════════ Mecánica ══════════ */}
          {tienePermiso('ver_mecanica') && (
            <>
              {showText && <div className="nav-section-label">Mecánica</div>}
              <li>
                <NavLink to="/mecanica" className={`nav-item ${isActive('/mecanica') ? 'active' : ''}`} title="Mecánica">
                  <i className="fas fa-wrench nav-icon"></i>
                  <span className="nav-text">Mecánica</span>
                </NavLink>
              </li>
            </>
          )}

          {/* ══════════ Usuarios ══════════ */}
          {tienePermiso('ver_usuarios') && (
            <>
              {showText && <div className="nav-section-label">Usuarios</div>}
              <li>
                <div className="nav-item" onClick={() => toggleMenu('users')} title="Usuarios">
                  <i className="fas fa-users nav-icon"></i>
                  <span className="nav-text">Usuarios</span>
                  <i className={`fas fa-chevron-down nav-chevron ${isOpen('users') ? 'open' : ''}`}></i>
                </div>
                {isOpen('users') && showText && (
                  <ul className="nav-submenu">
                    <li>
                      <NavLink to="/user" className={`nav-item ${isActive('/user') ? 'active' : ''}`}>
                        <i className="fas fa-user-circle nav-icon"></i>
                        <span className="nav-text">Mi Perfil</span>
                      </NavLink>
                    </li>
                    {tienePermiso('ver_clientes') && (
                      <li>
                        <NavLink to="/clientes" className={`nav-item ${isActive('/clientes') ? 'active' : ''}`}>
                          <i className="fas fa-address-book nav-icon"></i>
                          <span className="nav-text">Clientes</span>
                        </NavLink>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            </>
          )}

          {/* ══════════ Configuración ══════════ */}
          {(tienePermiso('ver_roles') || tienePermiso('ver_restaurante') || tienePermiso('ver_bodega') || tienePermiso('crear_usuarios')) && (
            <>
              {showText && <div className="nav-divider"></div>}
              {showText && <div className="nav-section-label">Configuración</div>}
              <li>
                <div className="nav-item" onClick={() => toggleMenu('config')} title="Config">
                  <i className="fas fa-gear nav-icon"></i>
                  <span className="nav-text">Configuración</span>
                  <i className={`fas fa-chevron-down nav-chevron ${isOpen('config') ? 'open' : ''}`}></i>
                </div>
                {isOpen('config') && showText && (
                  <ul className="nav-submenu">

                    {tienePermiso('ver_roles') && (
                      <li>
                        <div className="nav-item" onClick={() => toggleMenu('roles')}>
                          <i className="fas fa-shield-halved nav-icon"></i>
                          <span className="nav-text">Roles</span>
                          <i className={`fas fa-chevron-down nav-chevron ${isOpen('roles') ? 'open' : ''}`}></i>
                        </div>
                        {isOpen('roles') && (
                          <ul className="nav-submenu">
                            <li>
                              <NavLink to="/config/role/rol" className={`nav-item ${isActive('/config/role/rol') ? 'active' : ''}`}>
                                <i className="fas fa-user-tag nav-icon"></i>
                                <span className="nav-text">Gestión de Roles</span>
                              </NavLink>
                            </li>
                            {tienePermiso('ver_permisos') && (
                              <li>
                                <NavLink to="/config/role/permisos" className={`nav-item ${isActive('/config/role/permisos') ? 'active' : ''}`}>
                                  <i className="fas fa-key nav-icon"></i>
                                  <span className="nav-text">Permisos</span>
                                </NavLink>
                              </li>
                            )}
                          </ul>
                        )}
                      </li>
                    )}

                    {tienePermiso('ver_restaurante') && (
                      <li>
                        <NavLink to="/config/restaurante" className={`nav-item ${isActive('/config/restaurante') ? 'active' : ''}`}>
                          <i className="fas fa-utensils nav-icon"></i>
                          <span className="nav-text">Restaurante</span>
                        </NavLink>
                      </li>
                    )}

                    {tienePermiso('ver_bodega') && (
                      <li>
                        <NavLink to="/config/bodega" className={`nav-item ${isActive('/config/bodega') ? 'active' : ''}`}>
                          <i className="fas fa-warehouse nav-icon"></i>
                          <span className="nav-text">Bodega</span>
                        </NavLink>
                      </li>
                    )}

                    {tienePermiso('ver_administrador') && (
                      <li>
                        <NavLink to="/config/administrador" className={`nav-item ${isActive('/config/administrador') ? 'active' : ''}`}>
                          <i className="fas fa-user-plus nav-icon"></i>
                          <span className="nav-text">Nuevo Admin</span>
                        </NavLink>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            </>
          )}
        </ul>

        {/* FOOTER */}
        <div className="nav-footer">
          <button className="nav-logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <i className="fas fa-right-from-bracket nav-icon"></i>
            <span className="nav-text">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Nav;