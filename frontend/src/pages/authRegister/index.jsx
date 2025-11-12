import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Register() {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contrasenausuario: '',
    confirmar: ''
  });
  const [msg, setMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  const nav = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const validar = () => {
    const correo = String(form.correo || '').trim();
    const nombre = String(form.nombre || '').trim();
    const pass = String(form.contrasenausuario || '');
    const confirmar = String(form.confirmar || '');

    if (!nombre || !correo || !pass || !confirmar) return 'Todos los campos son obligatorios';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Correo inválido';
    if (pass.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (pass !== confirmar) return 'Las contraseñas no coinciden';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    const err = validar();
    if (err) return setMsg(err);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          nombre: String(form.nombre).trim(),
          correo: String(form.correo).trim().toLowerCase(),
          contrasenausuario: form.contrasenausuario
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return setMsg(data.message || 'No fue posible registrar el usuario');
      }

      // Guardar sesión (igual que en login)
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.usuario));
      localStorage.setItem('auth_roles', JSON.stringify(data.roles || []));

      nav('/publicaciones', { replace: true });
    } catch (error) {
      console.error(error);
      setMsg('Error de red');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow space-y-4">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>

        {msg && <p className="text-center text-red-600">{msg}</p>}

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre" name="nombre" type="text"
            value={form.nombre} onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej. Juan Pérez"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="correo">Correo</label>
          <input
            id="correo" name="correo" type="email"
            value={form.correo} onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="tucorreo@dominio.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="contrasenausuario">Contraseña</label>
          <div className="relative">
            <input
              id="contrasenausuario" name="contrasenausuario"
              type={showPass ? 'text' : 'password'}
              value={form.contrasenausuario} onChange={onChange}
              className="w-full border rounded px-3 py-2 pr-10"
              placeholder="Mínimo 6 caracteres"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-700"
            >
              {showPass ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmar">Confirmar contraseña</label>
          <input
            id="confirmar" name="confirmar" type={showPass ? 'text' : 'password'}
            value={form.confirmar} onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Repite tu contraseña"
            required
          />
        </div>

        <button className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
          Crear cuenta
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-blue-700 hover:underline">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
