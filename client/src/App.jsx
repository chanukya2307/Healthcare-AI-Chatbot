import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyAppointmentsPage from "./pages/MyAppointmentsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SuperAdminPage from "./pages/SuperAdminPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={["superAdmin"]}>
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
