import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, getCurrentUser, logout } from '../services/auth';

export default function CreateUser() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    is_superuser: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const data = await getCurrentUser();
      setUser(data);
      
      // Verificar que sea superuser
      if (data && !data.is_superuser) {
        navigate('/');
      }
    }
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await createUser(formData);
      setSuccess(`User ${formData.email} created successfully!`);
      // Reset form
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        is_superuser: false,
        is_active: true,
      });
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToList = () => {
    navigate('/admin/users');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header/Navbar */}
      <nav className="bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div>
          <span className="font-bold text-2xl mr-2">M-Electric</span>
          <span className="uppercase tracking-wide text-blue-400 font-semibold text-base">
            Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded text-white font-semibold transition"
          >
            ← Back to Users
          </button>
          {user && (
            <div
              className="flex items-center px-3 py-1 border border-blue-100 rounded-full bg-blue-50 text-blue-900 shadow-sm transition select-none"
              title={user.email}
            >
              <span className="text-blue-400 mr-2 text-sm">👤</span>
              {user.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl px-10 py-8">
          {/* Título */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Create New User
            </h2>
            <p className="text-gray-500 text-base">
              Add a new employee or administrator to the system.
            </p>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <strong>Success:</strong> {success}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                placeholder="employee@melectric.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                placeholder="Temporary password"
              />
              <p className="mt-1 text-xs text-gray-500">
                The user can change this password after first login.
              </p>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                placeholder="Doe"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active (user can log in)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_superuser"
                  name="is_superuser"
                  checked={formData.is_superuser}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_superuser" className="ml-2 block text-sm text-gray-700">
                  Administrator (can access admin panel)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-xs text-gray-400 text-center mt-8">
          © {new Date().getFullYear()} M-Electric. All rights reserved.
        </div>
      </div>
    </div>
  );
}

