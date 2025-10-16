import React from 'react';

function MarkButton({ type, onClick }) {
  const text = type === 'in' ? 'Mark Entry' : 'Mark Exit';
  const color = type === 'in'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-green-600 hover:bg-green-700';

  return (
    <button
      className={`w-40 py-3 text-lg font-semibold text-white rounded shadow ${color} transition-colors duration-150 mx-2`}
      style={{ minWidth: 150 }}
      onClick={() => onClick(type)}
    >
      {text}
    </button>
  );
}

export default MarkButton;