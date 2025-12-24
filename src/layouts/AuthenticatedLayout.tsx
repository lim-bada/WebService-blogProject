import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function AuthenticatedLayout() {
  const user = useAuthStore((s) => s.user);
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}
