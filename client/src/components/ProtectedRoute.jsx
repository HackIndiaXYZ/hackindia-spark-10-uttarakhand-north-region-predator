import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  
  // 1. If no token exists, kick them to the login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    // 2. Decode the JWT payload natively to check the role safely
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // 3. If their role is not allowed on this route, redirect them to their actual dashboard
    if (!allowedRoles.includes(payload.role)) {
      if (payload.role === 'ADMIN') return <Navigate to="/admin" replace />;
      if (payload.role === 'DRIVER') return <Navigate to="/driver" replace />;
      return <Navigate to="/customer" replace />;
    }
    
    // 4. If they pass all checks, render the requested dashboard
    return children;
  } catch (error) {
    // If the token is manually tampered with or invalid, destroy it and force login
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
}
