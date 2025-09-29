import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export const SignIn = () => {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the role from navigation state
  const selectedRole = location.state?.role;
  const successMessage = location.state?.message;

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'institution':
          navigate('/institution');
          break;
        case 'verifier':
          navigate('/verifier');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For Central Authority, use direct email/password login
      if (selectedRole === 'admin') {
        // Simulate successful login for Central Authority
        if (email && password) {
          const mockUser = {
            id: 'admin-1',
            email: email,
            role: 'admin',
            name: 'Central Administrator',
            verified: true,
            createdAt: new Date().toISOString()
          };
          
          // Use the setUser method to directly log in
          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
          
          // Navigation will be handled by useEffect
        } else {
          throw new Error('Please enter both email and password');
        }
      } else if (selectedRole === 'student') {
        // For Student, use direct email/password login similar to Central Authority
        if (email && password) {
          const mockUser = {
            id: 'student-1',
            email: email,
            role: 'student',
            name: 'John Doe',
            studentId: '1608-22-733-130',
            course: 'B.Tech Computer Science',
            year: '4th Year',
            university: 'Osmania University',
            profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            verified: true,
            createdAt: new Date().toISOString(),
            socialLinks: {
              linkedin: 'https://linkedin.com/in/johndoe',
              github: 'https://github.com/johndoe',
              portfolio: 'https://johndoe.dev'
            }
          };
          
          // Use the setUser method to directly log in
          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
          
          // Navigation will be handled by useEffect
        } else {
          throw new Error('Please enter both email and password');
        }
      } else if (selectedRole === 'institution') {
        // For University, use email and digital signature
        if (email && digitalSignature) {
          const mockUser = {
            id: 'univ-1',
            email: email,
            role: 'institution',
            name: 'University Administrator',
            institutionName: email.split('@')[1]?.split('.')[0] || 'University',
            verified: true,
            createdAt: new Date().toISOString()
          };
          
          // Use the setUser method to directly log in
          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
          
          // Navigation will be handled by useEffect
        } else {
          throw new Error('Please enter both email and digital signature');
        }
      } else {
        // For other roles, use OTP flow
        const result = await signIn(email);
        if (result.otpSent) {
          setStep('otp');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, otp);
      // Navigation is handled by useEffect above
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep('email');
    setOtp('');
    setError('');
  };

  const getRoleTitle = (role) => {
    switch (role) {
      case 'admin': return 'Central Authority';
      case 'student': return 'Student';
      case 'institution': return 'University';
      default: return 'User';
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
          {selectedRole ? `${getRoleTitle(selectedRole)} Sign In` : 'Sign In to ACVS'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {selectedRole ? `Access your ${getRoleTitle(selectedRole).toLowerCase()} portal` : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Registration Successful!
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {step === 'email' ? (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Show password field for Central Authority and Student */}
              {(selectedRole === 'admin' || selectedRole === 'student') && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              )}

              {/* Show digital signature field only for University */}
              {selectedRole === 'institution' && (
                <div>
                  <label htmlFor="digitalSignature" className="block text-sm font-medium text-gray-700">
                    Digital Signature
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="digitalSignature"
                      name="digitalSignature"
                      rows={4}
                      required
                      value={digitalSignature}
                      onChange={(e) => setDigitalSignature(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your digital signature certificate or paste signature data"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Enter your institutional digital signature for secure authentication
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 
                    (selectedRole === 'admin' || selectedRole === 'institution' || selectedRole === 'student' ? 'Signing In...' : 'Sending OTP...') : 
                    (selectedRole === 'admin' || selectedRole === 'institution' || selectedRole === 'student' ? 'Sign In' : 'Send OTP')
                  }
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  OTP sent to {email}
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Sign In'}
                </button>
                
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* University Registration Option */}
        {selectedRole === 'institution' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New university? Need to register your institution?
            </p>
            <Link
              to="/auth/university-signup"
              className="mt-2 inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Register Your University
            </Link>
            <p className="mt-2 text-xs text-gray-500">
              Complete verification process to join ACVS
            </p>
          </div>
        )}
      </div>
    </div>
  );
};