import React from 'react'

function MarkButton({ type, onClick }) {
    const text = type === 'in' ? 'Clock In' : 'Clock Out'
    const color = type === 'in'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-green-600 hover:bg-green-700'

    return (
        <button
        className={`px-5 py-2 text-white rounded-md font-semibold shadow-md ${color} mx-2 transition-colors`}
        onClick={() => onClick(type)}
        >
            {text}
        </button>
    )
}

export default MarkButton