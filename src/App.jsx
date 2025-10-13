import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MapComponent from './components/MapComponent'
import LoginPage from './components/LoginPage'
import MyMarksPage from './components/MyMarksPage'

function PrivateRoute({ children, authed }) {
  return authed ? children : <Navigate to="/login" replace />;
}

function App() {
  const [token, setToken] = useState(null); // null = not logged in, token string = logged in

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/" element={<div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Hourly Report Portal</h1>
          <MapComponent />
          {/* Aquí irían otros controles públicos */}
        </div>} />
        <Route
          path="/my-marks"
          element={
            <PrivateRoute authed={!!token}>
              <MyMarksPage token={token} />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
