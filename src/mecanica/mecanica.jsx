import { useState, useEffect } from "react";
import Nav from '../assets/nav/nav';

const INITIAL_DATA = [
  {
    id: 1,
    cedula: "1017234567",
    placa: "ABC-123",
    vehiculo: "Toyota Corolla 2022",
    tipo: "Preventivo",
    descripcion: "Cambio de aceite y filtros",
    kilometraje: 15000,
    fecha: "2026-01-15",
    estado: "Completado",
    costo: 185000,
    taller: "AutoServicio Express",
    servicios: ["Cambio de aceite", "Cambio de filtros"],
  },
  {
    id: 2,
    cedula: "1039876543",
    placa: "DEF-456",
    vehiculo: "Mazda CX-5 2023",
    tipo: "Correctivo",
    descripcion: "Reemplazo de pastillas de freno delanteras",
    kilometraje: 32000,
    fecha: "2026-02-03",
    estado: "En proceso",
    costo: 420000,
    taller: "FrenoSeguro Ltda",
    servicios: ["Cambio de pastillas de freno", "Cambio de discos de freno"],
  },
  {
    id: 3,
    cedula: "1152345678",
    placa: "GHI-789",
    vehiculo: "Chevrolet Onix 2021",
    tipo: "Preventivo",
    descripcion: "Revisión general + alineación y balanceo",
    kilometraje: 45000,
    fecha: "2026-02-10",
    estado: "Pendiente",
    costo: 290000,
    taller: "MegaTaller S.A.",
    servicios: ["Alineación y balanceo", "Cambio de aceite", "Cambio de filtros"],
  },
  {
    id: 4,
    cedula: "1017234567",
    placa: "JKL-012",
    vehiculo: "Renault Duster 2020",
    tipo: "Correctivo",
    descripcion: "Cambio de batería y revisión eléctrica",
    kilometraje: 58000,
    fecha: "2025-12-20",
    estado: "Completado",
    costo: 350000,
    taller: "ElectroAuto Center",
    servicios: ["Cambio de batería", "Revisión eléctrica"],
  },
  {
    id: 5,
    cedula: "1098765432",
    placa: "MNO-345",
    vehiculo: "Kia Sportage 2024",
    tipo: "Preventivo",
    descripcion: "Primera revisión de garantía",
    kilometraje: 5000,
    fecha: "2026-02-08",
    estado: "Completado",
    costo: 0,
    taller: "Kia Concesionario Oficial",
    servicios: ["Cambio de aceite", "Cambio de filtros", "Escaneo computarizado"],
  },
];

const TIPOS = ["Preventivo", "Correctivo"];
const ESTADOS = ["Pendiente", "En proceso", "Completado"];

