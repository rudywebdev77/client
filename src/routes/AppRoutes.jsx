import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout';
import { StaffLayout } from '../layouts/StaffLayout';
import { ClientLayout } from '../layouts/ClientLayout';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';


// Dashboards
import { AdminDashboard } from '../pages/admin/Dashboard';
import { StaffDashboard } from '../pages/staff/Dashboard';
import { ClientDashboard } from '../pages/client/Dashboard';

// Admin — Users
import { UserList } from '../pages/admin/users/UserList';
import { CreateUser } from '../pages/admin/users/CreateUser';
import { EditUser } from '../pages/admin/users/EditUser';
import { UserDetail } from '../pages/admin/users/UserDetail';

// Admin — Requests
import { AllRequests } from '../pages/admin/requests/AllRequests';
import { ReviewRequest } from '../pages/admin/requests/ReviewRequest';

// Admin — Projects
import { AllProjects } from '../pages/admin/projects/AllProjects';
import { CreateProject } from '../pages/admin/projects/CreateProject';
import { ProjectDetail } from '../pages/admin/projects/ProjectDetail';
import { EditProject } from '../pages/admin/projects/EditProject';

// Admin — Reports & Settings
import { Reports } from '../pages/admin/Reports';
import { FileManager } from '../pages/admin/FileManager';
import { Settings as AdminSettings } from '../pages/admin/Settings';

// Staff — Projects & Settings
import { MyProjects as StaffMyProjects } from '../pages/staff/projects/MyProjects';
import { ProjectWork } from '../pages/staff/projects/ProjectWork';
import { Settings as StaffSettings } from '../pages/staff/Settings';


// Client — Requests
import { SubmitRequest } from '../pages/client/requests/SubmitRequest';
import { MyRequests } from '../pages/client/requests/MyRequests';
import { RequestDetail } from '../pages/client/requests/RequestDetail';

// Client — Projects
import { MyProjects as ClientMyProjects } from '../pages/client/projects/MyProjects';
import { ProjectView } from '../pages/client/projects/ProjectView';

// Client — Activity & Settings
import { Activity } from '../pages/client/Activity';
import { Settings as ClientSettings } from '../pages/client/Settings';

// Shared
import { Profile } from '../pages/shared/Profile';
import { Notifications } from '../pages/shared/Notifications';

// Redirect helper
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':  return <Navigate to="/admin" replace />;
    case 'staff':  return <Navigate to="/staff" replace />;
    case 'client': return <Navigate to="/client" replace />;
    default:       return <Navigate to="/login" replace />;
  }
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />


      {/* Role-based home redirect */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* ── Admin routes ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* Users */}
        <Route path="users" element={<UserList />} />
        <Route path="users/new" element={<CreateUser />} />
        <Route path="users/edit/:id" element={<EditUser />} />
        <Route path="users/:id" element={<UserDetail />} />

        {/* Requests */}
        <Route path="requests" element={<AllRequests />} />
        <Route path="requests/:id" element={<ReviewRequest />} />

        {/* Projects */}
        <Route path="projects" element={<AllProjects />} />
        <Route path="projects/new" element={<CreateProject />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/edit/:id" element={<EditProject />} />

        {/* Files, Reports, Profile, Notifications, Activity, Settings */}
        <Route path="files" element={<FileManager />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ── Staff routes ── */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="projects" element={<StaffMyProjects />} />
        <Route path="projects/:id" element={<ProjectWork />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<StaffSettings />} />
      </Route>

      {/* ── Client routes ── */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="requests/new" element={<SubmitRequest />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="projects" element={<ClientMyProjects />} />
        <Route path="projects/:id" element={<ProjectView />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
