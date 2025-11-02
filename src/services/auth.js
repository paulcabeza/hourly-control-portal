const API_URL = import.meta.env.VITE_API_URL;
console.log('API_URL', API_URL);
console.log(API_URL);

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/jwt/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: email,    // FastAPI Users usa 'username' para email
                password: password,
            }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        // Guardar el token
        localStorage.setItem('token', data.access_token);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                return null;
            }
            throw new Error('Failed to get user');
        }

        return await response.json();
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

export const createUser = async (userData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create user');
        }

        return await response.json();
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
};

export const getAllUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get users');
        }

        return await response.json();
    } catch (error) {
        console.error('Get users error:', error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get user');
        }

        return await response.json();
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update user');
        }

        return await response.json();
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
};

// ===== MARKS API =====

export const clockIn = async (latitude, longitude, poNumber) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_URL}/marks/clock-in`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mark_type: 'clock_in',
                latitude,
                longitude,
                po_number: poNumber || null,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to clock in');
        }

        return await response.json();
    } catch (error) {
        console.error('Clock in error:', error);
        throw error;
    }
};

export const clockOut = async (latitude, longitude, poNumber) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_URL}/marks/clock-out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mark_type: 'clock_out',
                latitude,
                longitude,
                po_number: poNumber || null,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to clock out');
        }

        return await response.json();
    } catch (error) {
        console.error('Clock out error:', error);
        throw error;
    }
};

export const getMyMarks = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_URL}/marks/my-marks`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get marks');
        }

        return await response.json();
    } catch (error) {
        console.error('Get marks error:', error);
        throw error;
    }
};