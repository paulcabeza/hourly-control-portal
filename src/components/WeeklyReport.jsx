import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getCurrentUser, logout } from '../services/auth';
import { getWeeklyReport, updateMark, createMark, deleteMark } from '../services/reports';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function WeeklyReport() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingMark, setEditingMark] = useState(null);
  const [creatingMark, setCreatingMark] = useState(null); // { clockInId, markType }
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const timezoneOffsetMinutes = useMemo(() => new Date().getTimezoneOffset(), []);

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
      } catch {
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
            const reportData = await getWeeklyReport(selectedUserId, startDate, endDate, timezoneOffsetMinutes);
      setReport(reportData);
    } catch (error) {
      setError(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditMark = (mark) => {
    setEditingMark(mark);
    setCreatingMark(null);
    setShowModal(true);
  };

  const handleCreateMark = (clockInId, markType) => {
    setCreatingMark({ clockInId, markType });
    setEditingMark(null);
    setShowModal(true);
  };

  const handleDeleteMark = async (markId) => {
    if (!window.confirm('Are you sure you want to delete this mark?')) {
      return;
    }

    try {
      await deleteMark(markId);
      // Refrescar el reporte
      if (selectedUserId && startDate && endDate) {
        await handleGenerateReport();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete mark');
    }
  };

  const handleSaveMark = async (formData) => {
    try {
      setError('');
      setLoading(true);
      
      if (editingMark) {
        // Actualizar mark existente
        await updateMark(editingMark.id, formData);
      } else if (creatingMark && report) {
        // Crear nuevo mark
        await createMark({
          user_id: report.user_id,
          mark_type: creatingMark.markType,
          timestamp: formData.timestamp,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          po_number: formData.po_number || null,
          clock_in_id: formData.clock_in_id ?? undefined,
        });
      }

      setShowModal(false);
      setEditingMark(null);
      setCreatingMark(null);
      
      // Refrescar el reporte
      if (selectedUserId && startDate && endDate) {
        await handleGenerateReport();
      }
    } catch (error) {
      setError(error.message || 'Failed to save mark');
    } finally {
      setLoading(false);
    }
  };

  const toLocalDate = (timestampString) => {
    if (!timestampString) return null;
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(timestampString);
    const date = new Date(hasTimezone ? timestampString : `${timestampString}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatPdfDate = (dateString) => {
    if (!dateString) return '';
    const hasTime = /T/.test(dateString);
    const source = hasTime ? dateString : `${dateString}T00:00:00Z`;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPdfTime = (timestampString) => {
    const date = toLocalDate(timestampString);
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenPdf = () => {
    if (!report || !report.daily_reports || report.daily_reports.length === 0) {
      return;
    }

    setError('');

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('M ELECTRIC, LLC', pageWidth / 2, 40, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      const headerStartY = 70;
      doc.text(`Name: ${report.user_name || ''}`, 50, headerStartY);
      doc.text(`From: ${formatPdfDate(report.start_date)}`, 50, headerStartY + 20);
      doc.text(`To: ${formatPdfDate(report.end_date)}`, pageWidth / 2, headerStartY + 20);

      const bodyRows = [];
      report.daily_reports.forEach((day) => {
        if (!day.sessions || day.sessions.length === 0) {
          bodyRows.push([
            formatPdfDate(day.date),
            '',
            '',
            '',
            '',
            day.total_hours ? day.total_hours.toFixed(2) : '',
            '',
            ''
          ]);
          return;
        }

        day.sessions.forEach((session) => {
          const clockIn = session.clock_in;
          const clockOut = session.clock_out;
          const addresses = [clockIn?.address, clockOut?.address]
            .filter((value, index, arr) => value && arr.indexOf(value) === index)
            .join('\n');
          const jobPo = clockOut?.po_number || clockIn?.po_number || '';

          bodyRows.push([
            formatPdfDate(day.date),
            '',
            clockIn ? formatPdfTime(clockIn.timestamp) : '',
            clockOut ? formatPdfTime(clockOut.timestamp) : '',
            '',
            session.hours_worked ? session.hours_worked.toFixed(2) : '',
            jobPo,
            addresses
          ]);
        });
      });

      if (bodyRows.length === 0) {
        bodyRows.push(['', '', '', '', '', '', '', '']);
      }

      autoTable(doc, {
        head: [['DATE', 'WORK DESCRIPTION', 'CLOCK IN', 'CLOCK OUT', 'LUNCH', 'HOURS', 'JOB/PO', 'ADDRESSES']],
        body: bodyRows,
        startY: headerStartY + 40,
        margin: { left: 40, right: 40 },
        theme: 'grid',
        styles: { fontSize: 11, cellPadding: 6, overflow: 'linebreak' },
        headStyles: { fillColor: [47, 84, 150], textColor: 255, fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 110 },
          2: { cellWidth: 80 },
          3: { cellWidth: 80 },
          4: { cellWidth: 60, halign: 'center' },
          5: { cellWidth: 60, halign: 'center' },
          6: { cellWidth: 80 },
          7: { cellWidth: 200 }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      const tableBottom = doc.lastAutoTable?.finalY || headerStartY + 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(
        `TOTAL HOURS: ${Number(report.total_hours || 0).toFixed(2)} hrs`,
        pageWidth - 200,
        tableBottom + 30
      );

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      setError('Failed to generate PDF');
    }
  };

  const formatDateTime = (isoString) => {
    // Mostrar en hora local. Si el timestamp no trae timezone, asumir UTC y convertir.
    const TREAT_NAIVE_AS_UTC = true;
    const hasTz = /(?:Z|[+-]\d{2}:\d{2})$/.test(isoString);
    const date = new Date(hasTz ? isoString : (TREAT_NAIVE_AS_UTC ? `${isoString}Z` : isoString));
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    // Para mantener consistencia con la agrupación del backend, tratamos las fechas sin hora como locales
    const hasTime = /T/.test(dateString);
    const source = hasTime ? dateString : `${dateString}T00:00:00`;
    const date = new Date(source);
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
          {/* Menú de navegación Admin */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
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

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition disabled:bg-gray-400"
              >
                {loading ? 'Generating...' : '📊 Generate Report'}
              </button>
              <button
                type="button"
                onClick={handleOpenPdf}
                disabled={
                  loading ||
                  !report ||
                  !report.daily_reports ||
                  report.daily_reports.length === 0
                }
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition disabled:bg-gray-400"
              >
                🖨️ Print PDF
              </button>
            </div>
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
                                <div className="relative">
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
                                  <div className="mt-2 flex gap-1">
                                    <button
                                      onClick={() => handleEditMark(session.clock_in)}
                                      className="px-3 py-1.5 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md border border-blue-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                      title="Edit Clock In"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMark(session.clock_in.id)}
                                      className="px-3 py-1.5 text-xs font-semibold bg-white text-red-600 hover:bg-red-50 rounded-md border border-red-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                                      title="Delete Clock In"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </div>

                                {/* Clock Out */}
                                <div className="relative">
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
                                      <div className="mt-2 flex gap-1">
                                        <button
                                          onClick={() => handleEditMark(session.clock_out)}
                                          className="px-3 py-1.5 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md border border-blue-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                          title="Edit Clock Out"
                                        >
                                          ✏️ Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteMark(session.clock_out.id)}
                                          className="px-3 py-1.5 text-xs font-semibold bg-white text-red-600 hover:bg-red-50 rounded-md border border-red-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                                          title="Delete Clock Out"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div>
                                      <p className="text-sm text-yellow-600 italic mb-2">
                                        No clock out recorded
                                      </p>
                                      <button
                                        onClick={() => handleCreateMark(session.clock_in.id, 'clock_out')}
                                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md border border-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
                                        title="Add Clock Out"
                                      >
                                        ➕ Add Clock Out
                                      </button>
                                    </div>
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

      {/* Modal para editar/crear mark */}
      {showModal && (
        <MarkEditModal
          mark={editingMark}
          creatingMark={creatingMark}
          report={report}
          onClose={() => {
            setShowModal(false);
            setEditingMark(null);
            setCreatingMark(null);
          }}
          onSave={handleSaveMark}
          error={error}
        />
      )}
    </div>
  );
}

// Componente Modal para editar/crear mark
function MarkEditModal({ mark, creatingMark, report, onClose, onSave, error }) {
  // Si estamos creando un clock out, obtener el clock_in correspondiente
  const clockInMark = creatingMark && report ? (() => {
    for (const day of report.daily_reports) {
      for (const session of day.sessions) {
        if (session.clock_in?.id === creatingMark.clockInId) {
          return session.clock_in;
        }
      }
    }
    return null;
  })() : null;

  const nextClockInMark = useMemo(() => {
    if (!clockInMark || !report) {
      return null;
    }

    let foundCurrent = false;
    for (const day of report.daily_reports || []) {
      for (const session of day.sessions || []) {
        if (session.clock_in?.id === clockInMark.id) {
          foundCurrent = true;
          continue;
        }

        if (foundCurrent && session.clock_in) {
          return session.clock_in;
        }
      }

      if (foundCurrent) {
        // Continue searching subsequent days
        continue;
      }
    }

    return null;
  }, [clockInMark, report]);

  // Helper para convertir timestamp UTC (desde backend) a formato datetime-local (hora local del usuario)
  const utcToLocalInput = (timestampString) => {
    // El backend envía timestamps como ISO sin 'Z' (naive UTC), ej: "2025-11-06T02:21:00"
    // JavaScript trata strings sin timezone como hora LOCAL, pero nosotros sabemos que es UTC
    // Necesitamos agregar 'Z' para que JavaScript lo trate como UTC, luego convierte a local
    
    // Detectar si ya tiene timezone explícito al final del string (Z o ±HH:MM)
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(timestampString);
    
    // Si no tiene timezone, agregar 'Z' para indicar UTC
    const utcTimestamp = hasTimezone ? timestampString : `${timestampString}Z`;
    
    // Crear fecha: con 'Z', JavaScript lo trata como UTC y convierte a hora local automáticamente
    const date = new Date(utcTimestamp);
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', timestampString);
      return new Date().toISOString().slice(0, 16);
    }
    
    // Los métodos getHours(), getMonth(), etc. ya devuelven valores en hora local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper para convertir datetime-local input (hora local del usuario) a UTC naive para guardar
  const localInputToUTC = (localInputString) => {
    // El input datetime-local da un string sin timezone (YYYY-MM-DDTHH:mm) en hora local del usuario
    // Necesitamos convertir esa hora local a UTC antes de guardar
    // 1. Crear un Date tratando el string como hora local
    const localDate = new Date(localInputString);
    
    // 2. Obtener los componentes UTC de esa fecha
    const year = localDate.getUTCFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localDate.getUTCDate()).padStart(2, '0');
    const hours = String(localDate.getUTCHours()).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');
    
    // 3. Devolver en formato ISO sin 'Z' (naive UTC)
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const parseInputToLocalDate = (localInputString) => {
    if (!localInputString) return null;
    const date = new Date(localInputString);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const parseBackendTimestampToLocalDate = (timestampString) => {
    if (!timestampString) return null;
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(timestampString);
    const date = new Date(hasTimezone ? timestampString : `${timestampString}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const [validationError, setValidationError] = useState('');
  const markId = mark?.id;
  const creatingClockInId = creatingMark?.clockInId;

  useEffect(() => {
    setValidationError('');
  }, [markId, creatingClockInId, clockInMark?.id]);

  const [formData, setFormData] = useState(() => {
    if (mark) {
      // Editar mark existente - mostrar en hora local del usuario
      return {
        timestamp: utcToLocalInput(mark.timestamp),
        latitude: mark.latitude?.toString() || '',
        longitude: mark.longitude?.toString() || '',
        po_number: mark.po_number || '',
        address: mark.address || '',
      };
    } else if (clockInMark) {
      // Crear nuevo clock out - usar valores del clock_in como base (mostrar en hora local)
      return {
        timestamp: utcToLocalInput(clockInMark.timestamp),
        latitude: clockInMark.latitude?.toString() || '',
        longitude: clockInMark.longitude?.toString() || '',
        po_number: clockInMark.po_number || '',
        address: clockInMark.address || '',
      };
    } else {
      // Fallback - hora actual en formato local para el input
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return {
        timestamp: `${year}-${month}-${day}T${hours}:${minutes}`,
        latitude: '',
        longitude: '',
        po_number: '',
        address: '',
      };
    }
  });

  const isCreating = creatingMark !== null;
  const isCreatingClockOut = isCreating && creatingMark?.markType === 'clock_out';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setValidationError('');

    const proposedLocalDate = parseInputToLocalDate(formData.timestamp);
    if (!proposedLocalDate) {
      setValidationError('Please provide a valid timestamp.');
      return;
    }

    if (creatingMark && clockInMark) {
      const clockInLocal = parseBackendTimestampToLocalDate(clockInMark.timestamp);
      if (clockInLocal && proposedLocalDate <= clockInLocal) {
        setValidationError('Clock out must occur after the selected clock in.');
        return;
      }

      const nextLocal = nextClockInMark
        ? parseBackendTimestampToLocalDate(nextClockInMark.timestamp)
        : null;

      if (nextLocal && proposedLocalDate >= nextLocal) {
        setValidationError(
          `Clock out must be before the next clock in at ${nextLocal.toLocaleString()}`
        );
        return;
      }
    }

    const submitData = {
      // Convertir de vuelta a UTC: el input datetime-local da hora local, pero queremos UTC
      timestamp: localInputToUTC(formData.timestamp),
      latitude: parseFloat(formData.latitude) || undefined,
      longitude: parseFloat(formData.longitude) || undefined,
      po_number: formData.po_number || undefined,
      address: formData.address || undefined,
      clock_in_id: clockInMark?.id,
    };
    
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {isCreating ? 'Create Clock Out' : 'Edit Mark'}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {validationError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timestamp *
              </label>
              <input
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="-90"
                  max="90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="-180"
                  max="180"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number (optional)
              </label>
              <input
                type="text"
                value={formData.po_number}
                onChange={(e) => {
                  if (isCreatingClockOut) return;
                  setFormData({ ...formData, po_number: e.target.value });
                }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isCreatingClockOut ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                disabled={isCreatingClockOut}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (optional - will be auto-filled from coordinates)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              {isCreating ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

