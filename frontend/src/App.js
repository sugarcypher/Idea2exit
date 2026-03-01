import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import DocumentHub from "./pages/DocumentHub";
import LandingPageBuilder from "./pages/LandingPageBuilder";
import Analysis from "./pages/Analysis";
import Simulation from "./pages/Simulation";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Public Route wrapper (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/projects/:id/documents" element={<ProtectedRoute><DocumentHub /></ProtectedRoute>} />
      <Route path="/projects/:id/documents/:docId" element={<ProtectedRoute><DocumentHub /></ProtectedRoute>} />
      <Route path="/projects/:id/landing-page" element={<ProtectedRoute><LandingPageBuilder /></ProtectedRoute>} />
      <Route path="/projects/:id/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
      
      {/* Redirect root to login or dashboard */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors theme="dark" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
