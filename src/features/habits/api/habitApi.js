import { request } from "@/shared/services/api";

const unwrap = (payload) => {
	if (payload?.success === false) {
		throw new Error(payload?.message || payload?.error || "Request failed");
	}

	return payload?.data ?? payload?.result ?? payload;
};

export const fetchHabits = async () => {
	const payload = await request("/habits");
	return unwrap(payload);
};

export const fetchHabitsPaging = async ({ offset = 0, limit = 20 } = {}) => {
	const params = new URLSearchParams({
		offset: String(offset),
		limit: String(limit),
	});
	const payload = await request(`/habits/paging?${params.toString()}`);
	return unwrap(payload);
};

export const createHabit = async (habit) => {
	const payload = await request("/habits", {
		method: "POST",
		body: JSON.stringify(habit),
	});
	return unwrap(payload);
};

export const updateHabit = async (id, habit) => {
	const payload = await request(`/habits/${id}`, {
		method: "PATCH",
		body: JSON.stringify(habit),
	});
	return unwrap(payload);
};

export const deleteHabit = async (id) => {
	const payload = await request(`/habits/${id}`, {
		method: "DELETE",
	});
	return unwrap(payload);
};
