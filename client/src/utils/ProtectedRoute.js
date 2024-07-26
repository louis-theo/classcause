import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = sessionStorage.getItem("authToken");
  const role = sessionStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  } else if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/not-found" replace />;
  } else {
    return <Outlet />;
  }
};

export default ProtectedRoute;
