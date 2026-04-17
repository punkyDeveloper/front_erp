import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import NavAdmin from "../assets/nav/navPos";

/* ─── Config API ─────────────────────────────────────────────────────────── */
const API_URL  = process.env.REACT_APP_API_URL || "https://back-erp.onrender.com/v1";
const getToken = () => localStorage.getItem("token") || "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Error en la petición");
  return data;
};

/* ─── Estilos ────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --az:#2563EB;--az2:#3B82F6;--az3:#EFF6FF;--az4:#DBEAFE;
    --ve:#059669;--ve3:#ECFDF5;--ve4:#D1FAE5;
    --ro:#DC2626;--ro3:#FEF2F2;
    --am:#D97706;--am3:#FFFBEB;
    --pu:#7C3AED;--pu3:#F5F3FF;
    --gr:#64748B;--gr2:#F1F5F9;--gr3:#E2E8F0;--gr4:#CBD5E1;
    --txt:#0F172A;--txt2:#475569;
    --sh:0 1px 3px rgba(0,0,0,.08);--sh2:0 20px 40px rgba(0,0,0,.15);
    --nav-h:56px;
  }
  body{font-family:'Outfit',sans-serif!important}
  /* Botones */
  .btn{border:none;cursor:pointer;font-family:inherit;font-weight:500;border-radius:8px;transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
  .btn:active{transform:scale(.97)}
  .btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
  .bp{background:var(--az);color:#fff;padding:10px 20px;font-size:14px}.bp:hover:not(:disabled){background:#1D4ED8}
  .bv{background:var(--ve);color:#fff;padding:10px 20px;font-size:14px}.bv:hover:not(:disabled){background:#047857}
  .bs{background:#fff;color:var(--gr);border:1px solid var(--gr3);padding:9px 18px;font-size:14px}.bs:hover:not(:disabled){background:var(--gr2)}
  .bd{background:var(--ro);color:#fff;padding:9px 18px;font-size:14px}.bd:hover:not(:disabled){background:#B91C1C}
  .bam{background:var(--am);color:#fff;padding:9px 18px;font-size:14px}.bam:hover:not(:disabled){background:#B45309}
  .bi{background:transparent;color:var(--gr);padding:7px;border-radius:8px;font-size:16px;border:none;cursor:pointer;transition:all .15s;line-height:1;font-family:inherit}
  .bi:hover{background:var(--gr2);color:var(--txt)}
  .bi.del:hover{background:var(--ro3);color:var(--ro)}
  /* Inputs */
  .ig{display:flex;flex-direction:column;gap:4px}
  .ig label{font-size:11px;font-weight:700;color:#475569;letter-spacing:.5px;text-transform:uppercase}
  .ic{border:1.5px solid var(--gr3);border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;color:var(--txt);background:#fff;width:100%;outline:none;transition:border-color .15s,box-shadow .15s}
  .ic:focus{border-color:var(--az2);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
  /* Badges */
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
  .bv-b{background:var(--ve4);color:var(--ve)}
  .br-b{background:var(--ro3);color:var(--ro)}
  .ba-b{background:var(--az3);color:var(--az)}
  .bam-b{background:var(--am3);color:var(--am)}
  .bpu-b{background:var(--pu3);color:var(--pu)}
  /* Toast */
  .toast{position:fixed;bottom:28px;right:28px;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;box-shadow:var(--sh2);z-index:999999;display:flex;align-items:center;gap:10px;animation:su .2s}
  .t-ok{background:#0F172A;color:#fff}.t-err{background:var(--ro);color:#fff}
  /* Modal */
  .overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
  .modal-box{background:#fff;border-radius:16px;box-shadow:var(--sh2);width:100%;max-width:460px;max-height:92vh;overflow-y:auto;animation:su .2s}
  .mh{padding:20px 24px 16px;border-bottom:1px solid var(--gr3);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:5;border-radius:16px 16px 0 0}
  .mb{padding:20px 24px}
  .mf{padding:14px 24px 20px;border-top:1px solid var(--gr3);display:flex;gap:10px;justify-content:flex-end}
  @keyframes su{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
  /* Spinner */
  .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .6s linear infinite;flex-shrink:0}
  .spin-dark{width:28px;height:28px;border:3px solid var(--gr3);border-top-color:var(--az);border-radius:50%;animation:sp .6s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  /* Search */
  .search-wrap{position:relative}
  .search-wrap .ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gr);font-size:15px;pointer-events:none}
  .search-wrap .ic{padding-left:36px}
  /* ── DASHBOARD ── */
  .dash-wrap{padding:28px 32px;max-width:1200px;margin:0 auto}
  .draft-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin-top:24px}
  .draft-card{background:#fff;border-radius:14px;border:1px solid var(--gr3);box-shadow:var(--sh);padding:18px 20px;cursor:pointer;transition:all .18s;position:relative}
  .draft-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1);transform:translateY(-2px);border-color:var(--az4)}
  .draft-card-del{position:absolute;top:10px;right:10px;opacity:0;transition:opacity .15s}
  .draft-card:hover .draft-card-del{opacity:1}
  .new-sale-card{border:2px dashed var(--az4);background:var(--az3);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:140px;border-radius:14px;cursor:pointer;transition:all .18s;gap:10px}
  .new-sale-card:hover{background:#DBEAFE;border-color:var(--az2)}
  .new-sale-icon{font-size:32px}
  /* ── POS TERMINAL ── */
  .pos-wrap{display:flex;height:calc(100vh - var(--nav-h));overflow:hidden}
  /* Panel izquierdo: productos */
  .pos-left{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--gr2);border-right:1px solid var(--gr3)}
  .pos-left-head{padding:14px 20px;background:#fff;border-bottom:1px solid var(--gr3);display:flex;gap:12px;align-items:center;flex-shrink:0}
  .pos-prods{flex:1;overflow-y:auto;padding:16px 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;align-content:start}
  .prod-card{background:#fff;border-radius:12px;border:1px solid var(--gr3);overflow:hidden;cursor:pointer;transition:all .15s;box-shadow:var(--sh)}
  .prod-card:hover:not(.agotado){box-shadow:0 6px 18px rgba(0,0,0,.1);transform:translateY(-2px);border-color:var(--az4)}
  .prod-card.agotado{opacity:.5;cursor:not-allowed}
  .prod-card.en-carrito{border-color:var(--az2);box-shadow:0 0 0 2px var(--az4)}
  .prod-card img{width:100%;height:110px;object-fit:cover}
  .prod-card-placeholder{width:100%;height:110px;background:var(--gr2);display:flex;align-items:center;justify-content:center;font-size:32px;color:var(--gr4)}
  .prod-card-body{padding:10px 12px}
  .prod-card-name{font-size:13px;font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .prod-card-price{font-size:14px;font-weight:700;color:var(--ve);margin-top:3px}
  .prod-card-stock{font-size:11px;color:var(--gr);margin-top:2px}
  /* Panel derecho: carrito */
  .pos-right{width:360px;flex-shrink:0;display:flex;flex-direction:column;background:#fff}
  .pos-right-head{padding:14px 18px;border-bottom:1px solid var(--gr3);flex-shrink:0}
  .pos-cart-items{flex:1;overflow-y:auto;padding:10px 14px}
  .cart-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--gr3)}
  .cart-item:last-child{border-bottom:none}
  .cart-item-img{width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;border:1px solid var(--gr3)}
  .cart-item-ph{width:44px;height:44px;border-radius:8px;background:var(--gr2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .cart-item-name{font-size:13px;font-weight:600;color:var(--txt);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cart-item-price{font-size:12px;color:var(--gr)}
  .qty-ctrl{display:flex;align-items:center;gap:6px;flex-shrink:0}
  .qty-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--gr3);background:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .12s;font-family:inherit}
  .qty-btn:hover{background:var(--gr2)}
  .qty-val{width:32px;text-align:center;font-size:13px;font-weight:600;color:var(--txt)}
  .pos-totales{padding:14px 18px;border-top:1px solid var(--gr3);flex-shrink:0;background:#FAFBFC}
  .total-row{display:flex;justify-content:space-between;font-size:13px;color:var(--txt2);padding:4px 0}
  .total-row.big{font-size:16px;font-weight:700;color:var(--txt);padding-top:10px;margin-top:4px;border-top:1px solid var(--gr3)}
  .pos-actions{padding:12px 18px;border-top:1px solid var(--gr3);display:flex;flex-direction:column;gap:8px;flex-shrink:0}
  /* Métodos de pago */
  .pay-methods{display:flex;gap:8px;margin-top:6px}
  .pay-btn{flex:1;padding:8px;border-radius:8px;border:1.5px solid var(--gr3);background:#fff;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:var(--gr);text-align:center;transition:all .15s}
  .pay-btn:hover{border-color:var(--az4);color:var(--az);background:var(--az3)}
  .pay-btn.sel{border-color:var(--az2);color:var(--az);background:var(--az3);box-shadow:0 0 0 2px var(--az4)}
  /* Vacío */
  .empty-cart{text-align:center;padding:40px 20px;color:var(--gr)}
  .empty-cart-icon{font-size:36px;margin-bottom:10px}
  @media(max-width:900px){.pos-right{width:300px}.pos-prods{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}}
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 });

const fechaCorta = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Pos() {
  /* ── Vista: "dashboard" | "terminal" ── */
  const [vista,         setVista]         = useState("dashboard");
  const [ventaActual,   setVentaActual]   = useState(null); // borrador abierto

  /* ── Borradores ── */
  const [borradores,    setBorradores]    = useState([]);
  const [cargBorradores,setCargBorradores]= useState(true);

  /* ── Productos del catálogo ── */
  const [productos,     setProductos]     = useState([]);
  const [cargProds,     setCargProds]     = useState(false);
  const [buscar,        setBuscar]        = useState("");

  /* ── Carrito ── */
  const [items,         setItems]         = useState([]);   // { producto, cantidad, precioUnitario }
  const [cliente,       setCliente]       = useState("");
  const [descuento,     setDescuento]     = useState(0);
  const [metodoPago,    setMetodoPago]    = useState("efectivo");
  const [notas,         setNotas]         = useState("");

  /* ── UI ── */
  const [guardando,     setGuardando]     = useState(false);
  const [toast,         setToast]         = useState(null);
  const [modalPago,     setModalPago]     = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null); // id del borrador a eliminar
  const [dirty,         setDirty]         = useState(false); // hay cambios sin guardar

  /* ── Clientes ── */
  const [clientes,          setClientes]         = useState([]);
  const [clienteObj,        setClienteObj]       = useState(null);
  const [buscarCliente,     setBuscarCliente]     = useState("");
  const [showClienteDD,     setShowClienteDD]     = useState(false);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [formNuevoCliente,  setFormNuevoCliente]  = useState({ nombre:"", tipoDocumento:"CC", numeroDocumento:"", telefono:"", email:"" });
  const [guardandoCliente,  setGuardandoCliente]  = useState(false);

  /* ── Factura ── */
  const [facturaData,       setFacturaData]       = useState(null);
  const [modalFactura,      setModalFactura]      = useState(false);

  const buscarRef = useRef(null);

  /* ── CSS ── */
  useEffect(() => {
    const id = "pos-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  /* ── Toast ── */
  const msg = useCallback((texto, tipo = "ok") => {
    setToast({ texto, tipo });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ── Cargar borradores ── */
  const cargarBorradores = useCallback(async () => {
    setCargBorradores(true);
    try {
      const data = await apiFetch("/ventas?estado=borrador");
      setBorradores(Array.isArray(data) ? data : data.data || data.ventas || []);
    } catch (e) {
      console.warn("No se pudieron cargar borradores:", e.message);
      setBorradores([]);
    } finally {
      setCargBorradores(false);
    }
  }, []);

  useEffect(() => { cargarBorradores(); }, [cargarBorradores]);

  /* ── Cargar clientes ── */
  const cargarClientes = useCallback(async () => {
    try {
      const data = await apiFetch("/clientes");
      setClientes(Array.isArray(data) ? data : data.data || data.clientes || []);
    } catch (e) {
      console.warn("No se pudieron cargar clientes:", e.message);
    }
  }, []);

  /* ── Cargar productos ── */
  const cargarProductos = useCallback(async () => {
    setCargProds(true);
    try {
      const data = await apiFetch("/productos");
      setProductos(Array.isArray(data) ? data : data.data || data.productos || []);
    } catch (e) {
      msg("Error al cargar productos: " + e.message, "err");
    } finally {
      setCargProds(false);
    }
  }, [msg]);

  /* ── Abrir terminal (nueva venta o borrador) ── */
  const abrirTerminal = (borrador = null) => {
    if (borrador) {
      setVentaActual(borrador);
      setItems(
        (borrador.items || []).map((it) => ({
          producto: it.producto,
          cantidad: it.cantidad,
          precioUnitario: it.precioUnitario ?? it.producto?.price ?? 0,
        }))
      );
      const nombreCliente = borrador.clienteNombre || borrador.cliente?.nombre || "";
      setCliente(nombreCliente);
      setBuscarCliente(nombreCliente);
      setClienteObj(borrador.clienteId ? { _id: borrador.clienteId, nombre: nombreCliente } : null);
      setDescuento(borrador.descuento || 0);
      setMetodoPago(borrador.metodoPago || "efectivo");
      setNotas(borrador.notas || "");
    } else {
      setVentaActual(null);
      setItems([]);
      setCliente("");
      setBuscarCliente("");
      setClienteObj(null);
      setDescuento(0);
      setMetodoPago("efectivo");
      setNotas("");
    }
    setBuscar("");
    setDirty(false);
    setVista("terminal");
    cargarProductos();
    cargarClientes();
    setTimeout(() => buscarRef.current?.focus(), 300);
  };

  const volverDashboard = () => {
    setVista("dashboard");
    setVentaActual(null);
    cargarBorradores();
  };

  /* ── Carrito: agregar/quitar/cambiar cantidad ── */
  const agregarItem = (producto) => {
    if (!producto.stock || producto.stock === 0) return;
    setDirty(true);
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.producto._id === producto._id || it.producto.id === producto.id);
      if (idx > -1) {
        const updated = [...prev];
        const maxStock = Number(producto.stock);
        updated[idx] = {
          ...updated[idx],
          cantidad: Math.min(updated[idx].cantidad + 1, maxStock),
        };
        return updated;
      }
      return [...prev, { producto, cantidad: 1, precioUnitario: Number(producto.price) }];
    });
  };

  const cambiarCantidad = (idx, val) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 1) return;
    setDirty(true);
    setItems((prev) => {
      const updated = [...prev];
      const maxStock = Number(updated[idx].producto.stock);
      updated[idx] = { ...updated[idx], cantidad: Math.min(n, maxStock) };
      return updated;
    });
  };

  const quitarItem = (idx) => { setDirty(true); setItems((prev) => prev.filter((_, i) => i !== idx)); };

  /* ── Cálculos ── */
  const subtotal    = items.reduce((s, it) => s + it.cantidad * it.precioUnitario, 0);
  const descuentoVal= Math.min(Number(descuento) || 0, subtotal);
  const total       = subtotal - descuentoVal;

  /* ── Productos filtrados ── */
  const prodsFiltrados = productos.filter((p) => {
    const q = buscar.toLowerCase();
    return !q ||
      (p.name || "").toLowerCase().includes(q) ||
      String(p.price || "").includes(q);
  });

  /* ── Guardar borrador ── */
  const guardarBorrador = async () => {
    if (items.length === 0) return msg("Agrega al menos un producto", "err");
    setGuardando(true);
    try {
      const body = {
        items: items.map((it) => ({
          producto:       it.producto._id || it.producto.id,
          cantidad:       it.cantidad,
          precioUnitario: it.precioUnitario,
          subtotal:       it.cantidad * it.precioUnitario,
        })),
        clienteNombre: clienteObj?.nombre || cliente,
        clienteId:     clienteObj?._id || clienteObj?.id,
        descuento:     descuentoVal,
        subtotal,
        total,
        metodoPago,
        notas,
        estado: "borrador",
      };

      let data;
      if (ventaActual?._id || ventaActual?.id) {
        data = await apiFetch(`/ventas/${ventaActual._id || ventaActual.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        data = await apiFetch("/ventas", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setVentaActual(data.data || data.venta || data);
      setDirty(false);
      msg("Borrador guardado");
    } catch (e) {
      msg("Error al guardar: " + e.message, "err");
    } finally {
      setGuardando(false);
    }
  };

  /* ── Finalizar venta ── */
  const finalizarVenta = async () => {
    if (items.length === 0) return msg("Agrega al menos un producto", "err");
    setGuardando(true);
    try {
      const body = {
        items: items.map((it) => ({
          producto:       it.producto._id || it.producto.id,
          cantidad:       it.cantidad,
          precioUnitario: it.precioUnitario,
          subtotal:       it.cantidad * it.precioUnitario,
        })),
        clienteNombre: clienteObj?.nombre || cliente,
        clienteId:     clienteObj?._id || clienteObj?.id,
        descuento:     descuentoVal,
        subtotal,
        total,
        metodoPago,
        notas,
        estado: "finalizada",
      };

      let resVenta;
      if (ventaActual?._id || ventaActual?.id) {
        resVenta = await apiFetch(`/ventas/${ventaActual._id || ventaActual.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        resVenta = await apiFetch("/ventas", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      const savedVenta = resVenta.data || resVenta.venta || resVenta;
      setFacturaData({
        id:            savedVenta.numeroFactura || savedVenta._id || savedVenta.id || "—",
        fecha:         new Date(),
        items:         items.map(it => ({ ...it })),
        clienteNombre: clienteObj?.nombre || cliente || "Consumidor Final",
        clienteDoc:    clienteObj ? `${clienteObj.tipoDocumento || ''} ${clienteObj.numeroDocumento || ''}`.trim() : '',
        subtotal,
        descuentoVal,
        total,
        metodoPago,
        notas,
      });
      msg("Venta finalizada correctamente");
      setModalPago(false);
      setModalFactura(true);
    } catch (e) {
      msg("Error al finalizar: " + e.message, "err");
    } finally {
      setGuardando(false);
    }
  };

  /* ── Crear cliente rápido desde el POS ── */
  const crearClienteRapido = async () => {
    if (!formNuevoCliente.nombre.trim()) return msg("El nombre es requerido", "err");
    setGuardandoCliente(true);
    try {
      const data = await apiFetch("/clientes", {
        method: "POST",
        body:   JSON.stringify(formNuevoCliente),
      });
      const nuevo = data.data || data.cliente || data;
      setClientes(prev => [...prev, nuevo]);
      setClienteObj(nuevo);
      setCliente(nuevo.nombre);
      setBuscarCliente(nuevo.nombre);
      setModalNuevoCliente(false);
      setFormNuevoCliente({ nombre:"", tipoDocumento:"CC", numeroDocumento:"", telefono:"", email:"" });
      setDirty(true);
      msg("Cliente creado");
    } catch (e) {
      msg("Error al crear cliente: " + e.message, "err");
    } finally {
      setGuardandoCliente(false);
    }
  };

  /* ── Imprimir factura ── */
  const imprimirFactura = () => {
    if (!facturaData) return;
    let compania = "Tu Tienda";
    try {
      const p = JSON.parse(atob(getToken().split('.')[1]));
      compania = p.companiaNombre || p.empresa || p.compania || compania;
    } catch {}
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Factura</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:24px;max-width:700px;margin:0 auto}
  h1{font-size:20px;font-weight:bold;text-align:center;margin-bottom:4px}
  h2{font-size:13px;text-align:center;color:#555;letter-spacing:2px;margin-bottom:16px}
  .fila-head{display:flex;justify-content:space-between;padding-bottom:14px;border-bottom:2px solid #000;margin-bottom:14px;font-size:12px}
  table{width:100%;border-collapse:collapse;margin:14px 0}
  th,td{border:1px solid #ccc;padding:7px 9px;font-size:12px}
  th{background:#f5f5f5;font-weight:bold}
  .right{text-align:right} .center{text-align:center}
  .totales{margin-top:12px;padding:12px;background:#f9f9f9;border:1px solid #ddd}
  .tot-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
  .tot-final{font-size:16px;font-weight:bold;border-top:2px solid #000;padding-top:8px;margin-top:4px}
  .footer{margin-top:24px;text-align:center;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:12px}
  @media print{@page{margin:12mm}}
</style></head><body>
<h1>${compania}</h1>
<h2>FACTURA DE VENTA</h2>
<div class="fila-head">
  <div>
    <div><strong>Cliente:</strong> ${facturaData.clienteNombre}</div>
    ${facturaData.clienteDoc ? `<div><strong>Doc:</strong> ${facturaData.clienteDoc}</div>` : ''}
  </div>
  <div style="text-align:right">
    <div><strong>N°:</strong> ${facturaData.id}</div>
    <div><strong>Fecha:</strong> ${new Date(facturaData.fecha).toLocaleString('es-CO')}</div>
    <div><strong>Pago:</strong> ${facturaData.metodoPago}</div>
  </div>
</div>
<table>
  <thead><tr><th>Producto</th><th class="center">Cant.</th><th class="right">P. Unit.</th><th class="right">Subtotal</th></tr></thead>
  <tbody>
    ${facturaData.items.map(it => `<tr>
      <td>${it.producto.name}</td>
      <td class="center">${it.cantidad}</td>
      <td class="right">$ ${Number(it.precioUnitario).toLocaleString('es-CO')}</td>
      <td class="right">$ ${(it.cantidad * it.precioUnitario).toLocaleString('es-CO')}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totales">
  <div class="tot-row"><span>Subtotal</span><span>$ ${Number(facturaData.subtotal).toLocaleString('es-CO')}</span></div>
  ${facturaData.descuentoVal > 0 ? `<div class="tot-row" style="color:#b45309"><span>Descuento</span><span>- $ ${Number(facturaData.descuentoVal).toLocaleString('es-CO')}</span></div>` : ''}
  <div class="tot-row tot-final"><span>TOTAL</span><span>$ ${Number(facturaData.total).toLocaleString('es-CO')}</span></div>
</div>
${facturaData.notas ? `<p style="margin-top:12px;font-size:11px;color:#666">Notas: ${facturaData.notas}</p>` : ''}
<div class="footer">${compania} · Generado el ${new Date().toLocaleString('es-CO')}</div>
</body></html>`;
    const w = window.open('', '_blank', 'width=800,height=700');
    if (!w) { msg("Permite ventanas emergentes para imprimir", "err"); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  /* ── Clientes filtrados para el dropdown ── */
  const clientesFiltrados = buscarCliente.length >= 1
    ? clientes.filter(c =>
        (c.nombre || "").toLowerCase().includes(buscarCliente.toLowerCase()) ||
        (c.numeroDocumento || "").includes(buscarCliente)
      )
    : clientes.slice(0, 8);

  /* ── Cancelar borrador ── */
  const eliminarBorrador = async (id) => {
    try {
      await apiFetch(`/ventas/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "cancelada" }),
      });
      msg("Venta cancelada");
      setModalEliminar(null);
      cargarBorradores();
    } catch (e) {
      msg("Error: " + e.message, "err");
    }
  };

  /* ═══════════════════ VISTA DASHBOARD ═══════════════════ */
  if (vista === "dashboard") return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <NavAdmin />
      <div className="dash-wrap">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Punto de Venta</h1>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 3 }}>
              {borradores.length > 0
                ? `${borradores.length} venta${borradores.length !== 1 ? "s" : ""} pendiente${borradores.length !== 1 ? "s" : ""}`
                : "Sin ventas pendientes"}
            </p>
          </div>
        </div>

        <div className="draft-grid">
          {/* Tarjeta nueva venta */}
          <div className="new-sale-card" onClick={() => abrirTerminal()}>
            <div className="new-sale-icon">➕</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#2563EB" }}>Nueva venta</span>
          </div>

          {/* Borradores */}
          {cargBorradores ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748B", padding: 20 }}>
              <div className="spin-dark" /> Cargando...
            </div>
          ) : (
            borradores.map((b) => {
              const id   = b._id || b.id;
              const nits = (b.items || []).reduce((s, it) => s + (it.cantidad || 1), 0);
              return (
                <div key={id} className="draft-card" onClick={() => abrirTerminal(b)}>
                  <button
                    className="draft-card-del bi del"
                    title="Eliminar borrador"
                    onClick={(e) => { e.stopPropagation(); setModalEliminar(id); }}
                  >🗑️</button>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 28 }}>🛒</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>
                        {b.clienteNombre || b.cliente?.nombre || "Sin cliente"}
                      </div>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                        {fechaCorta(b.updatedAt || b.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="badge ba-b">{nits} producto{nits !== 1 ? "s" : ""}</span>
                    <span className="badge bv-b">$ {fmt(b.total)}</span>
                    <span className="badge bam-b">{b.metodoPago || "efectivo"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal confirmar eliminar borrador */}
      {modalEliminar && createPortal(
        <div className="overlay">
          <div className="modal-box">
            <div className="mh">
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Eliminar borrador</h2>
              <button className="bi" onClick={() => setModalEliminar(null)} style={{ fontSize: 20 }}>✕</button>
            </div>
            <div className="mb" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#0F172A" }}>¿Eliminar esta venta pendiente?</p>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>Esta acción no se puede deshacer.</p>
            </div>
            <div className="mf">
              <button className="btn bs" onClick={() => setModalEliminar(null)}>Cancelar</button>
              <button className="btn bd" onClick={() => eliminarBorrador(modalEliminar)}>Sí, eliminar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && createPortal(
        <div className={`toast ${toast.tipo === "err" ? "t-err" : "t-ok"}`}>
          {toast.tipo === "err" ? "❌" : "✅"} {toast.texto}
        </div>, document.body
      )}
    </div>
  );

  /* ═══════════════════ VISTA TERMINAL POS ═══════════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#F8FAFC", overflow: "hidden" }}>
      {/* Header del terminal */}
      <div style={{ height: "var(--nav-h)", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            className="btn bs"
            style={{ padding: "7px 14px", fontSize: 13 }}
            onClick={() => setModalCancelar(true)}
          >
            ← Volver
          </button>
          <span style={{ color: "#94A3B8", fontSize: 13 }}>
            {ventaActual ? "Editando borrador" : "Nueva venta"}
          </span>
          {ventaActual && !dirty && (
            <span className="badge bv-b" style={{ fontSize: 11 }}>✓ Guardado</span>
          )}
          {dirty && (
            <span className="badge bam-b" style={{ fontSize: 11 }}>● Cambios sin guardar</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn bam" onClick={guardarBorrador} disabled={guardando || items.length === 0}>
            {guardando ? <><div className="spin" /> Guardando...</> : "💾 Guardar"}
          </button>
          <button className="btn bv" onClick={() => setModalPago(true)} disabled={items.length === 0}>
            💳 Finalizar venta
          </button>
        </div>
      </div>

      <div className="pos-wrap">
        {/* ── Panel izquierdo: productos ── */}
        <div className="pos-left">
          <div className="pos-left-head">
            <div className="search-wrap" style={{ flex: 1 }}>
              <span className="ico">🔍</span>
              <input
                ref={buscarRef}
                className="ic"
                placeholder="Buscar producto por nombre o precio..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>
              {prodsFiltrados.length} resultado{prodsFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {cargProds ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "#64748B" }}>
              <div className="spin-dark" /> Cargando productos...
            </div>
          ) : prodsFiltrados.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#64748B" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <p style={{ fontSize: 14 }}>Sin productos</p>
              </div>
            </div>
          ) : (
            <div className="pos-prods">
              {prodsFiltrados.map((p) => {
                const pid     = p._id || p.id;
                const agotado = !p.stock || p.stock === 0 || p.stock === "0";
                const enCart  = items.some((it) => (it.producto._id || it.producto.id) === pid);
                return (
                  <div
                    key={pid}
                    className={`prod-card ${agotado ? "agotado" : ""} ${enCart ? "en-carrito" : ""}`}
                    onClick={() => !agotado && agregarItem(p)}
                    title={agotado ? "Sin stock" : `Agregar ${p.name}`}
                  >
                    {p.img
                      ? <img src={p.img} alt={p.name} />
                      : <div className="prod-card-placeholder">📦</div>
                    }
                    <div className="prod-card-body">
                      <div className="prod-card-name">{p.name}</div>
                      <div className="prod-card-price">$ {fmt(p.price)}</div>
                      <div className="prod-card-stock">
                        {agotado
                          ? <span style={{ color: "#DC2626", fontWeight: 600 }}>Agotado</span>
                          : <span>Stock: {p.stock}</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Panel derecho: carrito ── */}
        <div className="pos-right">
          <div className="pos-right-head">
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 8 }}>
              🛒 Carrito {items.length > 0 && <span className="badge ba-b">{items.reduce((s, it) => s + it.cantidad, 0)}</span>}
            </div>
            {/* ── Selector de cliente ── */}
            <div className="ig" style={{ position: "relative" }}>
              <label>Cliente (opcional)</label>
              {clienteObj ? (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", border:"1.5px solid var(--ve)", borderRadius:8, background:"var(--ve3)" }}>
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color:"var(--txt)" }}>{clienteObj.nombre}</span>
                  <button className="bi" style={{ fontSize:13 }} onClick={() => { setClienteObj(null); setCliente(""); setBuscarCliente(""); setDirty(true); }}>✕</button>
                </div>
              ) : (
                <>
                  <input
                    className="ic"
                    placeholder="Buscar o crear cliente..."
                    value={buscarCliente}
                    onChange={(e) => { setBuscarCliente(e.target.value); setCliente(e.target.value); setShowClienteDD(true); setDirty(true); }}
                    onFocus={() => setShowClienteDD(true)}
                    onBlur={() => setTimeout(() => setShowClienteDD(false), 160)}
                    style={{ fontSize:13 }}
                  />
                  {showClienteDD && (
                    <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1px solid var(--gr3)", borderRadius:8, boxShadow:"var(--sh2)", zIndex:200, maxHeight:220, overflowY:"auto" }}>
                      {clientesFiltrados.length === 0 && buscarCliente && (
                        <div style={{ padding:"9px 12px", fontSize:13, color:"var(--gr)" }}>Sin resultados</div>
                      )}
                      {clientesFiltrados.map(c => (
                        <div key={c._id || c.id}
                          style={{ padding:"9px 12px", cursor:"pointer", fontSize:13, borderBottom:"1px solid var(--gr3)", display:"flex", flexDirection:"column", gap:2 }}
                          onMouseDown={() => { setClienteObj(c); setCliente(c.nombre); setBuscarCliente(c.nombre); setShowClienteDD(false); setDirty(true); }}>
                          <span style={{ fontWeight:600 }}>{c.nombre}</span>
                          {c.numeroDocumento && <span style={{ color:"var(--gr)", fontSize:11 }}>{c.tipoDocumento}: {c.numeroDocumento}</span>}
                        </div>
                      ))}
                      <div style={{ padding:"9px 12px", cursor:"pointer", fontSize:13, color:"var(--az)", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}
                        onMouseDown={() => { setShowClienteDD(false); setModalNuevoCliente(true); }}>
                        ➕ Crear nuevo cliente
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Items del carrito */}
          <div className="pos-cart-items">
            {items.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#475569" }}>Carrito vacío</p>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Selecciona productos del catálogo</p>
              </div>
            ) : (
              items.map((it, idx) => {
                const p = it.producto;
                return (
                  <div key={idx} className="cart-item">
                    {p.img
                      ? <img src={p.img} alt={p.name} className="cart-item-img" />
                      : <div className="cart-item-ph">📦</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cart-item-name">{p.name}</div>
                      <div className="cart-item-price">$ {fmt(it.precioUnitario)} c/u</div>
                    </div>
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => it.cantidad === 1 ? quitarItem(idx) : cambiarCantidad(idx, it.cantidad - 1)}>−</button>
                      <span className="qty-val">{it.cantidad}</span>
                      <button className="qty-btn" onClick={() => cambiarCantidad(idx, it.cantidad + 1)}
                        disabled={it.cantidad >= Number(p.stock)}>+</button>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 68 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>
                        $ {fmt(it.cantidad * it.precioUnitario)}
                      </div>
                      <button className="bi del" style={{ fontSize: 13, marginTop: 2 }} onClick={() => quitarItem(idx)} title="Quitar">🗑️</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Totales */}
          <div className="pos-totales">
            <div className="total-row">
              <span>Subtotal</span>
              <span>$ {fmt(subtotal)}</span>
            </div>
            <div className="total-row" style={{ alignItems: "center" }}>
              <span>Descuento</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#94A3B8", fontSize: 12 }}>$</span>
                <input
                  className="ic"
                  type="number" min="0"
                  value={descuento}
                  onChange={(e) => { setDescuento(Math.max(0, Number(e.target.value))); setDirty(true); }}
                  style={{ width: 90, fontSize: 13, padding: "4px 8px", textAlign: "right" }}
                />
              </div>
            </div>
            <div className="total-row big">
              <span>Total</span>
              <span style={{ color: "#059669" }}>$ {fmt(total)}</span>
            </div>

            {/* Método de pago */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Método de pago</div>
              <div className="pay-methods">
                {[["efectivo","💵 Efectivo"],["tarjeta","💳 Tarjeta"],["transferencia","🏦 Transferencia"]].map(([v, l]) => (
                  <button key={v} className={`pay-btn ${metodoPago === v ? "sel" : ""}`} onClick={() => { setMetodoPago(v); setDirty(true); }}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Notas + acciones */}
          <div className="pos-actions">
            <input
              className="ic"
              placeholder="Notas de la venta (opcional)..."
              value={notas}
              onChange={(e) => { setNotas(e.target.value); setDirty(true); }}
              style={{ fontSize: 13 }}
            />
            <button
              className="btn bv"
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15 }}
              onClick={() => setModalPago(true)}
              disabled={items.length === 0 || guardando}
            >
              💳 Finalizar venta · $ {fmt(total)}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal confirmar pago ── */}
      {modalPago && createPortal(
        <div className="overlay">
          <div className="modal-box">
            <div className="mh">
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Confirmar venta</h2>
              <button className="bi" onClick={() => !guardando && setModalPago(false)} style={{ fontSize: 20 }}>✕</button>
            </div>
            <div className="mb">
              <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                {items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0", borderBottom: i < items.length - 1 ? "1px solid #E2E8F0" : "none" }}>
                    <span style={{ color: "#475569" }}>{it.producto.name} × {it.cantidad}</span>
                    <span style={{ fontWeight: 600 }}>$ {fmt(it.cantidad * it.precioUnitario)}</span>
                  </div>
                ))}
              </div>
              {descuentoVal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#D97706", marginBottom: 8 }}>
                  <span>Descuento aplicado</span>
                  <span>- $ {fmt(descuentoVal)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: "#0F172A", borderTop: "2px solid #E2E8F0", paddingTop: 12 }}>
                <span>Total a cobrar</span>
                <span style={{ color: "#059669" }}>$ {fmt(total)}</span>
              </div>
              <div style={{ marginTop: 14, fontSize: 14, color: "#64748B" }}>
                <span>Método: </span>
                <strong style={{ color: "#0F172A" }}>
                  {metodoPago === "efectivo" ? "💵 Efectivo" : metodoPago === "tarjeta" ? "💳 Tarjeta" : "🏦 Transferencia"}
                </strong>
              </div>
              {cliente && (
                <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                  <span>Cliente: </span><strong style={{ color: "#0F172A" }}>{cliente}</strong>
                </div>
              )}
            </div>
            <div className="mf">
              <button className="btn bs" onClick={() => setModalPago(false)} disabled={guardando}>Cancelar</button>
              <button className="btn bv" onClick={finalizarVenta} disabled={guardando}>
                {guardando ? <><div className="spin" /> Procesando...</> : "✅ Confirmar y finalizar"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal confirmar volver ── */}
      {modalCancelar && createPortal(
        <div className="overlay">
          <div className="modal-box">
            <div className="mh">
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>¿Salir del terminal?</h2>
              <button className="bi" onClick={() => setModalCancelar(false)} style={{ fontSize: 20 }}>✕</button>
            </div>
            <div className="mb" style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
              {dirty && items.length > 0
                ? "Tienes cambios sin guardar. Puedes guardar el borrador para continuar después, o salir descartando los cambios."
                : items.length > 0 && !ventaActual
                ? "Tienes productos en el carrito. Puedes guardar como borrador para continuar después, o salir sin guardar."
                : "¿Salir del terminal?"}
            </div>
            <div className="mf" style={{ gap: 8 }}>
              <button className="btn bs" onClick={() => setModalCancelar(false)}>Quedarme</button>
              {(dirty || (!ventaActual && items.length > 0)) && (
                <button className="btn bam" onClick={async () => { setModalCancelar(false); await guardarBorrador(); volverDashboard(); }} disabled={guardando}>
                  💾 Guardar y salir
                </button>
              )}
              <button className="btn bd" onClick={() => { setModalCancelar(false); volverDashboard(); }}>
                {dirty || (!ventaActual && items.length > 0) ? "Salir sin guardar" : "Salir"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal nuevo cliente rápido ── */}
      {modalNuevoCliente && createPortal(
        <div className="overlay">
          <div className="modal-box">
            <div className="mh">
              <h2 style={{ fontSize:17, fontWeight:700 }}>Nuevo cliente</h2>
              <button className="bi" onClick={() => setModalNuevoCliente(false)} style={{ fontSize:20 }}>✕</button>
            </div>
            <div className="mb" style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="ig">
                <label>Nombre *</label>
                <input className="ic" value={formNuevoCliente.nombre}
                  onChange={e => setFormNuevoCliente(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Nombre completo" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="ig">
                  <label>Tipo doc.</label>
                  <select className="ic" value={formNuevoCliente.tipoDocumento}
                    onChange={e => setFormNuevoCliente(p => ({ ...p, tipoDocumento: e.target.value }))}>
                    {["CC","NIT","CE","Pasaporte"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="ig">
                  <label>N° documento</label>
                  <input className="ic" value={formNuevoCliente.numeroDocumento}
                    onChange={e => setFormNuevoCliente(p => ({ ...p, numeroDocumento: e.target.value }))}
                    placeholder="123456789" />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="ig">
                  <label>Teléfono</label>
                  <input className="ic" value={formNuevoCliente.telefono}
                    onChange={e => setFormNuevoCliente(p => ({ ...p, telefono: e.target.value }))}
                    placeholder="3001234567" />
                </div>
                <div className="ig">
                  <label>Email</label>
                  <input className="ic" type="email" value={formNuevoCliente.email}
                    onChange={e => setFormNuevoCliente(p => ({ ...p, email: e.target.value }))}
                    placeholder="correo@ejemplo.com" />
                </div>
              </div>
            </div>
            <div className="mf">
              <button className="btn bs" onClick={() => setModalNuevoCliente(false)} disabled={guardandoCliente}>Cancelar</button>
              <button className="btn bp" onClick={crearClienteRapido} disabled={guardandoCliente}>
                {guardandoCliente ? <><div className="spin" /> Guardando...</> : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal factura (post-venta finalizada) ── */}
      {modalFactura && facturaData && createPortal(
        <div className="overlay">
          <div className="modal-box" style={{ maxWidth:560 }}>
            <div className="mh">
              <h2 style={{ fontSize:17, fontWeight:700 }}>🧾 Factura</h2>
            </div>
            <div className="mb">
              {/* Encabezado */}
              <div style={{ textAlign:"center", paddingBottom:14, borderBottom:"1px solid var(--gr3)", marginBottom:14 }}>
                <div style={{ fontSize:17, fontWeight:700 }}>FACTURA DE VENTA</div>
                <div style={{ fontSize:12, color:"var(--gr)", marginTop:4 }}>
                  N° {facturaData.id} · {new Date(facturaData.fecha).toLocaleString('es-CO')}
                </div>
              </div>
              {/* Cliente */}
              <div style={{ marginBottom:12, padding:"10px 12px", background:"var(--gr2)", borderRadius:8 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{facturaData.clienteNombre}</div>
                {facturaData.clienteDoc && <div style={{ fontSize:12, color:"var(--gr)" }}>{facturaData.clienteDoc}</div>}
              </div>
              {/* Productos */}
              <table style={{ width:"100%", fontSize:13, borderCollapse:"collapse", marginBottom:12 }}>
                <thead>
                  <tr style={{ background:"var(--gr2)" }}>
                    <th style={{ padding:"6px 8px", textAlign:"left", fontWeight:600 }}>Producto</th>
                    <th style={{ padding:"6px 8px", textAlign:"center", fontWeight:600 }}>Cant.</th>
                    <th style={{ padding:"6px 8px", textAlign:"right", fontWeight:600 }}>P.Unit</th>
                    <th style={{ padding:"6px 8px", textAlign:"right", fontWeight:600 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaData.items.map((it, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid var(--gr3)" }}>
                      <td style={{ padding:"6px 8px" }}>{it.producto.name}</td>
                      <td style={{ padding:"6px 8px", textAlign:"center" }}>{it.cantidad}</td>
                      <td style={{ padding:"6px 8px", textAlign:"right" }}>$ {fmt(it.precioUnitario)}</td>
                      <td style={{ padding:"6px 8px", textAlign:"right", fontWeight:600 }}>$ {fmt(it.cantidad * it.precioUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Totales */}
              <div style={{ padding:"10px 12px", background:"var(--gr2)", borderRadius:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span>Subtotal</span><span>$ {fmt(facturaData.subtotal)}</span>
                </div>
                {facturaData.descuentoVal > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"var(--am)", marginBottom:4 }}>
                    <span>Descuento</span><span>- $ {fmt(facturaData.descuentoVal)}</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:700, borderTop:"1px solid var(--gr3)", paddingTop:8, marginTop:4 }}>
                  <span>TOTAL</span><span style={{ color:"var(--ve)" }}>$ {fmt(facturaData.total)}</span>
                </div>
                <div style={{ fontSize:12, color:"var(--gr)", marginTop:6 }}>
                  Método: {facturaData.metodoPago === "efectivo" ? "💵 Efectivo" : facturaData.metodoPago === "tarjeta" ? "💳 Tarjeta" : "🏦 Transferencia"}
                </div>
              </div>
              {facturaData.notas && (
                <div style={{ marginTop:10, fontSize:12, color:"var(--gr)", padding:"8px 12px", background:"var(--am3)", borderRadius:8 }}>
                  Notas: {facturaData.notas}
                </div>
              )}
            </div>
            <div className="mf">
              <button className="btn bs" onClick={() => { setModalFactura(false); volverDashboard(); }}>Cerrar</button>
              <button className="btn bp" onClick={imprimirFactura}>🖨️ Imprimir</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && createPortal(
        <div className={`toast ${toast.tipo === "err" ? "t-err" : "t-ok"}`}>
          {toast.tipo === "err" ? "❌" : "✅"} {toast.texto}
        </div>, document.body
      )}
    </div>
  );
}
