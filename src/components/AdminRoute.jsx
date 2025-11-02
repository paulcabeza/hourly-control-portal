import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await getCurrentUser();
      setIsAdmin(user && user.is_superuser === true);
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/" />;
}

