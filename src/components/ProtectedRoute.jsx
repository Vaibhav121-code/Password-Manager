import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = () => {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage label="Restoring your vault" />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
