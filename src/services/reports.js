const API_URL = import.meta.env.VITE_API_URL;

export const getWeeklyReport = async (userId, startDate = null, endDate = null) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        let url = `${API_URL}/marks/weekly-report/${userId}`;
        const params = new URLSearchParams();
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
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

