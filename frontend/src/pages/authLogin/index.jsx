import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Login() {
  const [formData, setFormData] = useState({ correo: '', contrasenausuario: '' });
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      correo: formData.correo,
      contrasenausuario: formData.contrasenausuario
  })
})

      const data = await res.json();
      if (!res.ok) return setMsg(data.message || 'Credenciales inválidas');

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.usuario));
      localStorage.setItem('auth_roles', JSON.stringify(data.roles || []));
      nav('/publicaciones', { replace: true });
    } catch (err) {
      console.error(err);
      setMsg('Error de red');
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-bold text-center">Iniciar sesión</h2>
        {msg && <p className="text-center text-red-600">{msg}</p>}

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="correo">Correo</label>
          <input
            id="correo" name="correo" type="email" required
            value={formData.correo} onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="demo@demo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="contrasenausuario">Contraseña</label>
          <input
            id="contrasenausuario" name="contrasenausuario" type="password" required
            value={formData.contrasenausuario} onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="123456"
          />
        </div>

        <button className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
          Entrar
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Aún no tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-700 hover:underline">Registrate</Link>
        </p>
      </form>
    </div>
  );
}
