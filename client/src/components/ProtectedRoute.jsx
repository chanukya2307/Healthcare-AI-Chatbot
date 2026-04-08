import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    allowedRoles?.length &&
    (!user?.role || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
