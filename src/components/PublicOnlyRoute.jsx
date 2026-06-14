import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const PublicOnlyRoute = () => {
  const { loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullPage label="Loading PassOP" />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicOnlyRoute;
