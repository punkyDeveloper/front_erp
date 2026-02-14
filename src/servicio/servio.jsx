import React, { useState, useMemo } from 'react';

// Iconos SVG inline
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function ServiciosModule() {
  const [servicios, setServicios] = useState([
    {
      id: 1,
      codigo: 'SRV-001',
      nombre: 'Desarrollo Web',
      tiempo: '2 semanas',
      valor: 1500,
      subservicios: [
        { id: 101, codigo: 'SUB-001', nombre: 'Diseño UI/UX', descripcion: 'Diseño de interfaces y experiencia de usuario', tiempo: '3 días', valor: 400 },
        { id: 102, codigo: 'SUB-002', nombre: 'Frontend', descripcion: 'Desarrollo de la parte visual y funcional del cliente', tiempo: '1 semana', valor: 600 },
        { id: 103, codigo: 'SUB-003', nombre: 'Backend', descripcion: 'Desarrollo del servidor y base de datos', tiempo: '1 semana', valor: 500 }
      ]
    },
    {
      id: 2,
      codigo: 'SRV-002',
      nombre: 'Marketing Digital',
      tiempo: '1 mes',
      valor: 2000,
      subservicios: [
        { id: 201, codigo: 'SUB-004', nombre: 'SEO', descripcion: 'Optimización para motores de búsqueda', tiempo: '2 semanas', valor: 800 },
        { id: 202, codigo: 'SUB-005', nombre: 'Redes Sociales', descripcion: 'Gestión y estrategia en plataformas sociales', tiempo: '2 semanas', valor: 600 }
      ]
    },
    {
      id: 3,
      codigo: 'SRV-003',
      nombre: 'Consultoría IT',
      tiempo: '1 semana',
      valor: 1200,
      subservicios: []
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tiempo: '',
    valor: '',
    subservicios: []
  });
  const [newSubservicio, setNewSubservicio] = useState({
    nombre: '',
    descripcion: '',
    tiempo: '',
    valor: ''
  });

  const filteredServicios = useMemo(() => {
    return servicios.filter(servicio =>
      servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.subservicios.some(sub => 
        sub.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [servicios, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServicios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServicios.length / itemsPerPage);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        nombre: service.nombre,
        tiempo: service.tiempo,
        valor: service.valor,
        subservicios: [...service.subservicios]
      });
    } else {
      setEditingService(null);
      setFormData({
        nombre: '',
        tiempo: '',
        valor: '',
        subservicios: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ nombre: '', tiempo: '', valor: '', subservicios: [] });
    setNewSubservicio({ nombre: '', descripcion: '', tiempo: '', valor: '' });
  };

  const handleAddSubservicio = () => {
    if (newSubservicio.nombre && newSubservicio.tiempo && newSubservicio.valor) {
      const subId = Date.now();
      const subservicio = {
        id: subId,
        codigo: `SUB-${String(subId).slice(-3).padStart(3, '0')}`,
        nombre: newSubservicio.nombre,
        descripcion: newSubservicio.descripcion,
        tiempo: newSubservicio.tiempo,
        valor: parseFloat(newSubservicio.valor)
      };
      setFormData({
        ...formData,
        subservicios: [...formData.subservicios, subservicio]
      });
      setNewSubservicio({ nombre: '', descripcion: '', tiempo: '', valor: '' });
    }
  };

  const handleRemoveSubservicio = (subId) => {
    setFormData({
      ...formData,
      subservicios: formData.subservicios.filter(sub => sub.id !== subId)
    });
  };

  const handleSaveService = () => {
    if (formData.nombre && formData.tiempo && formData.valor) {
      if (editingService) {
        setServicios(servicios.map(s => 
          s.id === editingService.id 
            ? { ...editingService, ...formData, valor: parseFloat(formData.valor) }
            : s
        ));
      } else {
        const newId = Date.now();
        const newService = {
          id: newId,
          codigo: `SRV-${String(newId).slice(-3).padStart(3, '0')}`,
          nombre: formData.nombre,
          tiempo: formData.tiempo,
          valor: parseFloat(formData.valor),
          subservicios: formData.subservicios
        };
        setServicios([...servicios, newService]);
      }
      handleCloseModal();
    }
  };

  const handleDeleteService = (id) => {
    setServiceToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      setServicios(servicios.filter(s => s.id !== serviceToDelete));
      setServiceToDelete(null);
      setShowConfirmDialog(false);
    }
  };

  const cancelDelete = () => {
    setServiceToDelete(null);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .servicios-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
          padding: 2rem;
        }

        .servicios-content {
          max-width: 1280px;
          margin: 0 auto;
        }

        .servicios-header {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .btn-primary {
          background-color: #4f46e5;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
          font-size: 1rem;
        }

        .btn-primary:hover {
          background-color: #4338ca;
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
        }

        .search-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .table-container {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .servicios-table {
          width: 100%;
          border-collapse: collapse;
        }

        .servicios-table thead {
          background-color: #4f46e5;
          color: white;
        }

        .servicios-table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .servicios-table th.text-center {
          text-align: center;
        }

        .servicios-table tbody tr.table-row {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s;
        }

        .servicios-table tbody tr.table-row:hover {
          background-color: #f9fafb;
        }

        .servicios-table td {
          padding: 1rem 1.5rem;
        }

        .text-gray {
          color: #6b7280;
        }

        .service-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .expand-btn:hover {
          color: #4f46e5;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: monospace;
        }

        .badge-primary {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .badge-secondary {
          background-color: #e9d5ff;
          color: #7c3aed;
        }

        .badge-secondary-small {
          background-color: #e9d5ff;
          color: #7c3aed;
          padding: 0.125rem 0.625rem;
          font-size: 0.75rem;
        }

        .badge-count {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .price {
          color: #059669;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }

        .btn-edit {
          color: #2563eb;
        }

        .btn-edit:hover {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .btn-delete {
          color: #dc2626;
        }

        .btn-delete:hover {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .expanded-row {
          background-color: #f9fafb;
          padding: 1rem 1.5rem;
        }

        .subservicios-container {
          margin-left: 2rem;
        }

        .subservicios-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .subservicios-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subservicio-item {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .subservicio-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .subservicio-header {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .subservicio-info {
          display: flex;
          flex-direction: column;
        }

        .subservicio-name {
          color: #1f2937;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .subservicio-desc {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .subservicio-details {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .pagination-container {
          background-color: #f9fafb;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #e5e7eb;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .pagination-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-pagination {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .btn-pagination:hover:not(:disabled) {
          background-color: #f3f4f6;
        }

        .btn-pagination.active {
          background-color: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .btn-pagination:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 42rem;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .btn-close:hover {
          color: #374151;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-textarea {
          resize: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .subservicios-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
          margin-top: 1.5rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .subservicios-form {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .subservicios-form input,
        .subservicios-form textarea {
          margin-bottom: 0.75rem;
        }

        .subservicios-form .form-row {
          margin-bottom: 0.75rem;
        }

        .subservicios-form .form-row input {
          margin-bottom: 0;
        }

        .btn-add-sub {
          width: 100%;
          background-color: #dbeafe;
          color: #1e40af;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
          font-size: 1rem;
        }

        .btn-add-sub:hover {
          background-color: #bfdbfe;
        }

        .subservicios-list-modal {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subservicio-card {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .subservicio-card-content {
          flex: 1;
        }

        .subservicio-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .subservicio-card-name {
          font-weight: 500;
          color: #1f2937;
        }

        .subservicio-card-desc {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.5rem 0.25rem;
        }

        .subservicio-card-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          margin-left: 0.25rem;
        }

        .subservicio-card-details span {
          color: #6b7280;
        }

        .btn-remove-sub {
          background: none;
          border: none;
          cursor: pointer;
          color: #dc2626;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          margin-left: 1rem;
        }

        .btn-remove-sub:hover {
          color: #991b1b;
        }

        .modal-footer {
          padding: 1.5rem;
          display: flex;
          gap: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-save {
          flex: 1;
          background-color: #4f46e5;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: background-color 0.2s;
          font-size: 1rem;
        }

        .btn-save:hover {
          background-color: #4338ca;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 1rem;
        }

        .btn-cancel:hover {
          background-color: #f9fafb;
        }

        .confirm-dialog {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 28rem;
          width: 100%;
          padding: 1.5rem;
        }

        .confirm-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .confirm-text {
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .confirm-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .btn-confirm-delete {
          flex: 1;
          background-color: #dc2626;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-confirm-delete:hover {
          background-color: #b91c1c;
        }

        .btn-confirm-cancel {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-confirm-cancel:hover {
          background-color: #f9fafb;
        }

        @media (max-width: 768px) {
          .servicios-container {
            padding: 1rem;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .pagination-container {
            flex-direction: column;
            gap: 1rem;
          }

          .subservicio-content {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="servicios-container">
        <div className="servicios-content">
          {/* Header */}
          <div className="servicios-header">
            <div className="header-top">
              <h1 className="title">Gestión de Servicios</h1>
              <button onClick={() => handleOpenModal()} className="btn-primary">
                <PlusIcon />
                Nuevo Servicio
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="search-container">
              <div className="search-icon">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Buscar servicios o subservicios..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="table-container">
            <div className="table-wrapper">
              <table className="servicios-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Servicio</th>
                    <th>Tiempo</th>
                    <th>Valor</th>
                    <th>Subservicios</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((servicio) => (
                    <React.Fragment key={servicio.id}>
                      <tr className="table-row">
                        <td>
                          <span className="badge badge-primary">{servicio.codigo}</span>
                        </td>
                        <td>
                          <div className="service-name">
                            {servicio.subservicios.length > 0 && (
                              <button
                                onClick={() => toggleRow(servicio.id)}
                                className="expand-btn"
                              >
                                {expandedRows.has(servicio.id) ? (
                                  <ChevronDownIcon />
                                ) : (
                                  <ChevronRightIcon />
                                )}
                              </button>
                            )}
                            <span>{servicio.nombre}</span>
                          </div>
                        </td>
                        <td className="text-gray">{servicio.tiempo}</td>
                        <td>
                          <span className="price">${servicio.valor.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="badge badge-count">{servicio.subservicios.length}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleOpenModal(servicio)}
                              className="btn-icon btn-edit"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDeleteService(servicio.id)}
                              className="btn-icon btn-delete"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(servicio.id) && servicio.subservicios.length > 0 && (
                        <tr>
                          <td colSpan="6" className="expanded-row">
                            <div className="subservicios-container">
                              <h4 className="subservicios-title">Subservicios:</h4>
                              <div className="subservicios-list">
                                {servicio.subservicios.map((sub) => (
                                  <div key={sub.id} className="subservicio-item">
                                    <div className="subservicio-content">
                                      <div className="subservicio-header">
                                        <span className="badge badge-secondary">{sub.codigo}</span>
                                        <div className="subservicio-info">
                                          <div className="subservicio-name">{sub.nombre}</div>
                                          {sub.descripcion && (
                                            <div className="subservicio-desc">{sub.descripcion}</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="subservicio-details">
                                        <span className="text-gray">{sub.tiempo}</span>
                                        <span className="price">${sub.valor.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginador */}
            <div className="pagination-container">
              <div className="pagination-info">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredServicios.length)} de {filteredServicios.length} servicios
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                >
                  Anterior
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`btn-pagination ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-pagination"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para crear/editar servicio */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h2>
                <button onClick={handleCloseModal} className="btn-close">
                  <XIcon />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del Servicio</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="form-input"
                    placeholder="Ej: Desarrollo Web"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tiempo</label>
                    <input
                      type="text"
                      value={formData.tiempo}
                      onChange={(e) => setFormData({ ...formData, tiempo: e.target.value })}
                      className="form-input"
                      placeholder="Ej: 2 semanas"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valor ($)</label>
                    <input
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="form-input"
                      placeholder="Ej: 1500"
                    />
                  </div>
                </div>

                <div className="subservicios-section">
                  <h3 className="section-title">Subservicios</h3>
                  
                  <div className="subservicios-form">
                    <input
                      type="text"
                      value={newSubservicio.nombre}
                      onChange={(e) => setNewSubservicio({ ...newSubservicio, nombre: e.target.value })}
                      className="form-input"
                      placeholder="Nombre del subservicio"
                    />
                    <textarea
                      value={newSubservicio.descripcion}
                      onChange={(e) => setNewSubservicio({ ...newSubservicio, descripcion: e.target.value })}
                      className="form-textarea"
                      placeholder="Descripción del subservicio"
                      rows="2"
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        value={newSubservicio.tiempo}
                        onChange={(e) => setNewSubservicio({ ...newSubservicio, tiempo: e.target.value })}
                        className="form-input"
                        placeholder="Tiempo (ej: 3 días)"
                      />
                      <input
                        type="number"
                        value={newSubservicio.valor}
                        onChange={(e) => setNewSubservicio({ ...newSubservicio, valor: e.target.value })}
                        className="form-input"
                        placeholder="Valor ($)"
                      />
                    </div>
                    <button onClick={handleAddSubservicio} className="btn-add-sub">
                      <PlusIcon />
                      Agregar Subservicio
                    </button>
                  </div>

                  {formData.subservicios.length > 0 && (
                    <div className="subservicios-list-modal">
                      {formData.subservicios.map((sub) => (
                        <div key={sub.id} className="subservicio-card">
                          <div className="subservicio-card-content">
                            <div className="subservicio-card-header">
                              <span className="badge badge-secondary-small">{sub.codigo}</span>
                              <span className="subservicio-card-name">{sub.nombre}</span>
                            </div>
                            {sub.descripcion && (
                              <p className="subservicio-card-desc">{sub.descripcion}</p>
                            )}
                            <div className="subservicio-card-details">
                              <span>⏱️ {sub.tiempo}</span>
                              <span className="price">💰 ${sub.valor}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSubservicio(sub.id)}
                            className="btn-remove-sub"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={handleSaveService} className="btn-save">
                  <SaveIcon />
                  {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
                <button onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación */}
        {showConfirmDialog && (
          <div className="modal-overlay">
            <div className="confirm-dialog">
              <h3 className="confirm-title">Confirmar Eliminación</h3>
              <p className="confirm-text">
                ¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.
              </p>
              <div className="confirm-buttons">
                <button onClick={confirmDelete} className="btn-confirm-delete">
                  Eliminar
                </button>
                <button onClick={cancelDelete} className="btn-confirm-cancel">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}