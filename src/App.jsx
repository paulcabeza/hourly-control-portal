import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import UsersList from './components/UsersList';
import CreateUser from './components/AdminPanel';
import UserDetail from './components/UserDetail';
import AdminRoute from './components/AdminRoute';
import { getCurrentUser } from './services/auth';

function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminRoute>
                <UsersList />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <PrivateRoute>
              <AdminRoute>
                <CreateUser />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/user/:userId"
          element={
            <PrivateRoute>
              <AdminRoute>
                <UserDetail />
              </AdminRoute>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;