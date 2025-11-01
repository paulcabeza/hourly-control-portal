import React, { useEffect, useState } from 'react';
import MapComponent from './MapComponent';
import MarkButton from './MarkButton';
import MarkModal from './MarkModal';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';

export default function HomePage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [po, setPo] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const data = await getCurrentUser();
      setUser(data);
    }
    fetchUser();
  }, []);

  const handleOpenModal = (type) => {
    setCurrentType(type);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setPo('');
  };

  const handleSaveMark = () => {
    // Aquí implementaremos la lógica para guardar la marca
    handleCloseModal();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          </div>

          {/* Map */}
          <div className="mb-8 w-full rounded-lg overflow-hidden shadow">
            <MapComponent />
          </div>

          {/* Clock In/Out Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mt-6">
            <MarkButton type="in" onClick={handleOpenModal} />
            <MarkButton type="out" onClick={handleOpenModal} />
          </div>

          {/* Modal */}
          <MarkModal
            isOpen={modalIsOpen}
            onRequestClose={handleCloseModal}
            onSave={handleSaveMark}
            currentType={currentType}
            po={po}
            setPo={setPo}
          />
        </div>
        <div className="text-xs text-gray-400 text-center mt-8">
          © {new Date().getFullYear()} M-Electric. All rights reserved.
        </div>
      </div>
    </div>
  );
}
