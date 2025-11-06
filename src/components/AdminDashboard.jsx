import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!user) {
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
            Admin Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Menú de navegación Admin */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded text-white font-semibold transition"
            >
              🏠 Home
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition"
            >
              🔧 Admin Panel
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition"
            >
              👥 Users
            </button>
            <button
              onClick={() => navigate('/admin/weekly-report')}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition"
            >
              📊 Reports
            </button>
          </div>
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
        <div className="max-w-5xl mx-auto">
          {/* Título */}
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-3">
              Welcome, Admin!
            </h2>
            <p className="text-gray-600 text-lg">
              Manage users and view employee work reports.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: User Management */}
            <div
              onClick={() => navigate('/admin/users')}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  User Management
                </h3>
                <p className="text-gray-600 mb-6">
                  View, create, and edit employee accounts. Manage user permissions and access.
                </p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                  Manage Users →
                </button>
              </div>
            </div>

            {/* Card 2: Weekly Report */}
            <div
              onClick={() => navigate('/admin/weekly-report')}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Hourly Weekly Report
                </h3>
                <p className="text-gray-600 mb-6">
                  View employee work hours, clock in/out records, and generate weekly reports.
                </p>
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition">
                  View Reports →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center mt-12">
          © {new Date().getFullYear()} M-Electric. All rights reserved.
        </div>
      </div>
    </div>
  );
}

