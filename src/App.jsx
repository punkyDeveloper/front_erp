import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const MAX_ATTEMPTS   = 5;
const LOCKOUT_SECS   = 120;
const API            = process.env.REACT_APP_API_URL;
const API_KEY        = 'mi_clave_secreta_12345';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const post = (path, body) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(body),
  });

function useCountdown(initial = 0) {
  const [secs, setSecs] = useState(initial);
  const ref = useRef(null);
  const start = useCallback((s) => {
    setSecs(s);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      setSecs(v => { if (v <= 1) { clearInterval(ref.current); return 0; } return v - 1; });
    }, 1000);
  }, []);
  useEffect(() => () => clearInterval(ref.current), []);
  return [secs, start];
}

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return `${m}:${r}`;
}

/* ─────────────────────────────────────────
   MATH CAPTCHA (after 2 failed attempts)
───────────────────────────────────────── */
function makeCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b, label: `¿Cuánto es ${a} + ${b}?` };
}

/* ─────────────────────────────────────────
   LEFT PANEL — Module grid
───────────────────────────────────────── */
const MODULES = [
  { icon: '🛒', name: 'Punto de Venta',  tag: 'POS',        val: '$12.4K', up: true  },
  { icon: '🔧', name: 'Taller',          tag: 'MECÁNICA',   val: '23 órdenes', up: true  },
  { icon: '⚙️', name: 'Servicios',       tag: 'SERVICES',   val: '47 activos', up: null  },
  { icon: '📊', name: 'Dashboard',       tag: 'ANALYTICS',  val: '98% uptime', up: true  },
  { icon: '👥', name: 'Clientes',        tag: 'CRM',        val: '1,284 reg.', up: true  },
  { icon: '📈', name: 'Ingresos',        tag: 'INCOME',     val: '$84.2K/mes', up: true  },
  { icon: '📉', name: 'Egresos',         tag: 'EXPENSES',   val: '$31.1K/mes', up: false },
  { icon: '📦', name: 'Inventario',      tag: 'STOCK',      val: '4,831 items',up: null  },
];

