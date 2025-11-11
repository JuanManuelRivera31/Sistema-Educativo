import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || 'Credenciales inválidas');
      login(data.user, data.token);
      nav('/publicaciones', { replace: true });
    } catch (err) {
      console.error(err);
      setMsg('Error de red');
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={onSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-bold text-center">Iniciar sesión</h2>
        {msg && <p className="text-center text-red-600">{msg}</p>}
        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input className="w-full border rounded px-3 py-2" type="email"
                 value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input className="w-full border rounded px-3 py-2" type="password"
                 value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}
