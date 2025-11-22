import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';
import { getEmployeesSummaryReport } from '../services/reports';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function EmployeesSummaryReport() {
  const [user, setUser] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        setError('Failed to load user data');
      }
    }
    fetchData();
  }, [navigate]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const reportData = await getEmployeesSummaryReport(startDate, endDate, timezoneOffsetMinutes);
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

  const formatDate = (dateString) => {
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

  const handleOpenPdf = () => {
    if (!report || !report.employees || report.employees.length === 0) {
      return;
    }

    setError('');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('M ELECTRIC, LLC', pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('Employees Hours Summary', pageWidth / 2, 65, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const headerStartY = 90;
      doc.text(`From: ${formatDate(report.start_date)}`, 40, headerStartY);
      doc.text(`To: ${formatDate(report.end_date)}`, pageWidth - 40, headerStartY, { align: 'right' });

      const bodyRows = report.employees.map(emp => [
        emp.user_name,
        emp.user_email,
        emp.total_hours.toFixed(2)
      ]);

      // Calculate total hours for all employees
      const totalAllHours = report.employees.reduce((sum, emp) => sum + emp.total_hours, 0);
      bodyRows.push(['', 'TOTAL', totalAllHours.toFixed(2)]);

      autoTable(doc, {
        head: [['EMPLOYEE NAME', 'EMAIL', 'TOTAL HOURS']],
        body: bodyRows,
        startY: headerStartY + 20,
        margin: { left: 40, right: 40 },
        theme: 'grid',
        styles: { fontSize: 11, cellPadding: 8 },
        headStyles: { fillColor: [47, 84, 150], textColor: 255, fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 100, halign: 'center', fontStyle: 'bold' }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didParseCell: function(data) {
            // Make the last row (Total) bold
            if (data.row.index === bodyRows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 240, 240];
            }
        }
      });

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      setError('Failed to generate PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header/Navbar */}
      <nav className="bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div>
          <span className="font-bold text-2xl mr-2">M-Electric</span>
          <span className="uppercase tracking-wide text-blue-400 font-semibold text-base">
            Summary Report
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
        <div className="max-w-5xl mx-auto">
          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-xl px-10 py-8 mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Generate Employees Summary
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
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
                {loading ? 'Generating...' : '📊 Generate Summary'}
              </button>
              <button
                type="button"
                onClick={handleOpenPdf}
                disabled={
                  loading ||
                  !report ||
                  !report.employees ||
                  report.employees.length === 0
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
                  Employees Hours Summary
                </h3>
                <p className="text-gray-700">
                  <strong>Period:</strong> {formatDate(report.start_date)} - {formatDate(report.end_date)}
                </p>
              </div>

              {/* Tabla de empleados */}
              {report.employees.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No employees found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.employees.map((emp) => (
                        <tr key={emp.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {emp.user_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.user_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                            {emp.total_hours.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Fila de Totales */}
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            TOTAL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {report.employees.reduce((sum, emp) => sum + emp.total_hours, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

