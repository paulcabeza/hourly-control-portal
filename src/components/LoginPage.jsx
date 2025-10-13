import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Simula login (en producción deberías hacer fetch a tu backend)
  function handleSubmit(e) {
    e.preventDefault();
    // Simulación: acepta cualquier usuario/contraseña y retorna un "token"
    if (email && password) {
      const fakeToken = 'jwt_token_' + Date.now();
      setToken(fakeToken);
      navigate('/my-marks');
    } else {
      setError('Please enter a valid email and password.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-xs">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
        <input type="email" placeholder="Correo"
          className="block mb-3 w-full rounded border p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input type="password" placeholder="Contraseña"
          className="block mb-3 w-full rounded border p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded">Ingresar</button>
      </form>
    </div>
  );
}
