import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginUser(email, password);
            navigate('/'); // Redirige al home después del login
        } catch (error) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="bg-white shadow-2xl rounded-xl px-10 py-12 w-full max-w-lg flex flex-col items-center">
                <svg
                    className="w-16 h-16 mb-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 48 48"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="white" />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 32h12M24 16v16"
                        className="stroke-blue-600"
                    />
                </svg>
                <h1 className="text-2xl font-bold mb-1 text-center text-slate-800">
                    Sign in to <span className="text-blue-700">M-Electric</span>
                </h1>
                <div className="mb-6 text-base text-center text-gray-500 font-medium tracking-wide">
                    Hourly Control (Employee Clock In/Out)
                </div>
                <form className="w-full space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                            placeholder="e.g. employee@melectric.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && (
                        <div className="text-red-600 text-center font-medium">{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-sm transition"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <div className="mt-7 text-xs text-gray-400 text-center">
                    © {new Date().getFullYear()} M-Electric. All rights reserved.
                </div>
            </div>
        </div>
    );
}