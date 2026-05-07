import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "@/features/auth/api/authApi";
import { getToken } from "@/shared/services/api";

function LoginPage() {
	const navigate = useNavigate();
	const [formState, setFormState] = useState({ email: "", password: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (getToken()) {
			navigate("/welcome", { replace: true });
		}
	}, [navigate]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			await login({
				email: formState.email.trim(),
				password: formState.password,
			});
			navigate("/welcome");
		} catch (err) {
			const status = err?.status;
			if ([401, 403, 500].includes(status)) {
				setError("Sai tài khoản hoặc mật khẩu.");
			} else {
				setError(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="page auth-page">
			<section className="auth-card">
				<header>
					<p className="eyebrow">HabitOS</p>
					<h1>Đăng nhập</h1>
					<p className="subtitle">Quản lý thói quen mỗi ngày thật dễ dàng.</p>
				</header>

				<form className="form" onSubmit={handleSubmit}>
					<label className="field">
						Email
						<input
							type="email"
							name="email"
							value={formState.email}
							onChange={handleChange}
							placeholder="you@email.com"
							required
							autoComplete="email"
						/>
					</label>

					<label className="field">
						Mật khẩu
						<input
							type="password"
							name="password"
							value={formState.password}
							onChange={handleChange}
							placeholder="Nhập mật khẩu"
							required
							autoComplete="current-password"
						/>
					</label>

					{error ? <p className="form-error">{error}</p> : null}

					<button className="primary" type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
					</button>
				</form>
			</section>

			<section className="auth-aside">
				<div>
					<h2>Tập trung vào điều quan trọng</h2>
					<p>
						Theo dõi thói quen, đặt mục tiêu và nhìn thấy tiến độ của bạn mỗi
						ngày.
					</p>
					<ul>
						<li>Tạo thói quen mới trong vài giây.</li>
						<li>Cập nhật mục tiêu và tần suất linh hoạt.</li>
						<li>Quản lý mọi thứ ở một nơi.</li>
					</ul>
				</div>
			</section>
		</main>
	);
}

export default LoginPage;
