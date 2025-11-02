import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getCurrentUser, logout } from '../services/auth';
import { getWeeklyReport } from '../services/reports';

export default function WeeklyReport() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
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

        // Calcular fechas por defecto (sábado a viernes)
        const today = new Date();
        const daysSinceSaturday = (today.getDay() + 1) % 7;
        const lastSaturday = new Date(today);
        lastSaturday.setDate(today.getDate() - daysSinceSaturday);
        const nextFriday = new Date(lastSaturday);
        nextFriday.setDate(lastSaturday.getDate() + 6);

        setStartDate(lastSaturday.toISOString().split('T')[0]);
        setEndDate(nextFriday.toISOString().split('T')[0]);
      } catch (err) {
        setError('Failed to load data');
      }
    }
    fetchData();
  }, [navigate]);

  const handleGenerateReport = async () => {
    if (!selectedUserId) {
      setError('Please select an employee');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const reportData = await getWeeklyReport(selectedUserId, startDate, endDate);
      setReport(reportData);
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header/Navbar */}
      <nav className="bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div>
          <span className="font-bold text-2xl mr-2">M-Electric</span>
          <span className="uppercase tracking-wide text-blue-400 font-semibold text-base">
            Weekly Report
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
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
        <div className="max-w-7xl mx-auto">
          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-xl px-10 py-8 mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Generate Hourly Report
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Selector de empleado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">-- Select an employee --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name && u.last_name
                        ? `${u.first_name} ${u.last_name} (${u.email})`
                        : u.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Saturday)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Fecha de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Friday)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : '📊 Generate Report'}
            </button>
          </div>

          {/* Reporte */}
          {report && (
            <div className="bg-white rounded-2xl shadow-xl px-10 py-8">
              {/* Header del reporte */}
              <div className="border-b pb-6 mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {report.user_name}
                </h3>
                <p className="text-gray-600 mb-4">{report.user_email}</p>
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">
                    <strong>Period:</strong> {formatDate(report.start_date)} - {formatDate(report.end_date)}
                  </p>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-3xl font-bold text-green-600">
                      {report.total_hours} hrs
                    </p>
                  </div>
                </div>
              </div>

              {/* Reportes diarios */}
              {report.daily_reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No clock in/out records found for this period.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {report.daily_reports.map((day) => (
                    <div key={day.date} className="border rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-slate-800">
                          {formatDate(day.date)}
                        </h4>
                        <span className="text-lg font-semibold text-blue-600">
                          {day.total_hours.toFixed(2)} hrs
                        </span>
                      </div>

                      {day.sessions.length === 0 ? (
                        <p className="text-gray-500 italic">No sessions recorded</p>
                      ) : (
                        <div className="space-y-3">
                          {day.sessions.map((session, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                            >
                              <div className="grid md:grid-cols-3 gap-4">
                                {/* Clock In */}
                                <div>
                                  <p className="text-xs font-semibold text-green-600 mb-1">
                                    CLOCK IN
                                  </p>
                                  <p className="font-medium">
                                    {formatDateTime(session.clock_in.timestamp)}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate" title={session.clock_in.address}>
                                    {session.clock_in.address}
                                  </p>
                                  {session.clock_in.po_number && (
                                    <p className="text-xs text-gray-500">
                                      PO: {session.clock_in.po_number}
                                    </p>
                                  )}
                                </div>

                                {/* Clock Out */}
                                <div>
                                  {session.clock_out ? (
                                    <>
                                      <p className="text-xs font-semibold text-red-600 mb-1">
                                        CLOCK OUT
                                      </p>
                                      <p className="font-medium">
                                        {formatDateTime(session.clock_out.timestamp)}
                                      </p>
                                      <p className="text-sm text-gray-600 truncate" title={session.clock_out.address}>
                                        {session.clock_out.address}
                                      </p>
                                      {session.clock_out.po_number && (
                                        <p className="text-xs text-gray-500">
                                          PO: {session.clock_out.po_number}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-sm text-yellow-600 italic">
                                      No clock out recorded
                                    </p>
                                  )}
                                </div>

                                {/* Horas trabajadas */}
                                <div className="flex items-center justify-end">
                                  <div className="text-right">
                                    <p className="text-xs text-gray-600 mb-1">Hours Worked</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                      {session.hours_worked.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

