import { request, setAuth, clearAuth, getStoredUser } from "@/shared/services/api";

const decodeJwt = (token) => {
	if (!token) return null;

	try {
		const payload = token.split(".")[1];
		if (!payload) return null;
		const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(normalized);
		return JSON.parse(decoded);
	} catch {
		return null;
	}
};

export const login = async ({ email, password }) => {
	const data = await request("/auths/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});

	if (data?.success === false) {
		throw new Error(data?.message || data?.error || "Đăng nhập thất bại.");
	}

	const payload = data?.data || data?.result || data;
	const token =
		payload?.token ||
		payload?.accessToken ||
		payload?.access_token ||
		payload?.jwt ||
		data?.token ||
		data?.accessToken ||
		data?.access_token ||
		data?.jwt;
	const claims = decodeJwt(token);
	const user =
		payload?.user ||
		payload?.account ||
		payload?.profile ||
		(claims
			? {
					email: claims.email || claims.sub || email,
					userId: claims.userId || claims.id,
				}
			: { email });

	if (!token) {
		throw new Error("Đăng nhập thành công nhưng thiếu token từ server.");
	}

	setAuth({ token, user });

	return { token, user };
};

export const logout = () => {
	clearAuth();
};

export const getCurrentUser = () => getStoredUser();
