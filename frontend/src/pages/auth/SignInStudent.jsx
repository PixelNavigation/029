import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { authAPI } from '../../lib/api';

export default function SignInStudent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!email || !password) throw new Error('Please enter both email and password');
      
      // Call backend API
      const response = await authAPI.signinStudent(email, password);
      
      if (response.success && response.user) {
        // Backend now returns secure fields plus user.profile (public profile)
        const { setUser } = useAuthStore.getState();
        const { profile, ...rest } = response.user;

        // Flatten profile onto the user object so existing dashboard code
        // can keep using user.name, user.studentId, etc.
        setUser({
          ...rest,
          ...(profile || {})
        });
        // Navigation handled by useEffect
      }
    } catch (err) {
      console.error('Signin error:', err);
      // Handle different error types
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.error || 'Sign in failed';
        setError(errorMessage);
      } else if (err.request) {
        // Request made but no response
        setError('Unable to connect to server. Please ensure the backend is running.');
      } else {
        // Other errors
        setError(err.message || 'Sign in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header with back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link 
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Student Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your academic verification portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="student-email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input 
                  id="student-email" 
                  name="email" 
                  type="email" 
                  autoComplete="email"
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your student email" 
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="student-password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input 
                  id="student-password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password"
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password" 
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            
            <div className="text-center">
              <Link
                to="/auth/signup-student"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
