import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
	fetchHabitsPaging,
	createHabit,
	updateHabit,
	deleteHabit,
} from "@/features/habits/api/habitApi";
import { logout } from "@/features/auth/api/authApi";
import Sidebar from "@/shared/components/Sidebar";

const emptyHabit = {
	name: "",
	description: "",
	type: "COUNT",
	frequency: "DAILY",
	frequencyDays: "",
	icon: "",
	colour: "",
};

const normalizeHabits = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.habits)) return payload.habits;
	if (Array.isArray(payload?.items)) return payload.items;
	return [];
};

const normalizePaging = (payload) => {
	if (!payload || typeof payload !== "object") {
		return {
			items: [],
			offset: 0,
			limit: 20,
			total: 0,
		};
	}

	return {
		items: Array.isArray(payload.items) ? payload.items : normalizeHabits(payload),
		offset: Number.isFinite(payload.offset) ? payload.offset : 0,
		limit: Number.isFinite(payload.limit) ? payload.limit : 20,
		total: Number.isFinite(payload.total) ? payload.total : 0,
	};
};

function HabitsPage() {
	const navigate = useNavigate();
	const [habits, setHabits] = useState([]);
	const [formState, setFormState] = useState(emptyHabit);
	const [editingId, setEditingId] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [pagination, setPagination] = useState({
		offset: 0,
		limit: 10,
		total: 0,
	});
	const [debugInfo, setDebugInfo] = useState({
		count: 0,
		payloadType: "unknown",
		apiBase:
			import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
			"https://giathinh.duckdns.org/api",
	});

	const isEditing = useMemo(() => editingId !== null, [editingId]);
	const pageIndex = useMemo(
		() => Math.floor(pagination.offset / pagination.limit) + 1,
		[pagination.offset, pagination.limit]
	);
	const totalPages = useMemo(() => {
		if (!pagination.total || !pagination.limit) return 1;
		return Math.max(1, Math.ceil(pagination.total / pagination.limit));
	}, [pagination.total, pagination.limit]);

	const loadHabits = useCallback(async () => {
		setError("");
		setNotice("");
		setIsLoading(true);

		try {
			const data = await fetchHabitsPaging({
				offset: pagination.offset,
				limit: pagination.limit,
			});
			const page = normalizePaging(data);
			setHabits(page.items);
			setPagination((prev) => ({
				...prev,
				offset: page.offset,
				limit: page.limit,
				total: page.total,
			}));
			setNotice(`Đã tải ${page.items.length} thói quen.`);
			setDebugInfo((prev) => ({
				...prev,
				count: page.items.length,
				payloadType: Array.isArray(data)
					? "array"
					: data && typeof data === "object"
						? "object"
						: typeof data,
			}));
		} catch (err) {
			setError(err?.message || "Không thể tải danh sách thói quen.");
		} finally {
			setIsLoading(false);
		}
	}, [pagination.offset, pagination.limit]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadHabits();
	}, [loadHabits]);

	const handlePageChange = (nextPage) => {
		const safePage = Math.min(Math.max(1, nextPage), totalPages);
		setPagination((prev) => ({
			...prev,
			offset: (safePage - 1) * prev.limit,
		}));
	};

	const handleSidebarToggle = () => {
		if (isSidebarOpen) {
			setIsSidebarOpen(false);
			return;
		}
		setIsSidebarCollapsed((prev) => !prev);
	};

	const handleLimitChange = (event) => {
		const nextLimit = Number(event.target.value);
		setPagination((prev) => ({
			...prev,
			limit: Number.isFinite(nextLimit) && nextLimit > 0 ? nextLimit : prev.limit,
			offset: 0,
		}));
	};

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
		setNotice("");
		setIsSaving(true);

		try {
			if (isEditing) {
				await updateHabit(editingId, formState);
				setNotice("Đã cập nhật thói quen.");
			} else {
				await createHabit(formState);
				setNotice("Đã tạo thói quen mới.");
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
		setNotice("");

		try {
			await deleteHabit(habitId);
			await loadHabits();
			setNotice("Đã xoá thói quen.");
		} catch (err) {
			setError(err?.message || "Không thể xoá thói quen.");
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	const handleNavigate = (path) => {
		if (!path) return;
		setIsSidebarOpen(false);
		navigate(path);
	};

	return (
		<div className="app-shell">
			<Sidebar
				activeKey="habits"
				isCollapsed={isSidebarCollapsed}
				isMobileOpen={isSidebarOpen}
				onToggle={handleSidebarToggle}
				onNavigate={handleNavigate}
				onLogout={handleLogout}
			/>
			{isSidebarOpen ? (
				<button
					className="sidebar-overlay"
					type="button"
					onClick={() => setIsSidebarOpen(false)}
					aria-label="Đóng sidebar"
				/>
			) : null}
			<main className="page habits-page main-content">
				<header className="page-header">
					<div className="page-title">
						<button
							className="ghost sidebar-mobile-trigger"
							type="button"
							onClick={() => setIsSidebarOpen(true)}
						>
							☰
						</button>
						<div>
							<p className="eyebrow">HabitOS</p>
							<h1>Manage Habits</h1>
							<p className="subtitle">
								Tạo mới, chỉnh sửa và theo dõi thói quen.
							</p>
						</div>
					</div>
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
					{notice ? <p className="form-success">{notice}</p> : null}

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

				<div className="list-meta">
					<div className="pagination-info">
						Trang {pageIndex} / {totalPages}
						{pagination.total ? ` · Tổng ${pagination.total}` : ""}
					</div>
					<div className="pagination-controls">
						<button
							className="ghost"
							type="button"
							onClick={() => handlePageChange(pageIndex - 1)}
							disabled={pageIndex <= 1 || isLoading}
						>
							Trang trước
						</button>
						<button
							className="ghost"
							type="button"
							onClick={() => handlePageChange(pageIndex + 1)}
							disabled={pageIndex >= totalPages || isLoading}
						>
							Trang sau
						</button>
						<label className="page-size">
							Hiển thị
							<select value={pagination.limit} onChange={handleLimitChange}>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
						</label>
					</div>
				</div>

				<p className="debug-info">
					API: {debugInfo.apiBase} · Payload: {debugInfo.payloadType} ·
					Số thói quen: {debugInfo.count}
				</p>

				{isLoading ? (
					<p className="status">Đang tải...</p>
				) : error ? (
					<p className="status error">{error}</p>
				) : habits.length ? (
					<ul className="habit-list">
						{habits.map((habit) => {
							const habitId = habit.id || habit._id;
							const isActive =
								habit.isActive === true || habit.isActive === "true";

							return (
								<li key={habitId} className="habit-item">
									<div className="habit-content">
										<div className="habit-header">
											<h3>{habit.name}</h3>
											<div className="habit-tags">
												<span className="habit-tag">
													{habit.type || "COUNT"}
												</span>
												<span className="habit-tag">
													{habit.frequency || "DAILY"}
												</span>
												<span
													className={`habit-tag ${
														isActive ? "active" : "inactive"
													}`}
												>
													{isActive ? "Đang hoạt động" : "Tạm dừng"}
												</span>
											</div>
										</div>
										{habit.description ? (
											<p className="note">{habit.description}</p>
										) : null}
										<div className="habit-details">
											<div>
												<span className="detail-label">Frequency days</span>
												<span>
													{habit.frequencyDays || "—"}
												</span>
											</div>
											<div>
												<span className="detail-label">Icon</span>
												<span>{habit.icon || "—"}</span>
											</div>
											<div>
												<span className="detail-label">Colour</span>
												<span>{habit.colour || "—"}</span>
											</div>
										</div>
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
		</div>
	);
}

export default HabitsPage;
