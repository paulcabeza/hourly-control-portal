import React from 'react'

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function MarksTable({ marks }) {
    if (marks.length === 0) return <div className='text-gray-500 mt-4'>No marks found</div>

    return (
        <div className='overflow-x-auto mt-8'>
        <table className="table-auto min-w-[400px] mx-auto rounded overflow-hidden bg-white shadow border">
        <thead>
          <tr className="bg-gray-200 text-gray-800">
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">PO</th>
            <th className="px-4 py-2">Fecha/Hora</th>
            <th className="px-4 py-2">Lat</th>
            <th className="px-4 py-2">Lng</th>
          </tr>
        </thead>
        <tbody>
          {marks.map((mark, idx) => (
            <tr key={idx} className="text-center">
              <td>{mark.type === 'in' ? 'Entrada' : 'Salida'}</td>
              <td>{mark.po}</td>
              <td>{formatDate(mark.timestamp)}</td>
              <td>{Number(mark.lat).toFixed(5)}</td>
              <td>{Number(mark.lng).toFixed(5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
}

export default MarksTable
