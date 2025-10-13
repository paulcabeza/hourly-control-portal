import React from 'react'
import Modal from 'react-modal'

Modal.setAppElement('#root')

function MarkModal({ isOpen, onRequestClose, onSave, currentType, po, setPo }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="PO Modal"
            overlayClassName="ixed inset-0 bg-black/50 flex justify-center items-center z-50"
            className='bg-white rounded-md px-8 py-6 shadow-lg max-w-xs outline-none mx-auto'
        >
            <h3 className='text-lg font-bold mb-4'>
                {currentType === 'in' ? 'Clock In' : 'Clock Out'}
            </h3>
            <input
                type="text"
                value={po}
                onChange={(e) => setPo(e.target.value)}
                placeholder="Enter PO"
                className="border p-2 w-full mb-4 rounded"
            />
            <div className='flex gap-4 justify-center'>
                <button
                onClick={onSave}
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold'
                >
                    Save
                </button>
                <button
                onClick={onRequestClose}
                className='bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 font-semibold'
                >
                    Cancel
                </button>
            </div>
        </Modal>
    )
}

export default MarkModal