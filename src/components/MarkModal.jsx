import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function MarkModal({
  isOpen,
  onRequestClose,
  onSave,
  currentType,
  po,
  setPo,
  poLocked,
  loading,
  error,
  success,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="PO Modal"
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        },
        content: {
          position: "relative",
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          maxWidth: "400px",
          width: "100%",
          margin: "auto",
          inset: "unset",
          maxHeight: "90vh",
          overflowY: "auto"
        }
      }}
    >
      <h3 style={{fontWeight: "bold", marginBottom: 20, fontSize: '1.125rem', textAlign: 'center'}}>
        {currentType === 'in' ? 'Clock In' : 'Clock Out'}
      </h3>
      
      {/* Mensajes de error/éxito */}
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#d1fae5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46'
        }}>
          {success}
        </div>
      )}
      
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={po}
          onChange={e => setPo(e.target.value)}
          placeholder="Enter PO Number (optional)"
          disabled={loading || poLocked}
          style={{
            border: '1px solid #ddd',
            padding: '14px',
            borderRadius: 8,
            width: '100%',
            fontSize: '16px',
            backgroundColor: poLocked ? '#f3f4f6' : '#fff',
            color: poLocked ? '#6b7280' : '#111827',
            cursor: poLocked ? 'not-allowed' : 'text',
          }}
        />
        {poLocked && (
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 6 }}>
            This PO comes from your last clock in and cannot be changed for the clock out.
          </p>
        )}
      </div>
      
      <div style={{display:'flex',gap:12,justifyContent:'center', flexWrap: 'wrap'}}>
        <button 
          onClick={onSave}
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#2563eb',
            color:'#fff',
            padding:'12px 28px',
            borderRadius:8,
            border:'none',
            fontWeight:600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            minWidth: '120px',
            flex: '1 1 auto'
          }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={onRequestClose}
          disabled={loading}
          style={{
            background:'#e5e7eb',
            color:'#1f2937',
            padding:'12px 28px',
            borderRadius:8,
            border:'none',
            fontWeight:600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            minWidth: '120px',
            flex: '1 1 auto'
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
export default MarkModal;