import React from 'react';

function MarkButton({ type, onClick, disabled }) {
  const text = type === 'in' ? 'Mark Entry' : 'Mark Exit';
  const color = type === 'in'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-green-600 hover:bg-green-700';

  return (
    <button
      className={`w-full sm:w-40 py-4 sm:py-3 text-base sm:text-lg font-semibold text-white rounded-lg shadow-lg ${color} transition-colors duration-150 ${
        disabled ? 'opacity-60 cursor-not-allowed bg-gray-400 hover:bg-gray-400' : ''
      }`}
      onClick={() => {
        if (!disabled) {
          onClick(type);
        }
      }}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export default MarkButton;