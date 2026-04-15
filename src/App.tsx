import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import StudentDashboard from "@/pages/dashboard/StudentDashboard";
import StudentInternships from "@/pages/dashboard/StudentInternships";
import StudentApplications from "@/pages/dashboard/StudentApplications";
import StudentProfile from "@/pages/dashboard/StudentProfile";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import AdminInternships from "@/pages/dashboard/AdminInternships";
import AdminApplications from "@/pages/dashboard/AdminApplications";
import AdminUsers from "@/pages/dashboard/AdminUsers";
import FacultyDashboard from "@/pages/dashboard/FacultyDashboard";
import FacultyApplications from "@/pages/dashboard/FacultyApplications";
import FacultyInternships from "@/pages/dashboard/FacultyInternships";
import RecruiterDashboard from "@/pages/dashboard/RecruiterDashboard";
import RecruiterPost from "@/pages/dashboard/RecruiterPost";
import RecruiterInternships from "@/pages/dashboard/RecruiterInternships";
import RecruiterApplicants from "@/pages/dashboard/RecruiterApplicants";
import RecruiterInterviewsPage from "@/pages/dashboard/RecruiterInterviews";

const queryClient = new QueryClient();

const HomeRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user && role) return <Navigate to={`/dashboard/${role}`} replace />;
  return <Landing />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student */}
            <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/student/internships" element={<ProtectedRoute allowedRoles={["student"]}><StudentInternships /></ProtectedRoute>} />
            <Route path="/dashboard/student/applications" element={<ProtectedRoute allowedRoles={["student"]}><StudentApplications /></ProtectedRoute>} />
            <Route path="/dashboard/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin/internships" element={<ProtectedRoute allowedRoles={["admin"]}><AdminInternships /></ProtectedRoute>} />
            <Route path="/dashboard/admin/applications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminApplications /></ProtectedRoute>} />
            <Route path="/dashboard/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />

            {/* Faculty */}
            <Route path="/dashboard/faculty" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/faculty/applications" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyApplications /></ProtectedRoute>} />
            <Route path="/dashboard/faculty/internships" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyInternships /></ProtectedRoute>} />

            {/* Recruiter */}
            <Route path="/dashboard/recruiter" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/recruiter/post" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterPost /></ProtectedRoute>} />
            <Route path="/dashboard/recruiter/internships" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterInternships /></ProtectedRoute>} />
            <Route path="/dashboard/recruiter/applicants" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterApplicants /></ProtectedRoute>} />
            <Route path="/dashboard/recruiter/interviews" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterInterviewsPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
