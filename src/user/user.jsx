import Nav from '../assets/nav/nav';
import RegistrarTrabajador from './registrar';
import TablaTrabajadores from './table';
import { useState, useEffect } from 'react';

const pageCSS = `
  .trabajadores-page {
    display: flex;
    height: 100vh;
    background: #f0f2f8;
    font-family: 'Segoe UI', sans-serif;
  }

  .trabajadores-content {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    background: #f0f2f8;
  }

  .trabajadores-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 14px;
  }

  .trabajadores-title {
    display: flex;
    flex-direction: column;
  }

  .trabajadores-title h1 {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 800;
    color: #1e1e2d;
    letter-spacing: -0.02em;
  }

  .trabajadores-title span {
    font-size: 0.85rem;
    color: #8b8b9e;
    margin-top: 3px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.05);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .stat-icon.total   { background: rgba(99,102,241,0.12); color: #6366f1; }
  .stat-icon.activos { background: rgba(16,185,129,0.12); color: #10b981; }
  .stat-icon.inactivos { background: rgba(239,68,68,0.12); color: #ef4444; }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-info .stat-num {
    font-size: 1.6rem;
    font-weight: 800;
    color: #1e1e2d;
    line-height: 1;
  }

  .stat-info .stat-label {
    font-size: 0.78rem;
    color: #8b8b9e;
    margin-top: 4px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .trabajadores-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.05);
    overflow: hidden;
  }

  .trabajadores-card-header {
    padding: 18px 24px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .trabajadores-card-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1e1e2d;
  }

  .trabajadores-card-body {
    padding: 0;
  }

  @media (max-width: 768px) {
    .trabajadores-content { padding: 16px; padding-top: 60px; }
    .trabajadores-title h1 { font-size: 1.3rem; }
  }
`;

export default function User() {
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': 'mi_clave_secreta_12345'
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      const activos = data.filter(u => u.estado).length;
      setStats({ total: data.length, activos, inactivos: data.length - activos });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      <style>{pageCSS}</style>
      <div className="trabajadores-page">
        <Nav />
        <div className="trabajadores-content">

          {/* Header */}
          <div className="trabajadores-header">
            <div className="trabajadores-title">
              <h1>Gestión de Trabajadores</h1>
              <span>Administra el personal de tu empresa</span>
            </div>
            <RegistrarTrabajador onCreated={handleRefresh} />
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total"><i className="fas fa-users"></i></div>
              <div className="stat-info">
                <span className="stat-num">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon activos"><i className="fas fa-user-check"></i></div>
              <div className="stat-info">
                <span className="stat-num">{stats.activos}</span>
                <span className="stat-label">Activos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon inactivos"><i className="fas fa-user-slash"></i></div>
              <div className="stat-info">
                <span className="stat-num">{stats.inactivos}</span>
                <span className="stat-label">Inactivos</span>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="trabajadores-card">
            <div className="trabajadores-card-header">
              <h2><i className="fas fa-list" style={{ marginRight: 8, color: '#6366f1' }}></i>Lista de Trabajadores</h2>
            </div>
            <div className="trabajadores-card-body">
              <TablaTrabajadores key={refreshKey} onUpdated={handleRefresh} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
