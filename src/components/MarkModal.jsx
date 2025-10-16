import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function MarkModal({ isOpen, onRequestClose, onSave, currentType, po, setPo }) {
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
          zIndex: 1000
        },
        content: {
          position: "relative",
          background: "#fff",
          padding: "2rem",
          borderRadius: "0.5rem",
          maxWidth: "350px",
          margin: "auto",
          inset: "unset"
        }
      }}
    >
      <h3 style={{fontWeight: "bold", marginBottom: 28}}>
        {currentType === 'in' ? 'Clock In' : 'Clock Out'}
      </h3>
      <input
        type="text"
        value={po}
        onChange={e => setPo(e.target.value)}
        placeholder="Enter PO"
        style={{border:'1px solid #ddd',padding:10,borderRadius:8,width:'100%',marginBottom:20}}
      />
      <div style={{display:'flex',gap:16,justifyContent:'center'}}>
        <button onClick={onSave}
                style={{background:'#2563eb',color:'#fff',padding:'8px 20px',borderRadius:8,border:'none',fontWeight:600}}>
          Save
        </button>
        <button onClick={onRequestClose}
                style={{background:'#e5e7eb',color:'#1f2937',padding:'8px 20px',borderRadius:8,border:'none',fontWeight:600}}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
export default MarkModal;