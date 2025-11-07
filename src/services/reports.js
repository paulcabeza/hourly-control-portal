const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getWeeklyReport = async (userId, startDate = null, endDate = null, timezoneOffsetMinutes = null) => {
    try {
        let url = `${API_URL}/marks/weekly-report/${userId}`;
        const params = new URLSearchParams();
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (timezoneOffsetMinutes !== null && timezoneOffsetMinutes !== undefined) {
            params.append('timezone_offset_minutes', timezoneOffsetMinutes.toString());
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get weekly report');
        }

        return await response.json();
    } catch (error) {
        console.error('Get weekly report error:', error);
        throw error;
    }
};

export const updateMark = async (markId, markData) => {
    try {
        const response = await fetch(`${API_URL}/marks/${markId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(markData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update mark');
        }

        return await response.json();
    } catch (error) {
        console.error('Update mark error:', error);
        throw error;
    }
};

export const createMark = async (markData) => {
    try {
        const response = await fetch(`${API_URL}/marks/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(markData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create mark');
        }

        return await response.json();
    } catch (error) {
        console.error('Create mark error:', error);
        throw error;
    }
};

export const deleteMark = async (markId) => {
    try {
        const response = await fetch(`${API_URL}/marks/${markId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete mark');
        }

        return await response.json();
    } catch (error) {
        console.error('Delete mark error:', error);
        throw error;
    }
};

