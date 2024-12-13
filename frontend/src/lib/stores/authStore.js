import { writable } from 'svelte/store';

export const user = writable(null);
export const token = writable(null);

// Function to initialize from localStorage
export function initAuth() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
        user.set(JSON.parse(storedUser));
        token.set(storedToken);
    }
}

// Logout function
export function logout() {
    user.set(null);
    token.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}