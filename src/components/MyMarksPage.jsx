import React from 'react';

export default function MyMarksPage({ token }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">My Marks</h1>
      <div className="bg-white rounded shadow px-8 py-6 max-w-xl">
        <div>
          <b>Authenticated!</b>
        </div>
        <div className="text-sm text-gray-500 my-3">
          (The user's token is: <code className="text-xs text-blue-500">{token}</code>)
        </div>
        <div className="mt-3">Here you can load and list the marks saved by the user who logs in, consulting your private API.</div>
      </div>
    </div>
  );
}
