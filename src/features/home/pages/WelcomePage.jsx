import { useNavigate } from "react-router-dom";

import { getCurrentUser, logout } from "@/features/auth/api/authApi";

function WelcomePage() {
	const navigate = useNavigate();
	const user = getCurrentUser();

	const handleGoHabits = () => {
		navigate("/habits");
	};

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	return (
		<main className="page welcome-page">
			<section className="card welcome-card">
				<header>
					<p className="eyebrow">HabitOS</p>
					<h1>Chào mừng {user?.name || user?.email || "bạn"}!</h1>
					<p className="subtitle">
						Bắt đầu quản lý thói quen và theo dõi tiến độ mỗi ngày.
					</p>
				</header>

				<div className="welcome-actions">
					<button className="primary" type="button" onClick={handleGoHabits}>
						Quản lý thói quen
					</button>
					<button className="ghost" type="button" onClick={handleLogout}>
						Đăng xuất
					</button>
				</div>
			</section>

			<section className="card welcome-card secondary">
				<h2>Gợi ý hôm nay</h2>
				<ul className="welcome-list">
					<li>Tạo một thói quen nhỏ để bắt đầu.</li>
					<li>Đặt mục tiêu rõ ràng và dễ theo dõi.</li>
					<li>Chỉ cần 1% tốt hơn mỗi ngày.</li>
				</ul>
			</section>
		</main>
	);
}

export default WelcomePage;
