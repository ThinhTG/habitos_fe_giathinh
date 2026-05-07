import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
	fetchHabits,
	createHabit,
	updateHabit,
	deleteHabit,
} from "@/features/habits/api/habitApi";
import { logout } from "@/features/auth/api/authApi";

const emptyHabit = {
	name: "",
	description: "",
	type: "COUNT",
	frequency: "DAILY",
	frequencyDays: "",
	icon: "",
	colour: "",
};

function HabitsPage() {
	const navigate = useNavigate();
	const [habits, setHabits] = useState([]);
	const [formState, setFormState] = useState(emptyHabit);
	const [editingId, setEditingId] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const isEditing = useMemo(() => editingId !== null, [editingId]);

	const loadHabits = async () => {
		setError("");
		setIsLoading(true);

		try {
			const data = await fetchHabits();
			setHabits(Array.isArray(data) ? data : data?.habits || []);
		} catch (err) {
			setError(err?.message || "Không thể tải danh sách thói quen.");
		} finally {
			setIsLoading(false);
		}
	};

		useEffect(() => {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			loadHabits();
		}, []);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleEdit = (habit) => {
		setEditingId(habit.id || habit._id);
		setFormState({
			name: habit.name || "",
			description: habit.description || "",
			type: habit.type || "COUNT",
			frequency: habit.frequency || "DAILY",
			frequencyDays: habit.frequencyDays || "",
			icon: habit.icon || "",
			colour: habit.colour || "",
		});
	};

	const resetForm = () => {
		setEditingId(null);
		setFormState(emptyHabit);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setIsSaving(true);

		try {
			if (isEditing) {
				await updateHabit(editingId, formState);
			} else {
				await createHabit(formState);
			}

			await loadHabits();
			resetForm();
		} catch (err) {
			setError(err?.message || "Không thể lưu thói quen.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (habit) => {
		const habitId = habit.id || habit._id;
		if (!habitId) return;

			const shouldDelete = window.confirm(
				`Xoá thói quen "${habit.name}"?`
			);
		if (!shouldDelete) return;

		setError("");

		try {
			await deleteHabit(habitId);
			await loadHabits();
		} catch (err) {
			setError(err?.message || "Không thể xoá thói quen.");
		}
	};

	const handleLogout = () => {
		logout();
			navigate("/");
	};

	return (
		<main className="page habits-page">
			<header className="page-header">
				<div>
					<p className="eyebrow">HabitOS</p>
					<h1>Manage Habits</h1>
					<p className="subtitle">Tạo mới, chỉnh sửa và theo dõi thói quen.</p>
				</div>
				<button className="ghost" type="button" onClick={handleLogout}>
					Đăng xuất
				</button>
			</header>

			<section className="card form-card">
				<h2>{isEditing ? "Cập nhật thói quen" : "Thêm thói quen mới"}</h2>
				<form className="form" onSubmit={handleSubmit}>
					<div className="grid">
						<label className="field">
							Tên thói quen
							<input
								type="text"
								name="name"
								value={formState.name}
								onChange={handleChange}
								placeholder="Ví dụ: Uống nước"
								required
							/>
						</label>

						<label className="field">
							Loại thói quen
							<select
								name="type"
								value={formState.type}
								onChange={handleChange}
							>
								<option value="COUNT">Đếm số lần</option>
								<option value="TIMER">Theo thời gian</option>
							</select>
						</label>

						<label className="field">
							Tần suất
							<select
								name="frequency"
								value={formState.frequency}
								onChange={handleChange}
							>
								<option value="DAILY">Hàng ngày</option>
								<option value="WEEKLY">Hàng tuần</option>
								<option value="MONTHLY">Hàng tháng</option>
							</select>
						</label>

						<label className="field">
							Ngày lặp (frequencyDays)
							<input
								type="text"
								name="frequencyDays"
								value={formState.frequencyDays}
								onChange={handleChange}
								placeholder="Ví dụ: Mon,Wed,Fri"
							/>
							<span className="helper">
								Nếu cần, nhập danh sách ngày trong tuần.
							</span>
						</label>

						<label className="field">
							Icon
							<input
								type="text"
								name="icon"
								value={formState.icon}
								onChange={handleChange}
								placeholder="Ví dụ: abcabc"
							/>
						</label>

						<label className="field">
							Màu sắc
							<input
								type="text"
								name="colour"
								value={formState.colour}
								onChange={handleChange}
								placeholder="Ví dụ: red"
							/>
						</label>
					</div>

					<label className="field">
						Mô tả
						<textarea
							name="description"
							rows="3"
							value={formState.description}
							onChange={handleChange}
							placeholder="Ví dụ: Habits"
						/>
					</label>

					{error ? <p className="form-error">{error}</p> : null}

					<div className="actions">
						<button className="primary" type="submit" disabled={isSaving}>
							{isSaving
								? "Đang lưu..."
								: isEditing
									? "Cập nhật"
									: "Thêm thói quen"}
						</button>
						{isEditing ? (
							<button className="ghost" type="button" onClick={resetForm}>
								Huỷ chỉnh sửa
							</button>
						) : null}
					</div>
				</form>
			</section>

			<section className="card list-card">
				<div className="list-header">
					<h2>Danh sách thói quen</h2>
					<button className="ghost" type="button" onClick={loadHabits}>
						Làm mới
					</button>
				</div>

				{isLoading ? (
					<p className="status">Đang tải...</p>
				) : habits.length ? (
					<ul className="habit-list">
						{habits.map((habit) => {
							const habitId = habit.id || habit._id;

							return (
								<li key={habitId} className="habit-item">
									<div>
										<h3>{habit.name}</h3>
										<p>
											{habit.type || "COUNT"} · {habit.frequency || "DAILY"}
										</p>
										{habit.description ? (
											<p className="note">{habit.description}</p>
										) : null}
									</div>
									<div className="item-actions">
										<button
											className="ghost"
											type="button"
											onClick={() => handleEdit(habit)}
										>
											Chỉnh sửa
										</button>
										<button
											className="danger"
											type="button"
											onClick={() => handleDelete(habit)}
										>
											Xoá
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="status">Bạn chưa có thói quen nào.</p>
				)}
			</section>
		</main>
	);
}

export default HabitsPage;
