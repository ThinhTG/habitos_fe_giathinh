import { Navigate, useLocation } from "react-router-dom";

import { getToken } from "@/shared/services/api";

function ProtectedRoute({ children }) {
	const location = useLocation();
	const token = getToken();

	if (!token) {
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	return children;
}

export default ProtectedRoute;
