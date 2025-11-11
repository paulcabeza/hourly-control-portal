import React, { useCallback, useEffect, useState } from 'react';
import MapComponent from './MapComponent';
import MarkButton from './MarkButton';
import MarkModal from './MarkModal';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser, clockIn, clockOut, getMyMarks } from '../services/auth';

export default function HomePage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [po, setPo] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [poLocked, setPoLocked] = useState(false);
  const [canClockOut, setCanClockOut] = useState(false);
  const navigate = useNavigate();

  const refreshClockState = useCallback(async () => {
    try {
      const marks = await getMyMarks();
      const lastMark = marks && marks.length > 0 ? marks[0] : null;
      const readyForClockOut = Boolean(lastMark && lastMark.mark_type === 'clock_in');
      setCanClockOut(readyForClockOut);
      return lastMark;
    } catch (err) {
      console.error('Failed to refresh clock state:', err);
      setCanClockOut(false);
      return null;
    }
  }, []);

  useEffect(() => {
    async function fetchUser() {
      const data = await getCurrentUser();
      setUser(data);
      if (data) {
        await refreshClockState();
      }
    }
    fetchUser();
  }, [refreshClockState]);

  const handleOpenModal = async (type) => {
    if (type === 'out' && !canClockOut) {
      setError('You need to clock in before clocking out.');
      return;
    }

    setCurrentType(type);
    setError('');
    setSuccess('');

    if (type === 'out') {
      try {
        const lastMark = await refreshClockState();

        if (lastMark && lastMark.mark_type === 'clock_in') {
          const lastPo = lastMark.po_number ?? '';
          setPo(lastPo);
          setPoLocked(true);
        } else {
          setPo('');
          setPoLocked(false);
        }
      } catch (err) {
        console.error('Failed to prefill PO for clock out:', err);
        setError('Could not prefill PO for clock out. Please try again.');
        setPo('');
        setPoLocked(false);
      }
    } else {
      setPo('');
      setPoLocked(false);
    }

    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setPo('');
    setError('');
    setPoLocked(false);
  };

  const handleSaveMark = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Obtener ubicación actual
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            if (currentType === 'in') {
              await clockIn(latitude, longitude, po);
              setSuccess('Clock In successful!');
            await refreshClockState();
            } else {
              await clockOut(latitude, longitude, po);
              setSuccess('Clock Out successful!');
            await refreshClockState();
            }
            
            // Cerrar modal después de 1.5 segundos
            setTimeout(() => {
              handleCloseModal();
              setSuccess('');
            }, 1500);
          } catch (err) {
            setError(err.message || 'Failed to save mark');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err.message || 'Failed to save mark');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user && user.is_superuser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header/Navbar */}
      <nav className="bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div>
          <span className="font-bold text-2xl mr-2">M-Electric</span>
          <span className="uppercase tracking-wide text-blue-400 font-semibold text-base">
            Hourly Control
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Menú de Admin - siempre visible si es admin */}
          {isAdmin && (
            <div className="flex items-center gap-2">
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
          )}
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
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl px-10 py-8">
          {/* Título */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Welcome{user ? `, ${user.email.split('@')[0]}` : ''}!
              </h2>
              <p className="text-gray-500 text-base">
                Use the buttons below to clock in or clock out and keep track of your work hours.
              </p>
            </div>
            <button
              onClick={() => navigate('/my-marks')}
              className="mt-4 md:mt-0 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition"
            >
              📋 View My History
            </button>
          </div>

          {/* Map */}
          <div className="mb-8 w-full rounded-lg overflow-hidden shadow">
            <MapComponent />
          </div>

          {/* Clock In/Out Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mt-6">
            <MarkButton type="in" onClick={handleOpenModal} />
            <MarkButton type="out" onClick={handleOpenModal} disabled={!canClockOut} />
          </div>

          {/* Modal */}
          <MarkModal
            isOpen={modalIsOpen}
            onRequestClose={handleCloseModal}
            onSave={handleSaveMark}
            currentType={currentType}
            po={po}
            setPo={setPo}
            poLocked={poLocked}
            loading={loading}
            error={error}
            success={success}
          />
        </div>
        <div className="text-xs text-gray-400 text-center mt-8">
          © {new Date().getFullYear()} M-Electric. All rights reserved.
        </div>
      </div>
    </div>
  );
}
