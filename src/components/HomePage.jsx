import React, { useState } from 'react';
import MapComponent from './MapComponent';
import MarkButton from './MarkButton';
import MarkModal from './MarkModal';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

export default function HomePage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [po, setPo] = useState('');
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <nav className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Hourly Report Portal</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Map */}
          <div className="mb-6 w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
            <MapComponent />
          </div>

          {/* Clock In/Out Buttons */}
          <div className="flex justify-center gap-4 mt-6">
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
      </div>
    </div>
  );
}
