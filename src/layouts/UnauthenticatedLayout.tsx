import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function UnauthenticatedLayout() {
  const user = useAuthStore((s) => s.user);
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
