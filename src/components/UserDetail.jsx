import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, updateUser, getCurrentUser, logout } from '../services/auth';

export default function UserDetail() {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    is_superuser: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        if (user && !user.is_superuser) {
          navigate('/');
          return;
        }

        const userData = await getUserById(userId);
        setFormData({
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          is_superuser: userData.is_superuser || false,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
        });
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, navigate]);

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
    setSaving(true);

    try {
      // Solo enviar campos que pueden ser actualizados
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      await updateUser(userId, updateData);
      setSuccess('User updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToList = () => {
    navigate('/admin/users');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-xl text-gray-600">Loading...</div>
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
          {currentUser && (
            <div
              className="flex items-center px-3 py-1 border border-blue-100 rounded-full bg-blue-50 text-blue-900 shadow-sm transition select-none"
              title={currentUser.email}
            >
              <span className="text-blue-400 mr-2 text-sm">👤</span>
              {currentUser.email}
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
              User Details
            </h2>
            <p className="text-gray-500 text-base">
              View and edit user information.
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

          {/* Información del usuario */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-base font-medium text-gray-900">{userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-base font-medium">
                  {formData.is_superuser ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Administrator
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Employee
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-base font-medium">
                  {formData.is_active ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de edición */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed.
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

            {/* Note about restricted fields */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Role and status settings can only be changed through the API directly for security reasons.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-sm transition"
              >
                Cancel
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

