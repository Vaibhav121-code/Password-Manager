import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SecurityDashboard from "./pages/SecurityDashboard";
import VaultPage from "./pages/VaultPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<VaultPage />} />
            <Route path="/security" element={<SecurityDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
