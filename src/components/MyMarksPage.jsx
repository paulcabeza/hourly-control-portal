import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyMarks, getCurrentUser, logout } from '../services/auth';

export default function MyMarksPage() {
  const [user, setUser] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const myMarks = await getMyMarks();
        setMarks(myMarks);
      } catch {
        setError('Failed to load marks');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    // Mostrar en hora local. Si el timestamp no trae timezone, asumir UTC y convertir.
    const TREAT_NAIVE_AS_UTC = true;
    const hasTz = /(?:Z|[+-]\d{2}:\d{2})$/.test(dateString);
    const date = new Date(hasTz ? dateString : (TREAT_NAIVE_AS_UTC ? `${dateString}Z` : dateString));
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <nav className="bg-slate-800 text-white px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center shadow-lg">
        <div className="flex-1 min-w-0">
          <span className="font-bold text-lg sm:text-2xl mr-1 sm:mr-2 block sm:inline">M-Electric</span>
          <span className="uppercase tracking-wide text-blue-400 font-semibold text-xs sm:text-base block sm:inline sm:ml-2">
            My Marks
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={handleBackToHome}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-600 hover:bg-gray-700 rounded text-white font-semibold transition"
          >
            <span className="hidden sm:inline">← Back to Home</span>
            <span className="sm:hidden">←</span>
          </button>
          {user && user.is_superuser && (
            <button
              onClick={() => navigate('/admin')}
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition"
            >
              <span className="hidden sm:inline">🔧 Admin</span>
              <span className="sm:hidden">🔧</span>
            </button>
          )}
          {user && (
            <div
              className="hidden sm:flex items-center px-3 py-1 border border-blue-100 rounded-full bg-blue-50 text-blue-900 shadow-sm transition select-none"
              title={user.email}
            >
              <span className="text-blue-400 mr-2 text-sm">👤</span>
              <span className="text-xs truncate max-w-[100px]">{user.email}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl px-4 sm:px-10 py-6 sm:py-8">
          {/* Título */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
              My Clock In/Out History
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              View all your clock in and clock out records.
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Tabla de marcas - Desktop */}
          {marks.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-base sm:text-lg">No marks found.</p>
              <button
                onClick={handleBackToHome}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base"
              >
                Go to Home to create your first mark
              </button>
            </div>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PO Number
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {marks.map((mark) => (
                      <tr key={mark.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {mark.mark_type === 'clock_in' ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Clock In
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Clock Out
                            </span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(mark.timestamp)}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate" title={mark.address}>
                            {mark.address || `${mark.latitude}, ${mark.longitude}`}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {mark.po_number || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista de cards para móvil */}
              <div className="md:hidden space-y-3">
                {marks.map((mark) => (
                  <div key={mark.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {mark.mark_type === 'clock_in' ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Clock In
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Clock Out
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{formatDate(mark.timestamp)}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</div>
                        <div className="text-sm text-gray-900 break-words" title={mark.address}>
                          {mark.address || `${mark.latitude}, ${mark.longitude}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">PO Number</div>
                        <div className="text-sm text-gray-900 font-medium">
                          {mark.po_number || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-gray-400 text-center mt-4 sm:mt-8">
          © {new Date().getFullYear()} M-Electric. All rights reserved.
        </div>
      </div>
    </div>
  );
}
