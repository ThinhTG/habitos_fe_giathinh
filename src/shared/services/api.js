// Default to local API gateway in development to avoid hitting remote server
// that may not allow CORS. In production, set VITE_API_URL at build time.
const API_BASE_URL =
	import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
	"https://giathinh.duckdns.org/api/auths/login";

const TOKEN_KEY = "habitos_token";
const USER_KEY = "habitos_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch (error) {
		console.warn("Failed to parse stored user", error);
		return null;
	}
};

export const setAuth = ({ token, user }) => {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	}

	if (user) {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	}
};

export const clearAuth = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

const buildHeaders = (customHeaders = {}) => {
	const token = getToken();

	return {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...customHeaders,
	};
};

export const request = async (path, options = {}) => {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: buildHeaders(options.headers),
	});

	if (!response.ok) {
		let errorMessage = response.statusText || "Request failed";

		try {
			const payload = await response.json();
			errorMessage = payload?.message || payload?.error || errorMessage;
			} catch {
				// ignore JSON parse error
			}

		const error = new Error(errorMessage);
		error.status = response.status;
		throw error;
	}

	if (response.status === 204) {
		return null;
	}

	return response.json();
};
