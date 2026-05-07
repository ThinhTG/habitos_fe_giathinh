import { request } from "@/shared/services/api";

export const fetchHabits = () => request("/habits");

export const createHabit = (habit) =>
	request("/habits", {
		method: "POST",
		body: JSON.stringify(habit),
	});

export const updateHabit = (id, habit) =>
	request(`/habits/${id}`,
		{
			method: "PATCH",
			body: JSON.stringify(habit),
		}
	);

export const deleteHabit = (id) =>
	request(`/habits/${id}`,
		{
			method: "DELETE",
		}
	);
