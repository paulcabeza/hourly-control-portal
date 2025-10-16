import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import MarkButton from './components/MarkButton';
import MarkModal from './components/MarkModal';

function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [po, setPo] = useState('');

  const handleOpenModal = (type) => {
    setCurrentType(type);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setPo('');
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 250);
  };

  const handleSaveMark = () => {
    // Aquí aún no guardamos nada, solo cierra el modal
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold mb-8 text-slate-800">Hourly Report Portal</h1>
      <div className="mb-6 w-full max-w-xl mx-auto">
        <MapComponent />
      </div>
      <div className="mb-8 flex gap-4">
        <MarkButton type="in" onClick={handleOpenModal} />
        <MarkButton type="out" onClick={handleOpenModal} />
      </div>
      <MarkModal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        onSave={handleSaveMark}
        currentType={currentType}
        po={po}
        setPo={setPo}
      />
    </div>
  );
}

export default App;
