export async function fetchProtectedResource(endpoint) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Failed to fetch protected resource');
    }
}