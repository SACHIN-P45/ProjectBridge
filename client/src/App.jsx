import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SplashScreen from './components/SplashScreen';
import PageLoader from './components/PageLoader';

// Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const DeveloperSetPassword = lazy(() => import('./pages/auth/DeveloperSetPassword'));
const OAuthCallback = lazy(() => import('./pages/auth/OAuthCallback'));


// Student
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const CreateProject = lazy(() => import('./pages/student/CreateProject'));
const MyProjects = lazy(() => import('./pages/student/MyProjects'));
const ProjectDetail = lazy(() => import('./pages/student/ProjectDetail'));
const StudentMessages = lazy(() => import('./pages/student/Messages'));
const StudentPayments = lazy(() => import('./pages/student/Payments'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

// Developer
const DevDashboard = lazy(() => import('./pages/developer/Dashboard'));
const BrowseProjects = lazy(() => import('./pages/developer/BrowseProjects'));
const DevProjectDetail = lazy(() => import('./pages/developer/ProjectDetail'));
const MyBids = lazy(() => import('./pages/developer/MyBids'));
const AssignedProjects = lazy(() => import('./pages/developer/AssignedProjects'));
const SubmitWork = lazy(() => import('./pages/developer/SubmitWork'));
const Earnings = lazy(() => import('./pages/developer/Earnings'));
const DevMessages = lazy(() => import('./pages/developer/Messages'));
const DevProfile = lazy(() => import('./pages/developer/Profile'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminProjects = lazy(() => import('./pages/admin/Projects'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));

// Guards
const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/developer/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/developer/set-password" element={<DeveloperSetPassword />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            {/* Student */}
            <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/create-project" element={<ProtectedRoute role="student"><CreateProject /></ProtectedRoute>} />
            <Route path="/student/projects" element={<ProtectedRoute role="student"><MyProjects /></ProtectedRoute>} />
            <Route path="/student/projects/:id" element={<ProtectedRoute role="student"><ProjectDetail /></ProtectedRoute>} />
            <Route path="/student/messages" element={<ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>} />
            <Route path="/student/payments" element={<ProtectedRoute role="student"><StudentPayments /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

            {/* Developer */}
            <Route path="/developer/dashboard" element={<ProtectedRoute role="developer"><DevDashboard /></ProtectedRoute>} />
            <Route path="/developer/browse" element={<ProtectedRoute role="developer"><BrowseProjects /></ProtectedRoute>} />
            <Route path="/developer/projects/:id" element={<ProtectedRoute role="developer"><DevProjectDetail /></ProtectedRoute>} />
            <Route path="/developer/bids" element={<ProtectedRoute role="developer"><MyBids /></ProtectedRoute>} />
            <Route path="/developer/assigned" element={<ProtectedRoute role="developer"><AssignedProjects /></ProtectedRoute>} />
            <Route path="/developer/submit/:projectId" element={<ProtectedRoute role="developer"><SubmitWork /></ProtectedRoute>} />
            <Route path="/developer/earnings" element={<ProtectedRoute role="developer"><Earnings /></ProtectedRoute>} />
            <Route path="/developer/messages" element={<ProtectedRoute role="developer"><DevMessages /></ProtectedRoute>} />
            <Route path="/developer/profile" element={<ProtectedRoute role="developer"><DevProfile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute role="admin"><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute role="admin"><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}
