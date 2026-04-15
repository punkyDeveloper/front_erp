import { useState, useEffect, useCallback, useRef } from "react";
import Nav from '../assets/nav/nav';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_URL = process.env.REACT_APP_API_URL || 'https://back-erp.onrender.com/v1';
const getToken   = () => localStorage.getItem('token') || '';
const getCompany = () => localStorage.getItem('companiaId') || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── TIPOS Y ESTADOS ──────────────────────────────────────────────────────────
const TIPOS   = ['Preventivo', 'Correctivo', 'Predictivo', 'Garantía'];
const ESTADOS = ['Pendiente', 'En progreso', 'En espera', 'Finalizado', 'Cancelado'];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);

const estadoColor = (estado) => {
  const map = {
    Finalizado:    { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    'En progreso': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    'En espera':   { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    Pendiente:     { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    Cancelado:     { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  };
  return map[estado] || { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
};

const tipoIcon = (tipo) => {
  if (tipo === 'Preventivo') return '🔧';
  if (tipo === 'Predictivo') return '📊';
  if (tipo === 'Garantía')   return '🛡️';
  return '⚠️';
};

// ─── ESCAPE HTML (previene XSS en ventanas generadas) ────────────────────────
const escHtml = (str) =>
  String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

// ─── GENERADOR DE FACTURA (HTML local) ───────────────────────────────────────
const generarFactura = (item) => {
  const fechaDoc    = new Date(item.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const fechaEmision = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const num          = `MEC-${String(item._id || item.id).slice(-6).toUpperCase()}`;

  const sRows = (item.servicios || []).map((s) =>
    `<tr><td style="padding:10px 8px;border-bottom:1px solid #F0F0F5;font-size:13px;">🔧 ${escHtml(s.nombre)}</td>
     <td style="padding:10px 8px;border-bottom:1px solid #F0F0F5;text-align:center;font-size:12px;color:#9CA3AF;">Mano de obra</td>
     <td style="padding:10px 8px;border-bottom:1px solid #F0F0F5;text-align:right;font-weight:600;font-size:13px;">${fmt(s.precio)}</td></tr>`
  ).join('');

  const pRows = (item.productos || []).map((p) =>
    `<tr><td style="padding:10px 8px;border-bottom:1px solid #F0F0F5;font-size:13px;">📦 ${escHtml(p.nombre)}</td>
     <td style="padding:10px 8px;border-bottom:1px solid #F0F0F5;text-align:center;font-size:12px;color:#7C3AED;font-weight:600;">Repuesto</td>
     <td style="padding:10px 8px;border-bottom:1px solid #F0F0F5;text-align:right;font-weight:600;font-size:13px;">${fmt(p.precioVenta)}</td></tr>`
  ).join('');

  const stServ = (item.servicios || []).reduce((s, x) => s + (x.precio || 0), 0);
  const stProd = (item.productos || []).reduce((s, p) => s + (p.precioVenta || 0), 0);
  const iva    = Math.round((stServ + stProd) * 0.19);

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Factura ${escHtml(num)}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'DM Sans',sans-serif;background:#F8F9FA;padding:40px 20px;}
.inv{max-width:680px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
.hdr{background:linear-gradient(135deg,#1A1A2E,#3D3D6B);padding:36px 40px;color:#fff;display:flex;justify-content:space-between;}
.hdr h1{font-size:24px;font-weight:700;}.hdr p{font-size:12px;opacity:.7;margin-top:4px;}
.hdr .num h2{font-size:20px;font-weight:700;text-align:right;}.hdr .num p{font-size:12px;opacity:.7;text-align:right;margin-top:4px;}
.bdy{padding:36px 40px;}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;}
.sec h4{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF;font-weight:700;margin-bottom:8px;}
.sec p{font-size:13px;color:#1A1A2E;font-weight:500;line-height:1.7;}.sec .lb{font-size:11px;color:#9CA3AF;font-weight:400;}
table{width:100%;border-collapse:collapse;margin-bottom:20px;}
th{padding:10px 8px;background:#FAFAFA;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9CA3AF;font-weight:700;border-bottom:2px solid #F0F0F5;text-align:left;}
th:nth-child(2){text-align:center;}th:last-child{text-align:right;}
.tots{border-top:1px solid #F0F0F5;padding-top:14px;}.tr{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#6B7280;}
.tr.main{font-size:17px;font-weight:700;color:#1A1A2E;border-top:2px solid #1A1A2E;padding-top:10px;margin-top:6px;}
.ftr{background:#FAFAFA;border-top:1px solid #F0F0F5;padding:18px 40px;text-align:center;font-size:12px;color:#9CA3AF;}
@media print{body{background:#fff;padding:0;}.inv{box-shadow:none;border-radius:0;}.np{display:none!important;}}
</style></head><body>
<div class="inv">
  <div class="hdr"><div><h1>⚙️ Mecánica</h1><p>Sistema de Gestión Vehicular</p></div><div class="num"><h2>${escHtml(num)}</h2><p>Emitida: ${escHtml(fechaEmision)}</p></div></div>
  <div class="bdy">
    <div class="grid">
      <div class="sec"><h4>Cliente</h4><p><span class="lb">Cédula:</span><br/>${escHtml(item.cedula)}</p></div>
      <div class="sec"><h4>Vehículo</h4><p>${escHtml(item.vehiculo)}<br/><span class="lb">Placa:</span> ${escHtml(item.placa)}<br/><span class="lb">Km:</span> ${(item.kilometraje||0).toLocaleString()}</p></div>
      <div class="sec"><h4>Taller</h4><p>${escHtml(item.taller || '—')}</p></div>
      <div class="sec"><h4>Servicio</h4><p><span class="lb">Fecha:</span> ${escHtml(fechaDoc)}<br/>${tipoIcon(item.tipo)} ${escHtml(item.tipo)}</p></div>
    </div>
    ${item.descripcion ? `<div style="background:#F8F9FA;border-radius:10px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#4B5563;border-left:3px solid #1A1A2E;"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#9CA3AF;display:block;margin-bottom:4px;">Descripción</strong>${escHtml(item.descripcion)}</div>` : ''}
    <table><thead><tr><th>Concepto</th><th style="text-align:center;">Tipo</th><th style="text-align:right;">Valor</th></tr></thead>
    <tbody>${sRows}${pRows}${!sRows && !pRows ? '<tr><td colspan="3" style="padding:14px 8px;color:#9CA3AF;font-size:13px;">Sin conceptos</td></tr>' : ''}</tbody></table>
    <div class="tots">
      <div class="tr"><span>Subtotal mano de obra</span><span>${fmt(stServ)}</span></div>
      <div class="tr"><span>Subtotal repuestos</span><span>${fmt(stProd)}</span></div>
      <div class="tr"><span>IVA (19%)</span><span>${fmt(iva)}</span></div>
      <div class="tr main"><span>TOTAL</span><span>${fmt(item.costoCliente || 0)}</span></div>
    </div>
  </div>
  <div class="ftr">Gracias por su confianza · ${escHtml(num)} · ${escHtml(fechaEmision)}</div>
</div>
<div class="np" style="max-width:680px;margin:20px auto;text-align:center;">
  <button onclick="window.print()" style="padding:12px 28px;background:linear-gradient(135deg,#1A1A2E,#3D3D6B);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🖨️ Imprimir / PDF</button>
</div></body></html>`;

  const win = window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank');
  if (win) win.focus();
};

// ─── GENERADOR ORDEN DE SERVICIOS ────────────────────────────────────────────
const generarOrden = (item) => {
  const fechaDoc    = new Date(item.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const fechaEmision = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const num          = `ORD-${String(item._id || item.id).slice(-6).toUpperCase()}`;

  const sRows = (item.servicios || []).map((s, i) =>
    `<tr><td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;font-size:13px;">
       <div style="display:flex;align-items:center;gap:8px;">
         <div style="width:20px;height:20px;border-radius:50%;background:#EEF2FF;color:#4338CA;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">${i+1}</div>
         🔧 ${escHtml(s.nombre)}
       </div></td>
     <td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;font-size:11px;color:#7C3AED;font-weight:600;text-align:center;">Mano de obra</td>
     <td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;text-align:center;"><div style="width:18px;height:18px;border:2px solid #D1D5DB;border-radius:4px;display:inline-block;"></div></td>
     <td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;text-align:right;font-weight:600;font-size:13px;">${fmt(s.precio)}</td></tr>`
  ).join('');

  const pRows = (item.productos || []).map((p) =>
    `<tr><td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;font-size:13px;">
       <div style="display:flex;align-items:center;gap:8px;">
         <div style="width:20px;height:20px;border-radius:50%;background:#F3E8FF;color:#7C3AED;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">P</div>
         📦 ${escHtml(p.nombre)}
       </div></td>
     <td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;font-size:11px;color:#059669;font-weight:600;text-align:center;">Repuesto</td>
     <td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;text-align:center;"><div style="width:18px;height:18px;border:2px solid #D1D5DB;border-radius:4px;display:inline-block;"></div></td>
     <td style="padding:12px 10px;border-bottom:1px solid #F0F0F5;text-align:right;font-weight:600;font-size:13px;">${fmt(p.precioVenta)}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Orden ${escHtml(num)}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'DM Sans',sans-serif;background:#F8F9FA;padding:40px 20px;}
.ord{max-width:680px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
.hdr{background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;color:#fff;display:flex;justify-content:space-between;}
.hdr h1{font-size:22px;font-weight:700;}.hdr p{font-size:12px;opacity:.7;margin-top:4px;}
.hdr .num h2{font-size:18px;font-weight:700;text-align:right;}.hdr .num p{font-size:11px;opacity:.75;text-align:right;margin-top:4px;}
.bdy{padding:32px 40px;}
.info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;padding:18px;background:#F8FFFE;border-radius:12px;border:1px solid #D1FAE5;}
.inf .lb{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#059669;font-weight:700;margin-bottom:3px;}
.inf .vl{font-size:13px;color:#1A1A2E;font-weight:600;line-height:1.4;}
.stitle{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#9CA3AF;font-weight:700;margin-bottom:10px;}
table{width:100%;border-collapse:collapse;margin-bottom:18px;}
th{padding:10px;background:#F9FAFB;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9CA3AF;font-weight:700;border-bottom:2px solid #F0F0F5;text-align:left;}
th:nth-child(2){text-align:center;}th:nth-child(3){text-align:center;}th:last-child{text-align:right;}
.tbox{background:linear-gradient(135deg,#059669,#047857);border-radius:12px;padding:14px 18px;display:flex;justify-content:space-between;margin-bottom:24px;}
.tbox .lb{font-size:13px;color:rgba(255,255,255,.8)}.tbox .vl{font-size:18px;font-weight:700;color:#fff;}
.signs{display:grid;grid-template-columns:1fr 1fr;gap:20px;}.sb{text-align:center;}
.sl{border-top:1.5px dashed #D1D5DB;margin-top:50px;margin-bottom:6px;}
.slb{font-size:10px;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}
.ftr{background:#F0FDF4;border-top:1px solid #D1FAE5;padding:14px 40px;text-align:center;font-size:11px;color:#059669;font-weight:500;}
@media print{body{background:#fff;padding:0;}.ord{box-shadow:none;border-radius:0;}.np{display:none!important;}}
</style></head><body>
<div class="ord">
  <div class="hdr"><div><h1>🔧 Orden de Trabajo</h1><p>Sistema de Gestión Vehicular</p></div>
  <div class="num"><h2>${escHtml(num)}</h2><p>Fecha: ${escHtml(fechaEmision)}</p></div></div>
  <div class="bdy">
    <div class="info">
      <div class="inf"><div class="lb">Cliente (C.C.)</div><div class="vl">${escHtml(item.cedula)}</div></div>
      <div class="inf"><div class="lb">Vehículo</div><div class="vl">${escHtml(item.vehiculo)}</div></div>
      <div class="inf"><div class="lb">Placa</div><div class="vl" style="font-family:monospace;">${escHtml(item.placa)}</div></div>
      <div class="inf"><div class="lb">Kilometraje</div><div class="vl">${(item.kilometraje||0).toLocaleString()} km</div></div>
      <div class="inf"><div class="lb">Taller</div><div class="vl">${escHtml(item.taller || '—')}</div></div>
      <div class="inf"><div class="lb">Fecha</div><div class="vl">${escHtml(fechaDoc)}</div></div>
    </div>
    ${item.descripcion ? `<div style="background:#FFFBEB;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#78350F;border-left:3px solid #F59E0B;"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#D97706;display:block;margin-bottom:4px;">Descripción</strong>${escHtml(item.descripcion)}</div>` : ''}
    <div class="stitle">Servicios y repuestos</div>
    <table><thead><tr><th>Concepto</th><th style="text-align:center;">Tipo</th><th style="text-align:center;">✓</th><th style="text-align:right;">Valor</th></tr></thead>
    <tbody>${sRows}${pRows}</tbody></table>
    <div class="tbox"><span class="lb">💰 Total estimado</span><span class="vl">${fmt(item.costoCliente || 0)}</span></div>
    <div class="stitle">Autorización</div>
    <div class="signs"><div class="sb"><div class="sl"></div><div class="slb">Firma del cliente</div></div>
    <div class="sb"><div class="sl"></div><div class="slb">Firma del técnico</div></div></div>
  </div>
  <div class="ftr">Orden ${escHtml(num)} · ${escHtml(fechaEmision)} · Por favor conserve este documento</div>
</div>
<div class="np" style="max-width:680px;margin:20px auto;text-align:center;">
  <button onclick="window.print()" style="padding:12px 28px;background:linear-gradient(135deg,#059669,#047857);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🖨️ Imprimir / PDF</button>
</div></body></html>`;

  const win = window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank');
  if (win) win.focus();
};

// ─── EMPTY FORM ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  cedula: '', placa: '', vehiculo: '', tipo: 'Preventivo',
  descripcion: '', kilometraje: '',
  fecha: new Date().toISOString().split('T')[0],
  estado: 'Pendiente', taller: '',
  servicios: [],
  productos: [],
  // Datos del cliente para factura
  clienteId: '',
  nombreCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  ciudadCliente: '',
  tipoDocumentoCliente: 'CC',
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app:        { fontFamily: "'DM Sans', sans-serif", background: '#FAFAFA', minHeight: '100vh', color: '#1A1A2E' },
  header:     { background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid #E8E8ED', padding: '20px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' },
  main:       { maxWidth: 1240, margin: '0 auto', padding: '28px 36px 60px' },
  statsRow:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 },
  statCard:   { background: '#FFF', borderRadius: 14, padding: '20px 22px', border: '1px solid #F0F0F5' },
  statLabel:  { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', fontWeight: 600, marginBottom: 6 },
  statValue:  { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' },
  toolbar:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 14, flexWrap: 'wrap' },
  search:     { display: 'flex', alignItems: 'center', background: '#FFF', border: '1px solid #E8E8ED', borderRadius: 10, padding: '9px 14px', gap: 8, flex: 1, maxWidth: 380 },
  searchIn:   { border: 'none', outline: 'none', fontSize: 13, color: '#1A1A2E', background: 'transparent', width: '100%', fontFamily: "'DM Sans', sans-serif" },
  filterGrp:  { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn:  (a) => ({ padding: '7px 14px', borderRadius: 8, border: a ? '1.5px solid #1A1A2E' : '1px solid #E8E8ED', background: a ? '#1A1A2E' : '#FFF', color: a ? '#FFF' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }),
  btnPrimary: { padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#1A1A2E,#3D3D6B)', color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif" },
  table:      { width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#FFF' },
  th:         { textAlign: 'left', padding: '12px 14px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', fontWeight: 700, borderBottom: '1px solid #F0F0F5', background: '#FAFAFC', whiteSpace: 'nowrap' },
  td:         { padding: '12px 14px', fontSize: 13, borderBottom: '1px solid #F7F7FA', verticalAlign: 'middle' },
  badge:      (c) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}` }),
  chip:       { display: 'inline-block', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#F0F0F5', color: '#4B5563', whiteSpace: 'nowrap' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:      { background: '#FFF', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', padding: '32px 36px 28px', boxShadow: '0 25px 60px rgba(0,0,0,.15)' },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  fGroup:     { display: 'flex', flexDirection: 'column', gap: 5 },
  fLabel:     { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' },
  fInput:     { padding: '9px 12px', borderRadius: 9, border: '1px solid #E8E8ED', fontSize: 13, color: '#1A1A2E', fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#FAFAFC' },
  fSelect:    { padding: '9px 12px', borderRadius: 9, border: '1px solid #E8E8ED', fontSize: 13, color: '#1A1A2E', fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#FAFAFC', cursor: 'pointer' },
  fFull:      { gridColumn: '1 / -1' },
  svcList:    { border: '1px solid #E8E8ED', borderRadius: 9, background: '#FAFAFC', maxHeight: 180, overflowY: 'auto', padding: '5px' },
  svcOpt:     (sel) => ({ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: sel ? '#EEF2FF' : 'transparent', color: sel ? '#1A1A2E' : '#4B5563', fontWeight: sel ? 600 : 400 }),
  chk:        (c) => ({ width: 14, height: 14, borderRadius: 3, border: c ? 'none' : '1.5px solid #D1D5DB', background: c ? '#1A1A2E' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: '#FFF' }),
  svcCard:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, border: '1px solid #E8E8ED', background: '#FFF', marginBottom: 5 },
  totalBox:   { background: 'linear-gradient(135deg,#1A1A2E,#3D3D6B)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  privBox:    { background: 'linear-gradient(135deg,#4C1D95,#7C3AED)', borderRadius: 12, padding: '14px 18px' },
  deleteModal:{ background: '#FFF', borderRadius: 20, width: '100%', maxWidth: 400, padding: '32px 36px', boxShadow: '0 25px 60px rgba(0,0,0,.15)', textAlign: 'center' },
  btnCancel:  { padding: '9px 20px', borderRadius: 9, border: '1px solid #E8E8ED', background: '#FFF', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnDanger:  { padding: '9px 20px', borderRadius: 9, border: 'none', background: '#EF4444', color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:none}}
  @keyframes rowIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  tr:hover td{background:#FAFAFC;}
  input:focus,select:focus{border-color:#1A1A2E!important;}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
  .table-wrap{overflow-x:auto;border-radius:14px;border:1px solid #F0F0F5;}
  .table-wrap table{min-width:1060px;}
  .cliente-found{animation:fadeIn 0.2s ease;}
  @media(max-width:768px){.stats-row{grid-template-columns:1fr 1fr!important}
    .toolbar-wrap{flex-direction:column!important;align-items:stretch!important}
    .form-modal{padding:20px 16px!important;margin:12px;max-width:calc(100%-24px)!important}
    .form-grid-r{grid-template-columns:1fr!important}}
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ConsultarMantenimientos() {
  const [data, setData]               = useState([]);
  const [catalogo, setCatalogo]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterEstado, setFilter]     = useState('Todos');
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteTarget, setDelTarget]  = useState(null);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [hoveredRow, setHovRow]       = useState(null);
  const [page, setPage]               = useState(1);
  const [rowsPerPage, setRpp]         = useState(20);
  const [total, setTotal]             = useState(0);
  const [apiStats, setApiStats]       = useState({ totalRegistros: 0, finalizados: 0, enProceso: 0, ingresos: 0 });

  // ── Permisos ───────────────────────────────────────────────────────────────
  const [permisos, setPermisos] = useState(() => {
    try {
      const ls = localStorage.getItem('permisos') || localStorage.getItem('userPermisos');
      if (ls) { const p = JSON.parse(ls); if (Array.isArray(p) && p.length) return p; }
      const token = localStorage.getItem('token') || '';
      if (!token) return [];
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.permisos || payload.rol?.permisos || [];
    } catch { return []; }
  });
  const can = (p) => permisos.includes(p);

  useEffect(() => {
    if (permisos.length > 0) return;
    (async () => {
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const r = await fetch(`${API_URL}/roles`, { headers: authHeaders() });
        const j = await r.json();
        const roles = j.data || j;
        const rol = Array.isArray(roles)
          ? roles.find(x => x.nombre === payload.rol || x.rol === payload.rol)
          : null;
        if (rol?.permisos?.length) setPermisos(rol.permisos);
      } catch (_) {}
    })();
  }, []);

  // ── Estado búsqueda de cliente ─────────────────────────────────────────────
  const [clienteInfo, setClienteInfo]       = useState(null);
  const [clienteEstado, setClienteEstado]   = useState('idle'); // 'idle'|'buscando'|'encontrado'|'no_encontrado'
  const [creandoCliente, setCreandoCliente] = useState(false);
  const cedulaTimerRef                       = useRef(null);

  const companiaId = getCompany();

  // ── Totales del formulario ──────────────────────────────────────────────────
  const costoCalculado =
    form.servicios.reduce((s, x) => s + (Number(x.precio) || 0), 0) +
    form.productos.reduce((s, p) => s + (Number(p.precioVenta) || 0), 0);

  const gananciasCalculadas = form.productos.reduce(
    (s, p) => s + ((Number(p.precioVenta) || 0) - (Number(p.costo) || 0)), 0,
  );

  // ── Fetch mantenimientos ────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({
        page, limit: rowsPerPage,
        ...(filterEstado !== 'Todos' && { estado: filterEstado }),
      });
      const r = await fetch(`${API_URL}/mecanica?${qs}`, { headers: authHeaders() });
      const j = await r.json();
      if (!r.ok) throw new Error(j.msg || 'Error al cargar');
      setData(j.data || []);
      setTotal(j.total || 0);
      if (j.stats) setApiStats(j.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [companiaId, page, rowsPerPage, filterEstado]);

  // ── Fetch catálogo de servicios ─────────────────────────────────────────────
  const fetchCatalogo = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/servicios`, { headers: authHeaders() });
      const j = await r.json();
      if (r.ok) setCatalogo(j.data || j || []);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchData(); },     [fetchData]);
  useEffect(() => { fetchCatalogo(); }, [fetchCatalogo]);
  useEffect(() => { setPage(1); },      [filterEstado, rowsPerPage]);

  // ── Buscar cliente por número de documento ──────────────────────────────────
  const buscarCliente = useCallback(async (cedula) => {
    if (!cedula || cedula.length < 6) {
      setClienteInfo(null);
      setClienteEstado('idle');
      return;
    }
    setClienteEstado('buscando');
    try {
      const r = await fetch(`${API_URL}/clientes?buscar=${encodeURIComponent(cedula)}`, { headers: authHeaders() });
      const j = await r.json();
      if (!r.ok) throw new Error();
      const lista = j.data || [];
      const encontrado = lista.find((c) => c.numeroDocumento === cedula);
      if (encontrado) {
        setClienteInfo(encontrado);
        setClienteEstado('encontrado');
        // Auto-llenar datos del cliente en el form
        setForm((f) => ({
          ...f,
          clienteId:            encontrado._id || '',
          nombreCliente:        encontrado.nombre || '',
          emailCliente:         encontrado.email || '',
          telefonoCliente:      encontrado.telefono || encontrado.celular || '',
          ciudadCliente:        encontrado.ciudad || '',
          tipoDocumentoCliente: encontrado.tipoDocumento || 'CC',
        }));
      } else {
        setClienteInfo(null);
        setClienteEstado('no_encontrado');
        // Limpiar datos de cliente previos
        setForm((f) => ({
          ...f,
          clienteId: '', nombreCliente: '', emailCliente: '',
          telefonoCliente: '', ciudadCliente: '', tipoDocumentoCliente: 'CC',
        }));
      }
    } catch (_) {
      setClienteInfo(null);
      setClienteEstado('no_encontrado');
    }
  }, []);

  // ── Crear cliente desde el modal de mecánica ────────────────────────────────
  const crearClienteRapido = async () => {
    if (!form.nombreCliente.trim() || !form.cedula || !form.emailCliente.trim()) {
      setError('Para registrar el cliente ingresa nombre, cédula y correo electrónico.');
      return;
    }
    setCreandoCliente(true);
    try {
      const body = {
        nombre:          form.nombreCliente,
        tipoDocumento:   form.tipoDocumentoCliente || 'CC',
        numeroDocumento: form.cedula,
        email:           form.emailCliente,
        telefono:        form.telefonoCliente || '',
        ciudad:          form.ciudadCliente || '',
        activo:          true,
      };
      const r = await fetch(`${API_URL}/clientes`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.msg || 'Error al crear cliente');
      // Marcar como encontrado con los datos recién creados
      setClienteInfo({ ...body, _id: j.data?._id });
      setClienteEstado('encontrado');
      setForm((f) => ({ ...f, clienteId: j.data?._id || '' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setCreandoCliente(false);
    }
  };

  // ── Handler cambio cédula con debounce ─────────────────────────────────────
  const handleCedulaChange = (val) => {
    const limpio = val.replace(/\D/g, '');
    upField('cedula', limpio);
    setClienteInfo(null);
    setClienteEstado('idle');
    clearTimeout(cedulaTimerRef.current);
    if (limpio.length >= 6) {
      setClienteEstado('buscando');
      cedulaTimerRef.current = setTimeout(() => buscarCliente(limpio), 600);
    } else {
      // Limpiar campos si borra la cédula
      setForm((f) => ({
        ...f, cedula: limpio,
        clienteId: '', nombreCliente: '', emailCliente: '',
        telefonoCliente: '', ciudadCliente: '',
      }));
    }
  };

  // ── Stats globales desde el API ─────────────────────────────────────────────
  const stats = {
    total:       apiStats.totalRegistros || total,
    finalizados: apiStats.finalizados,
    enProceso:   apiStats.enProceso,
    ingresos:    apiStats.ingresos,
  };

  // ── Filtro local ────────────────────────────────────────────────────────────
  const filtered = data.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.cedula?.toLowerCase().includes(q) ||
      item.placa?.toLowerCase().includes(q) ||
      item.vehiculo?.toLowerCase().includes(q) ||
      item.descripcion?.toLowerCase().includes(q) ||
      item.taller?.toLowerCase().includes(q)
    );
  });

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setClienteInfo(null);
    setClienteEstado('idle');
    setCreandoCliente(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id || item.id);
    setForm({
      cedula:               item.cedula || '',
      placa:                item.placa || '',
      vehiculo:             item.vehiculo || '',
      tipo:                 item.tipo || 'Preventivo',
      descripcion:          item.descripcion || '',
      kilometraje:          String(item.kilometraje || ''),
      fecha:                (item.fecha || '').split('T')[0] || new Date().toISOString().split('T')[0],
      estado:               item.estado || 'Pendiente',
      taller:               item.taller || '',
      servicios:            (item.servicios || []).map((s) => ({ ...s })),
      productos:            (item.productos || []).map((p) => ({ ...p })),
      clienteId:            item.clienteId || '',
      nombreCliente:        item.nombreCliente || '',
      emailCliente:         item.emailCliente || '',
      telefonoCliente:      item.telefonoCliente || '',
      ciudadCliente:        item.ciudadCliente || '',
      tipoDocumentoCliente: item.tipoDocumentoCliente || 'CC',
    });
    // Al editar también buscar el cliente
    setClienteInfo(null);
    setClienteEstado('idle');
    if (item.cedula && item.cedula.length >= 6) {
      setClienteEstado('buscando');
      buscarCliente(item.cedula);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.cedula || !form.placa || !form.vehiculo || !form.descripcion) return;
    try {
      setSaving(true);
      const body = {
        ...form,
        kilometraje: Number(form.kilometraje) || 0,
        // No enviar productos ni servicios con nombre vacío
        productos: (form.productos || []).filter(p => p.nombre && p.nombre.trim()),
        servicios: (form.servicios || []).filter(s => s.nombre && s.nombre.trim()),
      };
      const url    = editingId ? `${API_URL}/mecanica/${editingId}` : `${API_URL}/mecanica`;
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.msg || 'Error al guardar');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const r = await fetch(`${API_URL}/mecanica/${deleteTarget._id || deleteTarget.id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.msg || 'Error al eliminar');
      setDelTarget(null);
      fetchData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleFinalizar = async (item) => {
    const id = item._id || item.id;
    try {
      setSaving(true);
      const r = await fetch(`${API_URL}/mecanica/${id}/finalizar`, {
        method: 'PATCH', headers: authHeaders(),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.msg || 'Error al finalizar');
      setData((prev) => prev.map((d) => (d._id === id || d.id === id) ? j.data : d));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const upField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // ── Servicios del catálogo ──────────────────────────────────────────────────
  const opcionesServicios = catalogo.flatMap((svc) => {
    // precio del servicio puede llamarse precio o valor según el modelo
    const precioSvc = svc.precio || svc.valor || 0;
    const base = precioSvc > 0
      ? [{ id: svc._id, nombre: svc.nombre, precio: precioSvc, tipo: 'servicio' }]
      : [];
    // subservicios vienen del populate('idSupservicios')
    const subsRaw = svc.idSupservicios || svc.subServicios || svc.supServicios || [];
    const subs = subsRaw
      .map((sub) => ({
        id: sub._id,
        nombre: `↳ ${sub.supnombre || sub.nombre || 'Sub-servicio'}`,
        precio: sub.supvalor || sub.precio || sub.valor || 0,
        tipo: 'subservicio',
        servicioId: svc._id,
      }))
      .filter((sub) => sub.precio > 0);
    return [...base, ...subs];
  });

  const toggleServicio = (opc) => {
    const existe = form.servicios.find((s) => s.nombre === opc.nombre);
    if (existe) {
      upField('servicios', form.servicios.filter((s) => s.nombre !== opc.nombre));
    } else {
      upField('servicios', [
        ...form.servicios,
        { servicioId: opc.id || null, nombre: opc.nombre, precio: opc.precio },
      ]);
    }
  };

  const updServicioPrecio = (nombre, p) =>
    upField('servicios', form.servicios.map((s) => s.nombre === nombre ? { ...s, precio: Number(p) || 0 } : s));

  // ── Paginación ──────────────────────────────────────────────────────────────
  const totalPgs  = Math.max(1, Math.ceil(total / rowsPerPage));
  const paginator = (p) => setPage(Math.min(Math.max(1, p), totalPgs));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Nav />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
        <div style={S.app}>
          <style>{CSS}</style>

          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <header style={S.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1A1A2E,#3D3D6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 17, fontWeight: 700 }}>M</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>Mantenimientos</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gestión vehicular</div>
              </div>
            </div>
            {can('crear_mecanica') && (
              <button style={S.btnPrimary} onClick={openCreate}>
                <span style={{ fontSize: 17 }}>+</span> Nuevo Mantenimiento
              </button>
            )}
          </header>

          <main style={S.main}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#DC2626', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                {error}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 16 }} onClick={() => setError('')}>✕</button>
              </div>
            )}

            {/* ── STATS ──────────────────────────────────────────────────── */}
            <div style={S.statsRow} className="stats-row">
              {[
                { label: 'Total registros', value: stats.total,         accent: '#1A1A2E' },
                { label: 'Finalizados',      value: stats.finalizados,  accent: '#059669' },
                { label: 'En proceso',       value: stats.enProceso,    accent: '#EA580C' },
                { label: 'Ingresos totales', value: fmt(stats.ingresos), accent: '#7C3AED' },
              ].map((s, i) => (
                <div key={i} style={S.statCard}>
                  <div style={S.statLabel}>{s.label}</div>
                  <div style={{ ...S.statValue, color: s.accent }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* ── TOOLBAR ────────────────────────────────────────────────── */}
            <div style={S.toolbar} className="toolbar-wrap">
              <div style={S.search}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input style={S.searchIn} placeholder="Buscar por cédula, placa, vehículo..." value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setSearch('')}>✕</button>}
              </div>
              <div style={S.filterGrp}>
                {['Todos', ...ESTADOS].map((e) => (
                  <button key={e} style={S.filterBtn(filterEstado === e)} onClick={() => setFilter(e)}>{e}</button>
                ))}
              </div>
            </div>

            {/* ── TABLE ──────────────────────────────────────────────────── */}
            <div className="table-wrap">
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Cliente (C.C.)', 'Vehículo', 'Tipo', 'Servicios', 'Descripción', 'Km', 'Fecha', 'Estado', 'Total', 'Acciones'].map((h) => (
                      <th key={h} style={{ ...S.th, ...(h === 'Acciones' && { textAlign: 'center' }) }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                      <div style={{ fontSize: 28 }}>⏳</div>
                      <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Cargando...</div>
                    </td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                      <div style={{ fontSize: 36 }}>🔍</div>
                      <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Sin registros</div>
                    </td></tr>
                  ) : filtered.map((item, idx) => {
                    const ec = estadoColor(item.estado);
                    const sNombres = (item.servicios || []).map((s) => s.nombre);
                    const id = item._id || item.id;
                    return (
                      <tr key={id} style={{ animation: `rowIn 0.25s ease ${idx * 0.03}s both` }}
                        onMouseEnter={() => setHovRow(id)} onMouseLeave={() => setHovRow(null)}>
                        <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{item.cedula}</span></td>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{item.vehiculo}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{item.placa}</div>
                        </td>
                        <td style={S.td}><span style={{ fontSize: 13 }}>{tipoIcon(item.tipo)} {item.tipo}</span></td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 180 }}>
                            {sNombres.slice(0, 2).map((s, i) => <span key={i} style={S.chip}>{s}</span>)}
                            {sNombres.length > 2 && <span style={{ ...S.chip, background: '#1A1A2E', color: '#FFF' }}>+{sNombres.length - 2}</span>}
                            {sNombres.length === 0 && <span style={{ color: '#D1D5DB', fontSize: 11 }}>—</span>}
                          </div>
                        </td>
                        <td style={{ ...S.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.descripcion}</td>
                        <td style={S.td}>{(item.kilometraje || 0).toLocaleString()} km</td>
                        <td style={{ ...S.td, whiteSpace: 'nowrap', fontSize: 12 }}>
                          {new Date(item.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={S.td}><span style={S.badge(ec)}>{item.estado}</span></td>
                        <td style={{ ...S.td, fontWeight: 600 }}>{fmt(item.costoCliente || 0)}</td>
                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, opacity: hoveredRow === id ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                            {/* ORDEN — visible para quien puede ver */}
                            {can('ver_mecanica') && (
                              <button title="Orden de servicios" onClick={() => generarOrden(item)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '5px 6px', borderRadius: 7, border: '1px solid #D1FAE5', background: '#F0FDF4', cursor: 'pointer', fontSize: 13 }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#DCFCE7'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#F0FDF4'}>
                                <span>📋</span><span style={{ fontSize: 8, fontWeight: 700, color: '#059669' }}>ORDEN</span>
                              </button>
                            )}
                            {/* FACTURA — visible para quien puede ver */}
                            {can('ver_mecanica') && (
                              <button title="Descargar factura" onClick={() => generarFactura(item)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '5px 6px', borderRadius: 7, border: '1px solid #DBEAFE', background: '#EFF6FF', cursor: 'pointer', fontSize: 13 }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}>
                                <span>🧾</span><span style={{ fontSize: 8, fontWeight: 700, color: '#2563EB' }}>FACTURA</span>
                              </button>
                            )}
                            {/* FINALIZAR — requiere editar */}
                            {can('editar_mecanica') && item.estado !== 'Finalizado' && (
                              <button title="Marcar como finalizado" onClick={() => handleFinalizar(item)} disabled={saving}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '5px 6px', borderRadius: 7, border: '1px solid #E8E8ED', background: '#FFF', cursor: 'pointer', fontSize: 13 }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#ECFDF5'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#FFF'}>
                                <span>✓</span><span style={{ fontSize: 8, fontWeight: 700, color: '#059669' }}>LISTO</span>
                              </button>
                            )}
                            {/* EDITAR — requiere editar */}
                            {can('editar_mecanica') && item.estado !== 'Finalizado' && (
                              <button title="Editar" onClick={() => openEdit(item)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '5px 6px', borderRadius: 7, border: '1px solid #E8E8ED', background: '#FFF', cursor: 'pointer', fontSize: 13 }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#F3F4F6'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#FFF'}>
                                <span>✏️</span><span style={{ fontSize: 8, fontWeight: 700, color: '#6B7280' }}>EDITAR</span>
                              </button>
                            )}
                            {/* BORRAR — requiere eliminar */}
                            {can('eliminar_mecanica') && item.estado !== 'Finalizado' && (
                              <button title="Eliminar" onClick={() => setDelTarget(item)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '5px 6px', borderRadius: 7, border: '1px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', fontSize: 13 }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#FFF5F5'}>
                                <span>🗑️</span><span style={{ fontSize: 8, fontWeight: 700, color: '#DC2626' }}>BORRAR</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── PAGINACIÓN ─────────────────────────────────────────────── */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', border: '1px solid #F0F0F5', borderRadius: 12, padding: '12px 18px', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B7280' }}>
                Mostrar
                <select style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #E8E8ED', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} value={rowsPerPage} onChange={(e) => setRpp(Number(e.target.value))}>
                  {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                por página
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {['«', '‹'].map((l, i) => (
                  <button key={l} onClick={() => paginator(i === 0 ? 1 : page - 1)} disabled={page === 1}
                    style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid #E8E8ED', background: '#FFF', color: page === 1 ? '#D1D5DB' : '#1A1A2E', cursor: page === 1 ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}>{l}</button>
                ))}
                {Array.from({ length: Math.min(5, totalPgs) }, (_, i) => {
                  const p = Math.max(1, page - 2) + i;
                  if (p > totalPgs) return null;
                  return (
                    <button key={p} onClick={() => paginator(p)}
                      style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: p === page ? '1.5px solid #1A1A2E' : '1px solid #E8E8ED', background: p === page ? '#1A1A2E' : '#FFF', color: p === page ? '#FFF' : '#6B7280' }}>{p}</button>
                  );
                })}
                {['›', '»'].map((l, i) => (
                  <button key={l} onClick={() => paginator(i === 0 ? page + 1 : totalPgs)} disabled={page === totalPgs}
                    style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid #E8E8ED', background: '#FFF', color: page === totalPgs ? '#D1D5DB' : '#1A1A2E', cursor: page === totalPgs ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}>{l}</button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{total} registros</div>
            </div>
          </main>

          {/* ══ MODAL CREAR / EDITAR ════════════════════════════════════════ */}
          {modalOpen && (
            <div style={{ ...S.overlay, animation: 'fadeIn 0.2s ease' }} onClick={() => setModalOpen(false)}>
              <div style={{ ...S.modal, animation: 'slideUp 0.25s ease' }} className="form-modal" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#1A1A2E' }}>
                  {editingId ? '✏️ Editar Mantenimiento' : '+ Nuevo Mantenimiento'}
                </h2>
                <div style={S.formGrid} className="form-grid-r">

                  {/* ── CÉDULA CON BÚSQUEDA DE CLIENTE ────────────────────── */}
                  <div style={{ ...S.fGroup, ...S.fFull }}>
                    <label style={S.fLabel}>
                      Documento cliente *
                      {clienteEstado === 'buscando' && (
                        <span style={{ marginLeft: 8, fontSize: 10, color: '#9CA3AF', fontWeight: 400, textTransform: 'none', animation: 'pulse 1s infinite' }}>
                          🔍 Buscando...
                        </span>
                      )}
                    </label>
                    <input
                      style={{
                        ...S.fInput,
                        borderColor: clienteEstado === 'encontrado' ? '#059669'
                          : clienteEstado === 'no_encontrado' ? '#F59E0B'
                          : '#E8E8ED',
                        borderWidth: clienteEstado !== 'idle' ? 2 : 1,
                      }}
                      placeholder="Ej: 1017234567"
                      value={form.cedula}
                      onChange={(e) => handleCedulaChange(e.target.value)}
                      maxLength={15}
                      inputMode="numeric"
                    />

                    {/* ── Tarjeta: cliente ENCONTRADO ── */}
                    {clienteEstado === 'encontrado' && clienteInfo && (
                      <div className="cliente-found" style={{ marginTop: 8, borderRadius: 10, border: '1.5px solid #A7F3D0', overflow: 'hidden' }}>
                        {/* Info principal del cliente */}
                        <div style={{
                          padding: '10px 14px', background: '#F0FDF4',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#FFF', flexShrink: 0 }}>
                              {clienteInfo.nombre?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>✅ {clienteInfo.nombre}</div>
                              <div style={{ fontSize: 11, color: '#059669', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {clienteInfo.telefono && <span>📞 {clienteInfo.telefono}</span>}
                                {clienteInfo.email    && <span>✉️ {clienteInfo.email}</span>}
                                {clienteInfo.ciudad   && <span>📍 {clienteInfo.ciudad}</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                            {clienteInfo.tipoDocumento} · {clienteInfo.regimenFiscal}
                          </div>
                        </div>

                        {/* ── Motos del cliente ── */}
                        {clienteInfo.motos && clienteInfo.motos.length > 0 ? (
                          <div style={{ padding: '10px 14px', background: '#F8FFFE', borderTop: '1px solid #A7F3D0' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                              🏍️ Motos registradas — selecciona para autocompletar
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                              {clienteInfo.motos.map((moto, idx) => {
                                const seleccionada = form.placa === moto.placa;
                                return (
                                  <button key={idx} type="button"
                                    onClick={() => {
                                      upField('placa',    moto.placa);
                                      upField('vehiculo', moto.vehiculo || '');
                                    }}
                                    style={{
                                      padding: '6px 12px', borderRadius: 8, border: seleccionada ? '2px solid #059669' : '1.5px solid #A7F3D0',
                                      background: seleccionada ? '#059669' : '#ECFDF5',
                                      color: seleccionada ? '#FFF' : '#065F46',
                                      cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                                      display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s',
                                    }}
                                    title={moto.vehiculo || moto.placa}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>{moto.placa}</span>
                                    {moto.vehiculo && (
                                      <span style={{ fontSize: 11, opacity: .85 }}>{moto.vehiculo}</span>
                                    )}
                                    {seleccionada && <span style={{ fontSize: 12 }}>✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '8px 14px', background: '#F8FFFE', borderTop: '1px solid #A7F3D0', fontSize: 11, color: '#059669', fontStyle: 'italic' }}>
                            🏍️ Este cliente no tiene motos registradas — ingresa la placa manualmente
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Aviso: cliente NO encontrado + formulario rápido ── */}
                    {clienteEstado === 'no_encontrado' && (
                      <div className="cliente-found" style={{ marginTop: 8, borderRadius: 12, border: '1.5px solid #FDE68A', overflow: 'hidden' }}>
                        {/* Header aviso */}
                        <div style={{ padding: '10px 14px', background: '#FFFBEB', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 16 }}>⚠️</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#92400E', fontSize: 13 }}>Cliente no registrado</div>
                            <div style={{ color: '#B45309', fontSize: 11, marginTop: 1 }}>Completa los datos para guardar el mantenimiento y/o crear el cliente.</div>
                          </div>
                        </div>
                        {/* Campos del cliente */}
                        <div style={{ padding: '14px', background: '#FFFDF0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div style={{ ...S.fGroup, gridColumn: '1 / -1' }}>
                            <label style={{ ...S.fLabel, color: '#B45309' }}>Nombre completo / Razón social *</label>
                            <input style={{ ...S.fInput, borderColor: '#FDE68A' }}
                              placeholder="Ej: Juan García" value={form.nombreCliente}
                              onChange={(e) => upField('nombreCliente', e.target.value)} />
                          </div>
                          <div style={S.fGroup}>
                            <label style={{ ...S.fLabel, color: '#B45309' }}>Tipo documento</label>
                            <select style={{ ...S.fSelect, borderColor: '#FDE68A' }}
                              value={form.tipoDocumentoCliente}
                              onChange={(e) => upField('tipoDocumentoCliente', e.target.value)}>
                              {['CC','NIT','CE','Pasaporte','RUT'].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div style={S.fGroup}>
                            <label style={{ ...S.fLabel, color: '#B45309' }}>Teléfono</label>
                            <input style={{ ...S.fInput, borderColor: '#FDE68A' }}
                              placeholder="300-123-4567" value={form.telefonoCliente}
                              onChange={(e) => upField('telefonoCliente', e.target.value.replace(/[^0-9+\s-]/g,''))} />
                          </div>
                          <div style={S.fGroup}>
                            <label style={{ ...S.fLabel, color: '#B45309' }}>Email</label>
                            <input style={{ ...S.fInput, borderColor: '#FDE68A' }}
                              placeholder="correo@ejemplo.com" value={form.emailCliente}
                              onChange={(e) => upField('emailCliente', e.target.value)} />
                          </div>
                          <div style={{ ...S.fGroup, gridColumn: '1 / -1' }}>
                            <label style={{ ...S.fLabel, color: '#B45309' }}>Ciudad</label>
                            <input style={{ ...S.fInput, borderColor: '#FDE68A' }}
                              placeholder="Medellín" value={form.ciudadCliente}
                              onChange={(e) => upField('ciudadCliente', e.target.value)} />
                          </div>
                          {/* Botón crear cliente */}
                          {form.nombreCliente.trim().length > 2 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <button
                                style={{ width: '100%', padding: '9px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#D97706,#B45309)', color: '#FFF', fontSize: 13, fontWeight: 700, cursor: creandoCliente ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: creandoCliente ? 0.7 : 1 }}
                                onClick={crearClienteRapido}
                                disabled={creandoCliente}>
                                {creandoCliente ? '⏳ Creando...' : '➕ Crear cliente y vincularlo'}
                              </button>
                              <div style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 4 }}>
                                O continúa sin crear — los datos se guardan igual con el mantenimiento
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Datos cliente encontrado — editables ── */}
                  {clienteEstado === 'encontrado' && (
                    <div style={{ ...S.fFull, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                      padding: '12px 14px', borderRadius: 10, background: '#F8FFF8', border: '1px solid #D1FAE5', marginTop: -8 }}>
                      <div style={{ gridColumn: '1 / -1', fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Datos del cliente para factura — editables
                      </div>
                      <div style={{ ...S.fGroup, gridColumn: '1 / -1' }}>
                        <label style={{ ...S.fLabel, color: '#059669' }}>Nombre</label>
                        <input style={{ ...S.fInput, borderColor: '#A7F3D0' }} value={form.nombreCliente}
                          onChange={(e) => upField('nombreCliente', e.target.value)} />
                      </div>
                      <div style={S.fGroup}>
                        <label style={{ ...S.fLabel, color: '#059669' }}>Teléfono</label>
                        <input style={{ ...S.fInput, borderColor: '#A7F3D0' }} value={form.telefonoCliente}
                          onChange={(e) => upField('telefonoCliente', e.target.value)} />
                      </div>
                      <div style={S.fGroup}>
                        <label style={{ ...S.fLabel, color: '#059669' }}>Email</label>
                        <input style={{ ...S.fInput, borderColor: '#A7F3D0' }} value={form.emailCliente}
                          onChange={(e) => upField('emailCliente', e.target.value)} />
                      </div>
                      <div style={S.fGroup}>
                        <label style={{ ...S.fLabel, color: '#059669' }}>Ciudad</label>
                        <input style={{ ...S.fInput, borderColor: '#A7F3D0' }} value={form.ciudadCliente}
                          onChange={(e) => upField('ciudadCliente', e.target.value)} />
                      </div>
                    </div>
                  )}

                  {/* Placa */}
                  <div style={S.fGroup}>
                    <label style={S.fLabel}>Placa *</label>
                    <input style={S.fInput} placeholder="ABC-123" value={form.placa}
                      onChange={(e) => upField('placa', e.target.value.toUpperCase())} maxLength={7} />
                  </div>
                  {/* Vehículo */}
                  <div style={S.fGroup}>
                    <label style={S.fLabel}>Vehículo *</label>
                    <input style={S.fInput} placeholder="Marca Modelo Año" value={form.vehiculo}
                      onChange={(e) => upField('vehiculo', e.target.value)} />
                  </div>
                  {/* Tipo */}
                  <div style={S.fGroup}>
                    <label style={S.fLabel}>Tipo</label>
                    <select style={S.fSelect} value={form.tipo} onChange={(e) => upField('tipo', e.target.value)}>
                      {TIPOS.map((t) => <option key={t} value={t}>{tipoIcon(t)} {t}</option>)}
                    </select>
                  </div>
                  {/* Estado */}
                  <div style={S.fGroup}>
                    <label style={S.fLabel}>Estado</label>
                    <select style={S.fSelect} value={form.estado} onChange={(e) => upField('estado', e.target.value)}>
                      {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  {/* Kilometraje */}
                  <div style={S.fGroup}>
                    <label style={S.fLabel}>Kilometraje</label>
                    <input style={S.fInput} type="number" placeholder="0" value={form.kilometraje}
                      onChange={(e) => upField('kilometraje', e.target.value)} />
                  </div>
                  {/* Fecha */}
                  <div style={S.fGroup}>
                    <label style={S.fLabel}>Fecha</label>
                    <input style={S.fInput} type="date" value={form.fecha}
                      onChange={(e) => upField('fecha', e.target.value)} />
                  </div>
                  {/* Taller */}
                  <div style={S.fGroup}>
                    <label style={S.fLabel}>Taller</label>
                    <input style={S.fInput} placeholder="Nombre del taller" value={form.taller}
                      onChange={(e) => upField('taller', e.target.value)} />
                  </div>

                  {/* ── SERVICIOS ────────────────────────────────────────── */}
                  <div style={{ ...S.fGroup, ...S.fFull }}>
                    <label style={S.fLabel}>
                      🔧 Servicios realizados
                      {catalogo.length === 0 && <span style={{ marginLeft: 8, fontSize: 10, color: '#9CA3AF', fontWeight: 400, textTransform: 'none' }}>(cargando catálogo...)</span>}
                    </label>
                    <div style={S.svcList}>
                      {opcionesServicios.length > 0 ? opcionesServicios.map((opc) => {
                        const sel = !!form.servicios.find((s) => s.nombre === opc.nombre);
                        return (
                          <div key={opc.id || opc.nombre} style={S.svcOpt(sel)} onClick={() => toggleServicio(opc)}>
                            <div style={S.chk(sel)}>{sel ? '✓' : ''}</div>
                            <span style={{ flex: 1 }}>{opc.nombre}</span>
                            <span style={{ fontSize: 11, color: sel ? '#4338CA' : '#9CA3AF', fontWeight: 600 }}>{fmt(opc.precio)}</span>
                          </div>
                        );
                      }) : (
                        <div style={{ padding: '12px', color: '#9CA3AF', fontSize: 12, textAlign: 'center' }}>
                          Sin servicios en el catálogo. Agrégalos desde el módulo de categorías.
                        </div>
                      )}
                    </div>
                    {form.servicios.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 6 }}>Ajustar precios</div>
                        {form.servicios.map((s) => (
                          <div key={s.nombre} style={S.svcCard}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A2E', flex: 1 }}>{s.nombre}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: '#9CA3AF' }}>COP</span>
                              <input type="number" min="0" value={s.precio}
                                style={{ width: 100, padding: '5px 8px', borderRadius: 7, border: '1px solid #E8E8ED', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", outline: 'none', textAlign: 'right', background: '#FAFAFC' }}
                                onChange={(e) => updServicioPrecio(s.nombre, e.target.value)}
                                onClick={(e) => e.stopPropagation()} />
                              <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 14 }}
                                onClick={() => upField('servicios', form.servicios.filter((x) => x.nombre !== s.nombre))}>✕</button>
                            </div>
                          </div>
                        ))}
                        <div style={S.totalBox}>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>💰 Total cobrado al cliente</span>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#FFF' }}>{fmt(costoCalculado)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── PRODUCTOS / REPUESTOS ────────────────────────────── */}
                  <div style={{ ...S.fGroup, ...S.fFull }}>
                    <label style={S.fLabel}>
                      📦 Productos / Repuestos
                      <span style={{ marginLeft: 6, fontSize: 10, color: '#9CA3AF', fontWeight: 400, textTransform: 'none' }}>
                        (costo real privado — no aparece en factura)
                      </span>
                    </label>
                    {form.productos.map((p, idx) => (
                      <div key={idx} style={{ border: '1px solid #E8E8ED', borderRadius: 10, padding: '10px 12px', marginBottom: 6, background: '#FAFAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: 13 }}>📦</span>
                          <input style={{ ...S.fInput, flex: 1, padding: '6px 9px', fontSize: 12 }}
                            placeholder="Nombre del producto / repuesto" value={p.nombre}
                            onChange={(e) => { const u = [...form.productos]; u[idx] = { ...u[idx], nombre: e.target.value }; upField('productos', u); }} />
                          <button style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 16 }}
                            onClick={() => upField('productos', form.productos.filter((_, i) => i !== idx))}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div style={S.fGroup}>
                            <label style={{ ...S.fLabel, color: '#2563EB' }}>Precio cliente (COP)</label>
                            <input style={{ ...S.fInput, fontSize: 12, padding: '6px 9px', borderColor: '#BFDBFE', background: '#EFF6FF' }}
                              type="number" min="0" placeholder="0" value={p.precioVenta}
                              onChange={(e) => { const u = [...form.productos]; u[idx] = { ...u[idx], precioVenta: Number(e.target.value) || 0 }; upField('productos', u); }} />
                          </div>
                          <div style={S.fGroup}>
                            <label style={{ ...S.fLabel, color: '#7C3AED' }}>🔒 Mi costo real (COP)</label>
                            <input style={{ ...S.fInput, fontSize: 12, padding: '6px 9px', borderColor: '#DDD6FE', background: '#F5F3FF' }}
                              type="number" min="0" placeholder="0" value={p.costo}
                              onChange={(e) => { const u = [...form.productos]; u[idx] = { ...u[idx], costo: Number(e.target.value) || 0 }; upField('productos', u); }} />
                          </div>
                        </div>
                        {(p.precioVenta > 0 || p.costo > 0) && (
                          <div style={{ marginTop: 6, padding: '5px 9px', borderRadius: 7, background: (p.precioVenta - p.costo) >= 0 ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${(p.precioVenta - p.costo) >= 0 ? '#D1FAE5' : '#FECACA'}`, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: (p.precioVenta - p.costo) >= 0 ? '#059669' : '#DC2626', textTransform: 'uppercase' }}>
                              {(p.precioVenta - p.costo) >= 0 ? '📈 Ganancia' : '📉 Pérdida'}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: (p.precioVenta - p.costo) >= 0 ? '#059669' : '#DC2626' }}>
                              {fmt(p.precioVenta - p.costo)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    <button style={{ width: '100%', padding: '9px', borderRadius: 9, border: '1.5px dashed #D1D5DB', background: '#FAFAFC', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1A1A2E'; e.currentTarget.style.color = '#1A1A2E'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#6B7280'; }}
                      onClick={() => upField('productos', [...form.productos, { nombre: '', precioVenta: 0, costo: 0 }])}>
                      + Agregar producto / repuesto
                    </button>
                  </div>

                  {/* ── PANEL PRIVADO DE GANANCIAS ───────────────────────── */}
                  {form.productos.length > 0 && (
                    <div style={{ ...S.fFull, gridColumn: '1 / -1' }}>
                      <div style={S.privBox}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                          🔒 Resumen privado — Solo tú ves esto
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                          {[
                            { label: 'Cobrado al cliente',    value: fmt(costoCalculado), color: '#FFF' },
                            { label: 'Mi costo total',        value: fmt(form.productos.reduce((s, p) => s + (Number(p.costo)||0), 0)), color: '#FDA4AF' },
                            { label: '📈 Ganancia productos', value: fmt(gananciasCalculadas), color: gananciasCalculadas >= 0 ? '#6EE7B7' : '#FDA4AF' },
                          ].map((k) => (
                            <div key={k.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 9, padding: '9px 12px' }}>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>{k.label}</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: k.color }}>{k.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── DESCRIPCIÓN ──────────────────────────────────────── */}
                  <div style={{ ...S.fGroup, ...S.fFull }}>
                    <label style={S.fLabel}>Descripción *</label>
                    <textarea style={{ ...S.fInput, minHeight: 72, resize: 'vertical', fontFamily: "'DM Sans',sans-serif" }}
                      placeholder="Detalle del mantenimiento..." value={form.descripcion}
                      onChange={(e) => upField('descripcion', e.target.value)} />
                  </div>

                  {/* ── ACCIONES ─────────────────────────────────────────── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 20, gridColumn: '1 / -1', flexWrap: 'wrap' }}>
                    <button style={S.btnCancel} onClick={() => setModalOpen(false)}>Cancelar</button>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {/* Botón Finalizar — solo en edición, si no está finalizado y tiene permiso */}
                      {editingId && can('editar_mecanica') && form.estado !== 'Finalizado' && (
                        <button
                          style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#059669,#047857)', color: '#FFF', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}
                          disabled={saving}
                          onClick={async () => {
                            // Guardar primero los cambios, luego finalizar
                            if (!form.cedula || !form.placa || !form.vehiculo || !form.descripcion) return;
                            try {
                              setSaving(true);
                              // 1. Guardar cambios actuales
                              const bodyEdit = {
                                ...form,
                                kilometraje: Number(form.kilometraje) || 0,
                                productos: (form.productos || []).filter(p => p.nombre && p.nombre.trim()),
                                servicios: (form.servicios || []).filter(s => s.nombre && s.nombre.trim()),
                              };
                              const rEdit = await fetch(`${API_URL}/mecanica/${editingId}`, {
                                method: 'PUT', headers: authHeaders(), body: JSON.stringify(bodyEdit),
                              });
                              const jEdit = await rEdit.json();
                              if (!rEdit.ok) throw new Error(jEdit.msg || 'Error al guardar');
                              // 2. Finalizar → crea Movimiento en el back
                              const rFin = await fetch(`${API_URL}/mecanica/${editingId}/finalizar`, {
                                method: 'PATCH', headers: authHeaders(),
                              });
                              const jFin = await rFin.json();
                              if (!rFin.ok) throw new Error(jFin.msg || 'Error al finalizar');
                              setModalOpen(false);
                              setForm(EMPTY_FORM);
                              setEditingId(null);
                              fetchData();
                            } catch (e) {
                              setError(e.message);
                            } finally {
                              setSaving(false);
                            }
                          }}>
                          {saving ? '⏳ Procesando...' : '✓ Guardar y Finalizar'}
                        </button>
                      )}
                      <button
                        style={{ ...S.btnPrimary, opacity: (!form.cedula || !form.placa || !form.vehiculo || !form.descripcion || saving) ? 0.5 : 1 }}
                        onClick={handleSave}
                        disabled={!form.cedula || !form.placa || !form.vehiculo || !form.descripcion || saving}>
                        {saving ? '⏳ Guardando...' : (editingId ? 'Guardar cambios' : 'Crear registro')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ CONFIRM ELIMINAR ════════════════════════════════════════════ */}
          {deleteTarget && (
            <div style={{ ...S.overlay, animation: 'fadeIn 0.2s ease' }} onClick={() => setDelTarget(null)}>
              <div style={{ ...S.deleteModal, animation: 'slideUp 0.25s ease' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#1A1A2E' }}>¿Eliminar registro?</h3>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                  <strong>{deleteTarget.vehiculo}</strong> — {deleteTarget.placa}
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 24 }}>Esta acción no se puede deshacer.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button style={S.btnCancel} onClick={() => setDelTarget(null)}>Cancelar</button>
                  <button style={S.btnDanger} onClick={handleDelete}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}