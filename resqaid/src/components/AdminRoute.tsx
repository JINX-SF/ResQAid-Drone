import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }: any) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "admin") {
    return <Navigate to="/" />; // 🚫 block non-admin
  }

  return children;
}