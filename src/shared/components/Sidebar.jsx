import { useMemo } from "react";
import { getStoredUser } from "@/shared/services/api";

const navItems = [
	{ key: "dashboard", label: "Dashboard", icon: "🏠", path: "/welcome" },
	{ key: "habits", label: "Manage Habits", icon: "✅", path: "/habits" },
	{ key: "stats", label: "Statistics", icon: "📊" },
	{ key: "achievements", label: "Achievements", icon: "🏆" },
	{ key: "settings", label: "Settings", icon: "⚙️" },
];

function Sidebar({
	activeKey,
	isCollapsed,
	isMobileOpen,
	onToggle,
	onNavigate,
	onLogout,
}) {
	const storedUser = getStoredUser();
	const displayName = useMemo(() => {
		const name = storedUser?.name || storedUser?.fullName || storedUser?.email;
		return name || "Habit User";
	}, [storedUser]);

	return (
		<aside
			className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
				isMobileOpen ? "mobile-open" : ""
			}`}
		>
			<div className="sidebar-header">
				<div className="sidebar-brand">
					<span className="brand-icon" aria-hidden="true">
						✅
					</span>
					{isCollapsed ? null : (
						<span className="brand-name">HABITOS</span>
					)}
				</div>
				<button
					className="sidebar-toggle"
					type="button"
					onClick={onToggle}
					aria-label={isCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
				>
					{isCollapsed ? "→" : "←"}
				</button>
			</div>

			<nav className="sidebar-nav">
				{navItems.map((item) => {
					const isActive = item.key === activeKey;
					const isClickable = Boolean(item.path);

					return (
						<button
							key={item.key}
							type="button"
							className={`sidebar-item ${isActive ? "active" : ""}`}
							data-collapsed={isCollapsed}
							title={isCollapsed ? item.label : undefined}
							onClick={() =>
								isClickable ? onNavigate(item.path) : null
							}
							disabled={!isClickable}
						>
							<span className="sidebar-icon" aria-hidden="true">
								{item.icon}
							</span>
							{isCollapsed ? null : (
								<span className="sidebar-label">{item.label}</span>
							)}
						</button>
					);
				})}
			</nav>

			<div className="sidebar-footer">
				<div className="user-info">
					<span className="avatar" aria-hidden="true">
						👤
					</span>
					{isCollapsed ? null : (
						<span className="user-name">{displayName}</span>
					)}
				</div>
				<button className="danger logout-button" type="button" onClick={onLogout}>
					Đăng xuất
				</button>
			</div>
		</aside>
	);
}

export default Sidebar;
