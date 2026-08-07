import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { PageSkeleton } from '../components/common/SkeletonLoaders';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout';
import { StaffLayout } from '../layouts/StaffLayout';
import { ClientLayout } from '../layouts/ClientLayout';

// Auth Pages (Lazy)
const Login = lazy(() => import('../pages/auth/Login').then(m => ({ default: m.Login })));
const SignUp = lazy(() => import('../pages/auth/SignUp').then(m => ({ default: m.SignUp })));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail').then(m => ({ default: m.VerifyEmail })));

// Dashboards (Lazy)
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const StaffDashboard = lazy(() => import('../pages/staff/Dashboard').then(m => ({ default: m.StaffDashboard })));
const ClientDashboard = lazy(() => import('../pages/client/Dashboard').then(m => ({ default: m.ClientDashboard })));

// Admin — Users (Lazy)
const UserList = lazy(() => import('../pages/admin/users/UserList').then(m => ({ default: m.UserList })));
const CreateUser = lazy(() => import('../pages/admin/users/CreateUser').then(m => ({ default: m.CreateUser })));
const EditUser = lazy(() => import('../pages/admin/users/EditUser').then(m => ({ default: m.EditUser })));
const UserDetail = lazy(() => import('../pages/admin/users/UserDetail').then(m => ({ default: m.UserDetail })));

// Admin — Requests (Lazy)
const AllRequests = lazy(() => import('../pages/admin/requests/AllRequests').then(m => ({ default: m.AllRequests })));
const ReviewRequest = lazy(() => import('../pages/admin/requests/ReviewRequest').then(m => ({ default: m.ReviewRequest })));

// Admin — Projects (Lazy)
const AllProjects = lazy(() => import('../pages/admin/projects/AllProjects').then(m => ({ default: m.AllProjects })));
const CreateProject = lazy(() => import('../pages/admin/projects/CreateProject').then(m => ({ default: m.CreateProject })));
const ProjectDetail = lazy(() => import('../pages/admin/projects/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const EditProject = lazy(() => import('../pages/admin/projects/EditProject').then(m => ({ default: m.EditProject })));

// Admin — Reports & Settings (Lazy)
const Reports = lazy(() => import('../pages/admin/Reports').then(m => ({ default: m.Reports })));
const FileManager = lazy(() => import('../pages/admin/FileManager').then(m => ({ default: m.FileManager })));
const AdminSettings = lazy(() => import('../pages/admin/Settings').then(m => ({ default: m.Settings })));

// Staff — Projects & Settings (Lazy)
const StaffMyProjects = lazy(() => import('../pages/staff/projects/MyProjects').then(m => ({ default: m.MyProjects })));
const ProjectWork = lazy(() => import('../pages/staff/projects/ProjectWork').then(m => ({ default: m.ProjectWork })));
const StaffSettings = lazy(() => import('../pages/staff/Settings').then(m => ({ default: m.Settings })));

// Client — Requests (Lazy)
const SubmitRequest = lazy(() => import('../pages/client/requests/SubmitRequest').then(m => ({ default: m.SubmitRequest })));
const MyRequests = lazy(() => import('../pages/client/requests/MyRequests').then(m => ({ default: m.MyRequests })));
const RequestDetail = lazy(() => import('../pages/client/requests/RequestDetail').then(m => ({ default: m.RequestDetail })));

// Client — Projects (Lazy)
const ClientMyProjects = lazy(() => import('../pages/client/projects/MyProjects').then(m => ({ default: m.MyProjects })));
const ProjectView = lazy(() => import('../pages/client/projects/ProjectView').then(m => ({ default: m.ProjectView })));

// Client — Activity & Settings (Lazy)
const Activity = lazy(() => import('../pages/client/Activity').then(m => ({ default: m.Activity })));
const ClientSettings = lazy(() => import('../pages/client/Settings').then(m => ({ default: m.Settings })));

// Shared (Lazy)
const Profile = lazy(() => import('../pages/shared/Profile').then(m => ({ default: m.Profile })));
const Notifications = lazy(() => import('../pages/shared/Notifications').then(m => ({ default: m.Notifications })));

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
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />

        {/* Role-based home & dashboard redirects */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

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
    </Suspense>
  );
};
