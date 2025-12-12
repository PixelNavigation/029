import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth';
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/auth/SignIn';
import { UniversitySignUp } from './pages/auth/UniversitySignUp';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentApplicationPortal } from './pages/student/StudentApplicationPortal';
import { UniversityDashboard } from './pages/institution/UniversityDashboard';
import { CentralAuthorityDashboard } from './pages/admin/CentralAuthorityDashboard';
import VerificationPage from './pages/VerificationPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/university-signup" element={<UniversitySignUp />} />
            <Route path="/verify" element={<VerificationPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/applications" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentApplicationPortal />
                </ProtectedRoute>
              } 
            />
            
            {/* University/Institution Routes */}
            <Route 
              path="/institution" 
              element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <UniversityDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/verifier" 
              element={
                <ProtectedRoute allowedRoles={['verifier']}>
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900">Verifier Portal</h1>
                      <p className="text-gray-600 mt-2">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CentralAuthorityDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App