function LeftPanel() {
  const [active, setActive] = useState(null);
  const [bar, setBar]       = useState(0);

  useEffect(() => {
    const id = setInterval(() => setBar(b => (b + 1) % 101), 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'40px 36px' }}>

      {/* Brand */}
      <div style={{ marginBottom:'44px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'6px' }}>
          <div style={{
            width:'40px', height:'40px', borderRadius:'10px',
            background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'18px', boxShadow:'0 4px 16px rgba(59,130,246,0.35)',
          }}>⬡</div>
          <div>
            <div style={{ fontSize:'20px', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.5px', fontFamily:"'Bricolage Grotesque',sans-serif" }}>
              Codetiqa<span style={{ color:'#3b82f6' }}>ERP</span>
            </div>
            <div style={{ fontSize:'10px', color:'#64748b', letterSpacing:'2px', textTransform:'uppercase' }}>Enterprise v2.0</div>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div style={{ marginBottom:'28px' }}>
        <h2 style={{ fontSize:'26px', fontWeight:800, color:'#f1f5f9', fontFamily:"'Bricolage Grotesque',sans-serif", lineHeight:1.2, marginBottom:'8px', letterSpacing:'-0.5px' }}>
          Gestión empresarial<br/>
          <span style={{ color:'#3b82f6' }}>integrada y segura.</span>
        </h2>
        <p style={{ color:'#475569', fontSize:'13.5px', lineHeight:1.6 }}>
          Administra tu empresa desde un solo sistema con control total sobre cada área.
        </p>
      </div>

      {/* Modules grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', flex:1 }}>
        {MODULES.map((m, i) => (
          <div
            key={i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            style={{
              background: active===i ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${active===i ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:'10px', padding:'12px 14px',
              cursor:'default', transition:'all 0.2s',
              transform: active===i ? 'translateY(-1px)' : 'none',
            }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
              <span style={{ fontSize:'16px' }}>{m.icon}</span>
              {m.up !== null && (
                <span style={{
                  fontSize:'9px', fontWeight:600, letterSpacing:'0.5px', padding:'2px 5px', borderRadius:'4px',
                  background: m.up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: m.up ? '#4ade80' : '#f87171',
                }}>
                  {m.up ? '▲' : '▼'}
                </span>
              )}
            </div>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#94a3b8', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:'3px' }}>{m.tag}</div>
            <div style={{ fontSize:'12px', color:'#cbd5e1', fontWeight:500 }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Live bar */}
      <div style={{ marginTop:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
          <span style={{ fontSize:'10px', color:'#475569', letterSpacing:'1px', textTransform:'uppercase' }}>Actividad del sistema</span>
          <span style={{ fontSize:'10px', color:'#3b82f6', fontWeight:600 }}>{bar}%</span>
        </div>
        <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${bar}%`, background:'linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)', borderRadius:'2px', transition:'width 0.06s linear' }}/>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px #4ade80' }}/>
          <span style={{ fontSize:'10px', color:'#475569', letterSpacing:'1px' }}>TODOS LOS SISTEMAS OPERATIVOS</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SECURITY BADGE
───────────────────────────────────────── */
function SecurityBadge() {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:'8px',
      background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)',
      borderRadius:'8px', padding:'8px 12px', marginBottom:'28px',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span style={{ fontSize:'11px', color:'#4ade80', fontWeight:500, letterSpacing:'0.3px' }}>
        Conexión cifrada TLS 1.3 · Sesión protegida
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────── */
function PasswordStrength({ value }) {
  if (!value) return null;
  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length;
  const levels = [
    { label:'Muy débil',  color:'#ef4444' },
    { label:'Débil',      color:'#f97316' },
    { label:'Regular',    color:'#eab308' },
    { label:'Fuerte',     color:'#22c55e' },
    { label:'Muy fuerte', color:'#16a34a' },
  ];
  const lv = levels[score] || levels[0];

  return (
    <div style={{ marginTop:'8px' }}>
      <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex:1, height:'3px', borderRadius:'2px',
            background: i < score ? lv.color : 'rgba(255,255,255,0.08)',
            transition:'background 0.25s',
          }}/>
        ))}
      </div>
      <span style={{ fontSize:'10px', color: lv.color, fontWeight:500 }}>{lv.label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   INPUT COMPONENT
───────────────────────────────────────── */
function Field({ label, note, right, children }) {
  return (
    <div style={{ marginBottom:'18px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'7px' }}>
        <label style={{ fontSize:'12px', fontWeight:600, color:'#64748b', letterSpacing:'0.3px' }}>{label}</label>
        {note && <span style={{ fontSize:'11px', color:'#3b82f6', cursor:'pointer' }}>{note}</span>}
        {right}
      </div>
      {children}
    </div>
  );
}

function Input({ icon, right, error, ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{
      display:'flex', alignItems:'center',
      background: foc ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)',
      border:`1.5px solid ${error ? '#ef4444' : foc ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
      borderRadius:'10px', overflow:'hidden',
      transition:'all 0.2s',
      boxShadow: foc ? '0 0 0 3px rgba(59,130,246,0.1)' : error ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
    }}>
      {icon && (
        <div style={{ padding:'0 14px', color: foc ? '#3b82f6' : '#475569', display:'flex', transition:'color 0.2s', flexShrink:0 }}>
          {icon}
        </div>
      )}
      <input
        {...props}
        onFocus={e => { setFoc(true); props.onFocus?.(e); }}
        onBlur={e => { setFoc(false); props.onBlur?.(e); }}
        style={{
          flex:1, background:'transparent', border:'none', outline:'none',
          color:'#f1f5f9', fontSize:'14px', padding:'13px 0',
          fontFamily:'inherit',
        }}
      />
      {right && <div style={{ padding:'0 12px', flexShrink:0 }}>{right}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   EYE BUTTON
───────────────────────────────────────── */
function EyeBtn({ show, toggle }) {
  return (
    <button type="button" onClick={toggle}
      style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex', alignItems:'center', padding:0 }}>
      {show
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );
}

/* ─────────────────────────────────────────
   VIEWS
───────────────────────────────────────── */

/* ── LOGIN FORM ── */
function LoginView({ onForgot, onSuccess }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [attempts, setAttempts]   = useState(0);
  const [captcha, setCaptcha]     = useState(null);
  const [captchaVal, setCaptchaVal] = useState('');
  const [locked, setLocked]       = useState(false);
  const [lockSecs, startLock]     = useCountdown(0);

  // Restore remember
  useEffect(() => {
    const saved = localStorage.getItem('codetiqa_remember');
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Por favor completa todos los campos.'); return; }

    // Captcha check
    if (captcha) {
      if (parseInt(captchaVal) !== captcha.answer) {
        setError('Verificación incorrecta. Intenta de nuevo.');
        setCaptcha(makeCaptcha()); setCaptchaVal('');
        return;
      }
    }

    setLoading(true);
    try {
      const res  = await post('/login', { email, password });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const next = attempts + 1;
        setAttempts(next);

        if (next >= MAX_ATTEMPTS) {
          setLocked(true);
          startLock(LOCKOUT_SECS);
          setError(`Demasiados intentos fallidos. Cuenta bloqueada temporalmente.`);
        } else {
          if (next >= 2) setCaptcha(makeCaptcha());
          const rem = MAX_ATTEMPTS - next;
          setError(`${data.message || 'Credenciales incorrectas.'} ${rem > 0 ? `(${rem} intentos restantes)` : ''}`);
        }
        setLoading(false);
        return;
      }

      const user = data.data;
      if (remember) localStorage.setItem('codetiqa_remember', email);
      else localStorage.removeItem('codetiqa_remember');

      localStorage.clear();
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      document.cookie = `company=${user.nombreCompany}; path=/; max-age=36000; SameSite=Lax`;
      window.dispatchEvent(new Event('login'));
      onSuccess();
    } catch {
      setError('Error de conexión. Verifica tu red e intenta de nuevo.');
      setLoading(false);
    }
  };

  // Lockout active
  const isLocked = locked && lockSecs > 0;
  useEffect(() => {
    if (locked && lockSecs === 0) { setLocked(false); setAttempts(0); setCaptcha(null); setError(''); }
  }, [lockSecs, locked]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SecurityBadge/>

      {/* Attempt bar */}
      {attempts > 0 && !isLocked && (
        <div style={{ marginBottom:'16px', display:'flex', alignItems:'center', gap:'6px' }}>
          {[...Array(MAX_ATTEMPTS)].map((_, i) => (
            <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i < attempts ? '#ef4444' : 'rgba(255,255,255,0.07)', transition:'background 0.3s' }}/>
          ))}
          <span style={{ fontSize:'10px', color:'#ef4444', whiteSpace:'nowrap', marginLeft:'4px' }}>
            {MAX_ATTEMPTS - attempts} intentos
          </span>
        </div>
      )}

      {/* Lockout state */}
      {isLocked && (
        <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'14px 16px', marginBottom:'20px', textAlign:'center' }}>
          <div style={{ fontSize:'22px', marginBottom:'6px' }}>🔒</div>
          <div style={{ color:'#f87171', fontWeight:600, fontSize:'13px', marginBottom:'4px' }}>Acceso bloqueado temporalmente</div>
          <div style={{ color:'#ef4444', fontSize:'28px', fontWeight:700, fontFamily:'monospace', letterSpacing:'2px' }}>{fmt(lockSecs)}</div>
          <div style={{ color:'#64748b', fontSize:'11px', marginTop:'4px' }}>Tiempo restante para desbloqueo</div>
        </div>
      )}

      <Field label="Correo electrónico">
        <Input
          type="email" placeholder="usuario@empresa.com"
          value={email} onChange={e => setEmail(e.target.value)}
          disabled={loading || isLocked} autoComplete="email"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
        />
      </Field>

      <Field
        label="Contraseña"
        right={
          <button type="button" onClick={onForgot}
            style={{ background:'none', border:'none', fontSize:'11px', color:'#3b82f6', cursor:'pointer', padding:0, fontFamily:'inherit' }}>
            ¿Olvidaste tu contraseña?
          </button>
        }
      >
        <Input
          type={showPass ? 'text' : 'password'} placeholder="••••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          disabled={loading || isLocked} autoComplete="current-password"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
          right={<EyeBtn show={showPass} toggle={() => setShowPass(p => !p)}/>}
        />
      </Field>

      {/* Captcha */}
      {captcha && !isLocked && (
        <div style={{ marginBottom:'18px' }}>
          <div style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:'10px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize:'12px', color:'#fbbf24', flex:1 }}>Verificación de seguridad</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'10px' }}>
            <span style={{ fontSize:'14px', color:'#cbd5e1', fontWeight:600, flex:1 }}>{captcha.label}</span>
            <input
              type="number" value={captchaVal} onChange={e => setCaptchaVal(e.target.value)}
              placeholder="Respuesta"
              style={{ width:'90px', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f1f5f9', padding:'8px 12px', fontSize:'14px', outline:'none', fontFamily:'inherit' }}
            />
          </div>
        </div>
      )}

      {/* Remember device */}
      <label style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'22px', cursor:'pointer' }}>
        <div
          onClick={() => setRemember(r => !r)}
          style={{
            width:'18px', height:'18px', borderRadius:'5px', flexShrink:0,
            background: remember ? '#3b82f6' : 'transparent',
            border:`1.5px solid ${remember ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s', cursor:'pointer',
          }}
        >
          {remember && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span style={{ fontSize:'13px', color:'#64748b', userSelect:'none' }}>Recordar este dispositivo por 30 días</span>
      </label>

      {/* Error */}
      {error && !isLocked && (
        <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:'10px', padding:'11px 14px', marginBottom:'18px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" style={{ flexShrink:0, marginTop:'1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize:'13px', color:'#f87171', lineHeight:1.5 }}>{error}</span>
        </div>
      )}

      <Btn loading={loading} disabled={isLocked}>
        {loading ? 'Verificando...' : 'Iniciar sesión'}
      </Btn>

      {/* Security info */}
      <div style={{ marginTop:'20px', display:'flex', justifyContent:'center', gap:'20px' }}>
        {[
          { icon:'🔐', label:'AES-256' },
          { icon:'🛡️', label:'HTTPS/TLS' },
          { icon:'⏱️', label:'Sesión segura' },
        ].map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <span style={{ fontSize:'11px' }}>{s.icon}</span>
            <span style={{ fontSize:'10px', color:'#334155', letterSpacing:'0.3px' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </form>
  );
}

/* ── FORGOT PASSWORD FORM ── */
function ForgotView({ onBack }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);
  const [resendSecs, startResend] = useCountdown(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Ingresa tu correo electrónico.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Correo electrónico inválido.'); return; }

    setLoading(true);
    try {
      const res = await post('/forgot-password', { email });
      // Aceptamos 200 o 404 (no revelar si existe el usuario)
      setSent(true);
      startResend(60);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSecs > 0) return;
    setLoading(true);
    try {
      await post('/forgot-password', { email });
      startResend(60);
    } catch {
      setError('No se pudo reenviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ textAlign:'center', padding:'8px 0 32px' }}>
        <div style={{
          width:'64px', height:'64px', borderRadius:'50%',
          background:'rgba(59,130,246,0.1)', border:'1.5px solid rgba(59,130,246,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 20px', fontSize:'26px',
        }}>📧</div>
        <h3 style={{ color:'#f1f5f9', fontSize:'18px', fontWeight:700, marginBottom:'10px', fontFamily:"'Bricolage Grotesque',sans-serif" }}>
          Revisa tu correo
        </h3>
        <p style={{ color:'#64748b', fontSize:'13.5px', lineHeight:1.6, marginBottom:'8px' }}>
          Si <strong style={{ color:'#94a3b8' }}>{email}</strong> está registrado,<br/>
          recibirás un enlace para restablecer tu contraseña.
        </p>
        <p style={{ color:'#475569', fontSize:'12px', marginBottom:'28px' }}>
          El enlace expira en 30 minutos por seguridad.
        </p>

        <div style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
          <button
            type="button" onClick={handleResend} disabled={resendSecs > 0 || loading}
            style={{
              width:'100%', padding:'12px', borderRadius:'10px',
              background: resendSecs > 0 ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.1)',
              border: `1.5px solid ${resendSecs > 0 ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.25)'}`,
              color: resendSecs > 0 ? '#334155' : '#60a5fa',
              fontSize:'13px', fontWeight:600, cursor: resendSecs > 0 ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', transition:'all 0.2s',
            }}
          >
            {resendSecs > 0 ? `Reenviar en ${resendSecs}s` : 'Reenviar correo'}
          </button>
          <button type="button" onClick={onBack}
            style={{ width:'100%', padding:'12px', borderRadius:'10px', background:'transparent', border:'1.5px solid rgba(255,255,255,0.07)', color:'#64748b', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}>
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
      {error && <p style={{ color:'#f87171', fontSize:'12px', textAlign:'center', marginTop:'8px' }}>{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ marginBottom:'28px' }}>
        <button type="button" onClick={onBack}
          style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'#475569', cursor:'pointer', padding:0, fontSize:'13px', fontFamily:'inherit', marginBottom:'20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver
        </button>
        <h3 style={{ color:'#f1f5f9', fontSize:'20px', fontWeight:700, fontFamily:"'Bricolage Grotesque',sans-serif", marginBottom:'6px' }}>Recuperar contraseña</h3>
        <p style={{ color:'#64748b', fontSize:'13px', lineHeight:1.5 }}>
          Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu acceso.
        </p>
      </div>

      <Field label="Correo electrónico registrado">
        <Input
          type="email" placeholder="usuario@empresa.com"
          value={email} onChange={e => setEmail(e.target.value)}
          disabled={loading} autoComplete="email"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
        />
      </Field>

      <div style={{ background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:'10px', padding:'11px 14px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" style={{ flexShrink:0, marginTop:'1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style={{ fontSize:'12px', color:'#60a5fa', lineHeight:1.5 }}>
          Por seguridad, no revelamos si un correo existe o no en el sistema.
        </span>
      </div>

      {error && (
        <div style={{ color:'#f87171', fontSize:'12px', marginBottom:'16px', padding:'10px 14px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'8px' }}>
          {error}
        </div>
      )}

      <Btn loading={loading}>
        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </Btn>
    </form>
  );
}

/* ── SUCCESS STATE ── */
function SuccessView() {
  return (
    <div style={{ textAlign:'center', padding:'20px 0', animation:'fadeUp 0.4s ease both' }}>
      <div style={{
        width:'72px', height:'72px', borderRadius:'50%',
        background:'rgba(34,197,94,0.1)', border:'1.5px solid rgba(34,197,94,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 20px', fontSize:'30px',
        boxShadow:'0 0 30px rgba(34,197,94,0.15)',
      }}>✓</div>
      <div style={{ color:'#4ade80', fontSize:'16px', fontWeight:700, marginBottom:'6px', fontFamily:"'Bricolage Grotesque',sans-serif" }}>
        Acceso concedido
      </div>
      <div style={{ color:'#475569', fontSize:'13px', marginBottom:'24px' }}>Cargando tu espacio de trabajo...</div>
      <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden', maxWidth:'200px', margin:'0 auto' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#1d4ed8,#3b82f6,#4ade80)', width:'100%', animation:'loadBar 1.2s ease forwards' }}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SHARED BUTTON
───────────────────────────────────────── */
function Btn({ loading, disabled, children }) {
  return (
    <button
      type="submit" disabled={loading || disabled}
      style={{
        width:'100%', padding:'14px',
        background: disabled ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
        borderRadius:'10px',
        color: disabled ? '#334155' : '#fff',
        fontSize:'14.5px', fontWeight:700, fontFamily:'inherit',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(37,99,235,0.3)',
        transition:'all 0.2s', letterSpacing:'0.2px',
      }}
      className="primary-btn"
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite', flexShrink:0 }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      )}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function Login() {
  const [view, setView]       = useState('login'); // login | forgot | success
  const [mounted, setMounted] = useState(false);
  const navigate              = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleSuccess = async () => {
    setView('success');
    await new Promise(r => setTimeout(r, 1400));
    navigate('/bienvenida', { replace: true });
  };

  const titles = {
    login:   { h: 'Bienvenido de nuevo', sub: 'Ingresa tus credenciales para acceder al sistema' },
    forgot:  { h: null, sub: null },
    success: { h: null, sub: null },
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{overflow:hidden;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.6}}
        .primary-btn:not(:disabled):hover{filter:brightness(1.12);transform:translateY(-1px);box-shadow:0 8px 28px rgba(37,99,235,0.45)!important;}
        .primary-btn:not(:disabled):active{transform:translateY(0);}
        .primary-btn{transition:filter .2s,transform .15s,box-shadow .2s!important;}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{
          -webkit-text-fill-color:#f1f5f9!important;
          -webkit-box-shadow:0 0 0px 1000px #0f172a inset!important;
        }
        @media(max-width:860px){.left-panel-wrap{display:none!important;}}
      `}</style>

      <div style={{
        minHeight:'100vh', display:'flex', overflow:'hidden',
        background:'#080f1c', fontFamily:"'DM Sans',sans-serif",
      }}>

        {/* Ambient background */}
        <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
          background:'radial-gradient(ellipse at 20% 50%, rgba(30,64,175,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.07) 0%, transparent 50%), #080f1c' }}/>

        {/* Subtle dot grid */}
        <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:0.35,
          backgroundImage:'radial-gradient(rgba(59,130,246,0.15) 1px, transparent 1px)',
          backgroundSize:'32px 32px' }}/>

        {/* ── LEFT PANEL ── */}
        <div className="left-panel-wrap" style={{
          flex:'0 0 50%', position:'relative', zIndex:1,
          borderRight:'1px solid rgba(255,255,255,0.05)',
          background:'rgba(255,255,255,0.012)',
          backdropFilter:'blur(2px)',
        }}>
          <LeftPanel/>
        </div>

        {/* ── RIGHT: AUTH PANEL ── */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'40px 24px', position:'relative', zIndex:2,
        }}>
          <div style={{
            width:'100%', maxWidth:'400px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(20px)',
            transition:'opacity 0.5s ease, transform 0.5s ease',
          }}>

            {/* Mobile brand */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'36px' }}>
              <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:'0 4px 14px rgba(59,130,246,0.3)' }}>⬡</div>
              <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9', fontFamily:"'Bricolage Grotesque',sans-serif", letterSpacing:'-0.3px' }}>
                Codetiqa<span style={{ color:'#3b82f6' }}>ERP</span>
              </span>
            </div>

            {/* View heading */}
            {view === 'login' && (
              <div style={{ marginBottom:'28px', animation:'fadeUp 0.4s ease both' }}>
                <h2 style={{ fontSize:'24px', fontWeight:800, color:'#f1f5f9', fontFamily:"'Bricolage Grotesque',sans-serif", letterSpacing:'-0.5px', marginBottom:'6px' }}>
                  Bienvenido de nuevo
                </h2>
                <p style={{ color:'#475569', fontSize:'13.5px' }}>Ingresa tus credenciales para acceder al sistema</p>
              </div>
            )}

            {/* Views */}
            {view === 'login'   && <LoginView  onForgot={() => setView('forgot')} onSuccess={handleSuccess}/>}
            {view === 'forgot'  && <ForgotView onBack={() => setView('login')}/>}
            {view === 'success' && <SuccessView/>}

            {/* Footer */}
            <div style={{ marginTop:'28px', paddingTop:'20px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'10px', color:'#1e3a5c', letterSpacing:'0.5px' }}>CodetiqaERP © {new Date().getFullYear()}</span>
              <div style={{ display:'flex', gap:'14px' }}>
                {['Soporte', 'Privacidad', 'Términos'].map(l => (
                  <a key={l} href="#" style={{ fontSize:'11px', color:'#1e3a5c', textDecoration:'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}