import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';


// Student
import StudentDashboard from './pages/student/Dashboard';
import CreateProject from './pages/student/CreateProject';
import MyProjects from './pages/student/MyProjects';
import ProjectDetail from './pages/student/ProjectDetail';
import StudentMessages from './pages/student/Messages';
import StudentPayments from './pages/student/Payments';
import StudentProfile from './pages/student/Profile';

// Developer
import DevDashboard from './pages/developer/Dashboard';
import BrowseProjects from './pages/developer/BrowseProjects';
import MyBids from './pages/developer/MyBids';
import AssignedProjects from './pages/developer/AssignedProjects';
import SubmitWork from './pages/developer/SubmitWork';
import Earnings from './pages/developer/Earnings';
import DevMessages from './pages/developer/Messages';
import DevProfile from './pages/developer/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProjects from './pages/admin/Projects';
import AdminPayments from './pages/admin/Payments';
import AdminReviews from './pages/admin/Reviews';
import AdminNotifications from './pages/admin/Notifications';

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
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