const SERVICIOS = [
  "Cambio de aceite",
  "Cambio de filtros",
  "Alineación y balanceo",
  "Cambio de pastillas de freno",
  "Cambio de discos de freno",
  "Cambio de batería",
  "Revisión eléctrica",
  "Cambio de llantas",
  "Cambio de correa de distribución",
  "Revisión de suspensión",
  "Cambio de amortiguadores",
  "Cambio de bujías",
  "Lavado de inyectores",
  "Recarga de aire acondicionado",
  "Cambio de líquido de frenos",
  "Cambio de refrigerante",
  "Revisión de transmisión",
  "Cambio de embrague",
  "Escaneo computarizado",
  "Revisión técnico-mecánica",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

const estadoColor = (estado) => {
  const map = {
    Completado: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
    "En proceso": { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
    Pendiente: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  };
  return map[estado] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
};

const tipoIcon = (tipo) => (tipo === "Preventivo" ? "🔧" : "⚠️");

// ─── STYLES ────────────────────────────────────────────────
const styles = {
  app: {
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    background: "#FAFAFA",
    minHeight: "100vh",
    color: "#1A1A2E",
  },
  header: {
    background: "#FFFFFF",
    borderBottom: "1px solid #E8E8ED",
    padding: "24px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(12px)",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "linear-gradient(135deg, #1A1A2E 0%, #3D3D6B 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFF",
    fontSize: 18,
    fontWeight: 700,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#1A1A2E",
  },
  logoSub: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginTop: 2,
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 40px 60px",
    overflow: "hidden",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    padding: "22px 24px",
    border: "1px solid #F0F0F5",
    transition: "box-shadow 0.2s ease",
  },
  statLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#9CA3AF",
    fontWeight: 600,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#1A1A2E",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E8E8ED",
    borderRadius: 10,
    padding: "10px 16px",
    gap: 10,
    flex: 1,
    maxWidth: 400,
    transition: "border-color 0.2s",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#1A1A2E",
    background: "transparent",
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
  },
  filterGroup: {
    display: "flex",
    gap: 8,
  },
  filterBtn: (active) => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: active ? "1.5px solid #1A1A2E" : "1px solid #E8E8ED",
    background: active ? "#1A1A2E" : "#FFFFFF",
    color: active ? "#FFFFFF" : "#6B7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'DM Sans', sans-serif",
  }),
  btnPrimary: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #1A1A2E 0%, #3D3D6B 100%)",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "opacity 0.2s, transform 0.15s",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "-0.01em",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    background: "#FFFFFF",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#9CA3AF",
    fontWeight: 700,
    borderBottom: "1px solid #F0F0F5",
    background: "#FAFAFC",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 16px",
    fontSize: 14,
    borderBottom: "1px solid #F7F7FA",
    verticalAlign: "middle",
  },
  trHover: {
    transition: "background 0.15s ease",
    cursor: "pointer",
  },
  badge: (colors) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
  }),
  actionBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px 8px",
    borderRadius: 6,
    fontSize: 16,
    transition: "background 0.15s",
    lineHeight: 1,
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 560,
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "36px 40px 32px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
    animation: "slideUp 0.3s ease",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 28,
    color: "#1A1A2E",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6B7280",
  },
  formInput: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #E8E8ED",
    fontSize: 14,
    color: "#1A1A2E",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#FAFAFC",
  },
  formSelect: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #E8E8ED",
    fontSize: 14,
    color: "#1A1A2E",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#FAFAFC",
    cursor: "pointer",
  },
  formFull: {
    gridColumn: "1 / -1",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 28,
    gridColumn: "1 / -1",
  },
  btnCancel: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "1px solid #E8E8ED",
    background: "#FFFFFF",
    color: "#6B7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  deleteModal: {
    background: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    padding: "36px 40px 32px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
    textAlign: "center",
    animation: "slideUp 0.3s ease",
  },
  btnDanger: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "none",
    background: "#EF4444",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#9CA3AF",
  },
  serviciosWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: 200,
  },
  servicioChip: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: "#F0F0F5",
    color: "#4B5563",
    whiteSpace: "nowrap",
  },
  servicioMore: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    background: "#1A1A2E",
    color: "#FFFFFF",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  multiSelectContainer: {
    border: "1px solid #E8E8ED",
    borderRadius: 10,
    background: "#FAFAFC",
    maxHeight: 200,
    overflowY: "auto",
    padding: "6px",
  },
  multiSelectOption: (selected) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 7,
    fontSize: 13,
    cursor: "pointer",
    transition: "background 0.15s",
    background: selected ? "#EEF2FF" : "transparent",
    color: selected ? "#1A1A2E" : "#4B5563",
    fontWeight: selected ? 600 : 400,
  }),
  checkbox: (checked) => ({
    width: 16,
    height: 16,
    borderRadius: 4,
    border: checked ? "none" : "1.5px solid #D1D5DB",
    background: checked ? "#1A1A2E" : "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s",
    fontSize: 10,
    color: "#FFF",
  }),
  selectedChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  selectedChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: "#1A1A2E",
    color: "#FFFFFF",
  },
  chipRemove: {
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    fontSize: 13,
    lineHeight: 1,
    padding: "0 2px",
    fontWeight: 700,
  },
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes rowIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  tr:hover td { background: #FAFAFC; }
  input:focus, select:focus { border-color: #1A1A2E !important; }
  button:active { transform: scale(0.97); }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }

  /* ─── RESPONSIVE ─── */
  .table-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 16px;
    border: 1px solid #F0F0F5;
  }
  .table-scroll table {
    min-width: 1000px;
    border: none !important;
    border-radius: 0 !important;
  }
  .table-scroll::-webkit-scrollbar { height: 6px; }
  .table-scroll::-webkit-scrollbar-track { background: #F7F7FA; }
  .table-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }

  @media (max-width: 1024px) {
    .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
    .main-content { padding: 24px 20px 40px !important; }
    .app-header { padding: 16px 20px !important; }
  }

  @media (max-width: 768px) {
    .stats-row { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .stat-value { font-size: 22px !important; }
    .toolbar-wrap { flex-direction: column !important; align-items: stretch !important; }
    .search-box { max-width: 100% !important; }
    .filter-group { overflow-x: auto; padding-bottom: 4px; flex-wrap: nowrap !important; }
    .filter-group::-webkit-scrollbar { display: none; }
    .form-modal { padding: 24px 20px 20px !important; margin: 16px; max-width: calc(100% - 32px) !important; }
    .form-grid-resp { grid-template-columns: 1fr !important; }
    .app-header { flex-direction: column; gap: 12px; align-items: stretch !important; }
    .btn-nuevo { width: 100%; justify-content: center; }
    .pagination-bar { flex-direction: column !important; gap: 12px !important; align-items: stretch !important; }
    .pagination-bar > * { justify-content: center !important; }
  }

  @media (max-width: 480px) {
    .stats-row { grid-template-columns: 1fr !important; }
    .main-content { padding: 16px 12px 32px !important; }
    .app-header { padding: 14px 12px !important; }
    .stat-card { padding: 16px 18px !important; }
    .pagination-pages { display: none !important; }
  }
`;

const EMPTY_FORM = {
  cedula: "",
  placa: "",
  vehiculo: "",
  tipo: "Preventivo",
  descripcion: "",
  kilometraje: "",
  fecha: new Date().toISOString().split("T")[0],
  estado: "Pendiente",
  costo: "",
  taller: "",
  servicios: [],
};

export default function ConsultarMantenimientos() {
  const [data, setData] = useState(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const PAGE_OPTIONS = [10, 20, 40, 50, 100];

  const filtered = data.filter((item) => {
    const matchSearch =
      search === "" ||
      item.cedula.toLowerCase().includes(search.toLowerCase()) ||
      item.placa.toLowerCase().includes(search.toLowerCase()) ||
      item.vehiculo.toLowerCase().includes(search.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      item.taller.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === "Todos" || item.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const startRecord = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(safePage * rowsPerPage, filtered.length);

  useEffect(() => { setCurrentPage(1); }, [search, filterEstado, rowsPerPage]);

  const stats = {
    total: data.length,
    completados: data.filter((d) => d.estado === "Completado").length,
    enProceso: data.filter((d) => d.estado === "En proceso").length,
    costoTotal: data.reduce((sum, d) => sum + d.costo, 0),
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      cedula: item.cedula || "",
      placa: item.placa,
      vehiculo: item.vehiculo,
      tipo: item.tipo,
      descripcion: item.descripcion,
      kilometraje: String(item.kilometraje),
      fecha: item.fecha,
      estado: item.estado,
      costo: String(item.costo),
      taller: item.taller,
      servicios: item.servicios || [],
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.cedula || !form.placa || !form.vehiculo || !form.descripcion) return;
    if (editingId) {
      setData((prev) =>
        prev.map((d) =>
          d.id === editingId
            ? { ...d, ...form, kilometraje: Number(form.kilometraje) || 0, costo: Number(form.costo) || 0, servicios: form.servicios }
            : d
        )
      );
    } else {
      const newId = Math.max(...data.map((d) => d.id), 0) + 1;
      setData((prev) => [
        ...prev,
        { id: newId, ...form, kilometraje: Number(form.kilometraje) || 0, costo: Number(form.costo) || 0, servicios: form.servicios },
      ]);
    }
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = () => {
    setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
    <div style={styles.app}>
      <style>{globalCSS}</style>

      {/* HEADER */}
      <header style={styles.header} className="app-header">
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>M</div>
          <div>
            <div style={styles.logoText}>Mantenimientos</div>
            <div style={styles.logoSub}>Gestión vehicular</div>
          </div>
        </div>
        <button style={styles.btnPrimary} className="btn-nuevo" onClick={openCreate} onMouseOver={(e) => (e.currentTarget.style.opacity = 0.9)} onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nuevo Mantenimiento
        </button>
      </header>

      <main style={styles.main} className="main-content">
        {/* STATS */}
        <div style={styles.statsRow} className="stats-row">
          {[
            { label: "Total registros", value: stats.total, accent: "#1A1A2E" },
            { label: "Completados", value: stats.completados, accent: "#059669" },
            { label: "En proceso", value: stats.enProceso, accent: "#EA580C" },
            { label: "Costo total", value: formatCurrency(stats.costoTotal), accent: "#7C3AED" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard} className="stat-card">
              <div style={styles.statLabel}>{s.label}</div>
              <div style={{ ...styles.statValue, color: s.accent }} className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div style={styles.toolbar} className="toolbar-wrap">
          <div style={styles.searchBox} className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              style={styles.searchInput}
              placeholder="Buscar por cédula, placa, vehículo, taller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button style={{ ...styles.actionBtn, fontSize: 14, color: "#9CA3AF" }} onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div style={styles.filterGroup} className="filter-group">
            {["Todos", ...ESTADOS].map((e) => (
              <button key={e} style={styles.filterBtn(filterEstado === e)} onClick={() => setFilterEstado(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="table-scroll">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Cliente (C.C.)</th>
              <th style={styles.th}>Vehículo</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Servicios</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Km</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Costo</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={styles.emptyState}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#6B7280" }}>No se encontraron registros</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Intenta cambiar los filtros o agrega un nuevo mantenimiento</div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const ec = estadoColor(item.estado);
                return (
                  <tr
                    key={item.id}
                    style={{ ...styles.trHover, animation: `rowIn 0.3s ease ${idx * 0.04}s both` }}
                    onMouseEnter={() => setHoveredRow(item.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>
                      <span style={{ fontFamily: "monospace", letterSpacing: "0.03em", fontWeight: 600, fontSize: 13 }}>{item.cedula}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.vehiculo}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, fontFamily: "monospace", letterSpacing: "0.05em" }}>{item.placa}</div>
                    </td>
                    <td style={styles.td}>
                      <span>{tipoIcon(item.tipo)} {item.tipo}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.serviciosWrap}>
                        {(item.servicios || []).slice(0, 2).map((s, i) => (
                          <span key={i} style={styles.servicioChip}>{s}</span>
                        ))}
                        {(item.servicios || []).length > 2 && (
                          <span style={styles.servicioMore} title={(item.servicios || []).slice(2).join(", ")}>+{item.servicios.length - 2}</span>
                        )}
                        {(!item.servicios || item.servicios.length === 0) && <span style={{ color: "#D1D5DB", fontSize: 12 }}>—</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.descripcion}</td>
                    <td style={{ ...styles.td, fontVariantNumeric: "tabular-nums" }}>{item.kilometraje.toLocaleString()} km</td>
                    <td style={{ ...styles.td, whiteSpace: "nowrap", fontSize: 13 }}>{new Date(item.fecha + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td style={styles.td}>
                      <span style={styles.badge(ec)}>{item.estado}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.costo)}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 2, opacity: hoveredRow === item.id ? 1 : 0.4, transition: "opacity 0.2s" }}>
                        <button
                          style={styles.actionBtn}
                          title="Editar"
                          onClick={() => openEdit(item)}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.actionBtn}
                          title="Eliminar"
                          onClick={() => setDeleteTarget(item)}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="pagination-bar" style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#FFFFFF",
          border: "1px solid #F0F0F5",
          borderRadius: 14,
          padding: "14px 20px",
          gap: 16,
          flexWrap: "wrap",
        }}>
          {/* Left: rows per page */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6B7280" }}>
            <span>Mostrar</span>
            <select
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #E8E8ED",
                fontSize: 13,
                fontWeight: 600,
                color: "#1A1A2E",
                fontFamily: "'DM Sans', sans-serif",
                background: "#FAFAFC",
                cursor: "pointer",
                outline: "none",
              }}
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              {PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>por página</span>
          </div>

          {/* Center: page numbers */}
          <div className="pagination-pages" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              style={{
                padding: "6px 10px", borderRadius: 7, border: "1px solid #E8E8ED",
                background: "#FFFFFF", color: safePage === 1 ? "#D1D5DB" : "#1A1A2E",
                cursor: safePage === 1 ? "default" : "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >«</button>
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              style={{
                padding: "6px 10px", borderRadius: 7, border: "1px solid #E8E8ED",
                background: "#FFFFFF", color: safePage === 1 ? "#D1D5DB" : "#1A1A2E",
                cursor: safePage === 1 ? "default" : "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >‹</button>

            {(() => {
              const pages = [];
              let start = Math.max(1, safePage - 2);
              let end = Math.min(totalPages, start + 4);
              if (end - start < 4) start = Math.max(1, end - 4);
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    padding: "6px 12px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                    border: p === safePage ? "1.5px solid #1A1A2E" : "1px solid #E8E8ED",
                    background: p === safePage ? "#1A1A2E" : "#FFFFFF",
                    color: p === safePage ? "#FFFFFF" : "#6B7280",
                    transition: "all 0.15s",
                  }}
                >{p}</button>
              ));
            })()}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              style={{
                padding: "6px 10px", borderRadius: 7, border: "1px solid #E8E8ED",
                background: "#FFFFFF", color: safePage === totalPages ? "#D1D5DB" : "#1A1A2E",
                cursor: safePage === totalPages ? "default" : "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >›</button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              style={{
                padding: "6px 10px", borderRadius: 7, border: "1px solid #E8E8ED",
                background: "#FFFFFF", color: safePage === totalPages ? "#D1D5DB" : "#1A1A2E",
                cursor: safePage === totalPages ? "default" : "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >»</button>
          </div>

          {/* Right: info text */}
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>
            {startRecord}–{endRecord} de {filtered.length} registros
          </div>
        </div>
      </main>

      {/* MODAL CREATE / EDIT */}
      {modalOpen && (
        <div style={styles.overlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modal} className="form-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editingId ? "Editar Mantenimiento" : "Nuevo Mantenimiento"}</h2>
            <div style={styles.formGrid} className="form-grid-resp">
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Cédula cliente *</label>
                <input style={styles.formInput} placeholder="1017234567" value={form.cedula} onChange={(e) => updateField("cedula", e.target.value.replace(/\D/g, ""))} maxLength={12} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Placa *</label>
                <input style={styles.formInput} placeholder="ABC-123" value={form.placa} onChange={(e) => updateField("placa", e.target.value.toUpperCase())} maxLength={7} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Vehículo *</label>
                <input style={styles.formInput} placeholder="Marca Modelo Año" value={form.vehiculo} onChange={(e) => updateField("vehiculo", e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Tipo</label>
                <select style={styles.formSelect} value={form.tipo} onChange={(e) => updateField("tipo", e.target.value)}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Estado</label>
                <select style={styles.formSelect} value={form.estado} onChange={(e) => updateField("estado", e.target.value)}>
                  {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Kilometraje</label>
                <input style={styles.formInput} type="number" placeholder="0" value={form.kilometraje} onChange={(e) => updateField("kilometraje", e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Fecha</label>
                <input style={styles.formInput} type="date" value={form.fecha} onChange={(e) => updateField("fecha", e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Costo (COP)</label>
                <input style={styles.formInput} type="number" placeholder="0" value={form.costo} onChange={(e) => updateField("costo", e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Taller</label>
                <input style={styles.formInput} placeholder="Nombre del taller" value={form.taller} onChange={(e) => updateField("taller", e.target.value)} />
              </div>
              <div style={{ ...styles.formGroup, ...styles.formFull }}>
                <label style={styles.formLabel}>Servicios realizados</label>
                {form.servicios.length > 0 && (
                  <div style={styles.selectedChips}>
                    {form.servicios.map((s) => (
                      <span key={s} style={styles.selectedChip}>
                        {s}
                        <button style={styles.chipRemove} onClick={() => updateField("servicios", form.servicios.filter((x) => x !== s))}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <div style={styles.multiSelectContainer}>
                  {SERVICIOS.map((s) => {
                    const selected = form.servicios.includes(s);
                    return (
                      <div
                        key={s}
                        style={styles.multiSelectOption(selected)}
                        onClick={() =>
                          updateField(
                            "servicios",
                            selected ? form.servicios.filter((x) => x !== s) : [...form.servicios, s]
                          )
                        }
                        onMouseOver={(e) => { if (!selected) e.currentTarget.style.background = "#F9FAFB"; }}
                        onMouseOut={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={styles.checkbox(selected)}>{selected ? "✓" : ""}</div>
                        {s}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ ...styles.formGroup, ...styles.formFull }}>
                <label style={styles.formLabel}>Descripción *</label>
                <textarea
                  style={{ ...styles.formInput, minHeight: 80, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
                  placeholder="Detalle del mantenimiento realizado..."
                  value={form.descripcion}
                  onChange={(e) => updateField("descripcion", e.target.value)}
                />
              </div>
              <div style={styles.formActions}>
                <button style={styles.btnCancel} onClick={() => setModalOpen(false)}>Cancelar</button>
                <button
                  style={{ ...styles.btnPrimary, opacity: !form.cedula || !form.placa || !form.vehiculo || !form.descripcion ? 0.5 : 1 }}
                  onClick={handleSave}
                  disabled={!form.cedula || !form.placa || !form.vehiculo || !form.descripcion}
                >
                  {editingId ? "Guardar cambios" : "Crear registro"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div style={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div style={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#1A1A2E" }}>¿Eliminar registro?</h3>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
              <strong>{deleteTarget.vehiculo}</strong> — {deleteTarget.placa}
            </p>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 28 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button style={styles.btnCancel} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button style={styles.btnDanger} onClick={handleDelete}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
}