import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getCurrentUser, logout } from '../services/auth';

export default function UsersList() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser && !currentUser.is_superuser) {
          navigate('/');
          return;
        }

        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/admin');
  };

  const handleCreateUser = () => {
    navigate('/admin/create');
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/user/${userId}`);
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
            onClick={handleBackToDashboard}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded text-white font-semibold transition"
          >
            ← Back to Dashboard
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
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl px-10 py-8">
          {/* Header con botón de crear */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                User Management
              </h2>
              <p className="text-gray-500 text-base">
                View and manage all users in the system.
              </p>
            </div>
            <button
              onClick={handleCreateUser}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Create New User
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Tabla de usuarios */}
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No users found.</p>
              <button
                onClick={handleCreateUser}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create your first user
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => handleUserClick(u.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {u.first_name ? u.first_name[0].toUpperCase() : u.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {u.first_name && u.last_name
                                ? `${u.first_name} ${u.last_name}`
                                : u.first_name || u.email.split('@')[0]}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.is_superuser ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Employee
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.is_active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(u.id);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View/Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 text-center mt-8">
          © {new Date().getFullYear()} M-Electric. All rights reserved.
        </div>
      </div>
    </div>
  );
}

