import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import UserDashboard from './pages/user/UserDashboard';
import MakeTransaction from './pages/user/MakeTransaction';
import MyTransactions from './pages/user/MyTransactions';
import UserAlerts from './pages/user/UserAlerts';
import UserProfile from './pages/user/UserProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import DetectionMonitoring from './pages/admin/DetectionMonitoring';
import SystemConfiguration from './pages/admin/SystemConfiguration';
import AlgorithmManagement from './pages/admin/AlgorithmManagement';
import AdminProfile from './pages/admin/AdminProfile';

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/user" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ==================== PUBLIC ==================== */}

          {/* Landing Page */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* User Login */}
          <Route
            path="/user/login"
            element={<Login role="USER" />}
          />

          {/* Admin Login */}
          <Route
            path="/admin/login"
            element={<Login role="ADMIN" />}
          />

          {/* Forgot Password */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* Reset Password */}
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* User Registration */}
          <Route
            path="/user/register"
            element={<Register role="USER" />}
          />

          {/* Admin Registration */}
          <Route
            path="/admin/register"
            element={<Register role="ADMIN" />}
          />

          {/* ==================== USER ==================== */}

          {/* User Dashboard */}
          <Route
            path="/user"
            element={
              <RoleProtectedRoute allowedRole="USER">
                <Layout>
                  <UserDashboard />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Make Transaction */}
          <Route
            path="/user/transactions/new"
            element={
              <RoleProtectedRoute allowedRole="USER">
                <Layout>
                  <MakeTransaction />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Old Make Transaction Route */}
          <Route
            path="/user/make-transaction"
            element={
              <Navigate
                to="/user/transactions/new"
                replace
              />
            }
          />

          {/* My Transactions */}
          <Route
            path="/user/transactions"
            element={
              <RoleProtectedRoute allowedRole="USER">
                <Layout>
                  <MyTransactions />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* User Alerts */}
          <Route
            path="/user/alerts"
            element={
              <RoleProtectedRoute allowedRole="USER">
                <Layout>
                  <UserAlerts />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/user/profile"
            element={
              <RoleProtectedRoute allowedRole="USER">
                <Layout>
                  <UserProfile />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* ==================== ADMIN ==================== */}

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRole="ADMIN">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Detection Monitoring */}
          <Route
            path="/admin/detection"
            element={
              <RoleProtectedRoute allowedRole="ADMIN">
                <Layout>
                  <DetectionMonitoring />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* System Configuration */}
          <Route
            path="/admin/configuration"
            element={
              <RoleProtectedRoute allowedRole="ADMIN">
                <Layout>
                  <SystemConfiguration />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Algorithm Management */}
          <Route
            path="/admin/algorithm"
            element={
              <RoleProtectedRoute allowedRole="ADMIN">
                <Layout>
                  <AlgorithmManagement />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Admin Profile */}
          <Route
            path="/admin/profile"
            element={
              <RoleProtectedRoute allowedRole="ADMIN">
                <Layout>
                  <AdminProfile />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* ==================== OLD / SHORT ROUTES ==================== */}

          {/* /login → User Login */}
          <Route
            path="/login"
            element={
              <Navigate
                to="/user/login"
                replace
              />
            }
          />

          {/* /register → User Registration */}
          <Route
            path="/register"
            element={
              <Navigate
                to="/user/register"
                replace
              />
            }
          />

          {/* ==================== FALLBACK ==================== */}

          <Route
            path="*"
            element={<RootRedirect />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}