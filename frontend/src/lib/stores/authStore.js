import { writable } from 'svelte/store';

export const user = writable(null);
export const token = writable(null);

// Function to get cookie value by name
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}

// Function to initialize from cookies
export function initAuth() {
	const userCookie = getCookie('user');
	const tokenCookie = getCookie('token');

	if (userCookie && tokenCookie) {
		user.set(JSON.parse(userCookie));
		token.set(tokenCookie);
	}
}

// Logout function
export function logout() {
	user.set(null);
	token.set(null);

	// Remove cookies by setting expired date
	document.cookie = 'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
