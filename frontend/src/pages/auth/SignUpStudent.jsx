import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { postSignup } from '../../lib/api';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

export default function SignUpStudent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    university: '',
    course: '',
    year: '',
    aadharId: '',
    apaarId: '', // Optional
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadharVerified, setAadharVerified] = useState(false);
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const verifyAadhar = async () => {
    if (!formData.aadharId || formData.aadharId.length !== 12) {
      setError('Please enter a valid 12-digit Aadhar number');
      return;
    }

    setVerifyingAadhar(true);
    setError('');

    try {
      // Simulate Aadhar verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification - in real implementation, this would call actual Aadhar API
      const isValid = /^\d{12}$/.test(formData.aadharId);
      
      if (isValid) {
        setAadharVerified(true);
      } else {
        setError('Aadhar verification failed. Please check your Aadhar number.');
      }
    } catch (err) {
      setError('Failed to verify Aadhar. Please try again.');
    } finally {
      setVerifyingAadhar(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.studentId.trim()) return 'Student ID is required';
    if (!formData.university.trim()) return 'University is required';
    if (!formData.course.trim()) return 'Course is required';
    if (!formData.year.trim()) return 'Year is required';
    if (!formData.aadharId.trim()) return 'Aadhar ID is required';
    if (!aadharVerified) return 'Please verify your Aadhar ID';
    if (!formData.phone.trim()) return 'Phone number is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Call backend signup (uses Supabase when configured)
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        university: formData.university,
        course: formData.course,
        year: formData.year,
        aadharId: formData.aadharId,
        apaarId: formData.apaarId,
        phone: formData.phone
      };

      const resp = await postSignup(payload);
      if (resp?.user) {
        const { setUser } = useAuthStore.getState();
        setUser(resp.user);
        navigate('/student');
        return;
      }

      throw new Error('Signup failed');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          Create Student Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our academic verification platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password *
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password *
        </label>
        <div className="mt-1 relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Student ID and University Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
            Student ID *
          </label>
          <div className="mt-1">
            <input
              id="studentId"
              name="studentId"
              type="text"
              required
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Enter your student ID"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="university" className="block text-sm font-medium text-gray-700">
            University *
          </label>
          <div className="mt-1">
            <input
              id="university"
              name="university"
              type="text"
              required
              value={formData.university}
              onChange={handleChange}
              placeholder="Enter your university"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Course and Year Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700">
            Course *
          </label>
          <div className="mt-1">
            <input
              id="course"
              name="course"
              type="text"
              required
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g., B.Tech Computer Science"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Academic Year *
          </label>
          <div className="mt-1">
            <select
              id="year"
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aadhar ID with Verification */}
      <div>
        <label htmlFor="aadharId" className="block text-sm font-medium text-gray-700">
          Aadhar ID * 
          <span className="text-xs text-gray-500 ml-1">(Required for identity verification)</span>
        </label>
        <div className="mt-1 flex space-x-2">
          <input
            id="aadharId"
            name="aadharId"
            type="text"
            required
            maxLength="12"
            value={formData.aadharId}
            onChange={handleChange}
            placeholder="Enter 12-digit Aadhar number"
            className="appearance-none block flex-1 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={verifyAadhar}
            disabled={verifyingAadhar || aadharVerified || formData.aadharId.length !== 12}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            {verifyingAadhar ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verifying...</span>
              </>
            ) : aadharVerified ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Verified</span>
              </>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </div>
        {aadharVerified && (
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Aadhar verified successfully
          </p>
        )}
      </div>

      {/* APAAR ID (Optional) */}
      <div>
        <label htmlFor="apaarId" className="block text-sm font-medium text-gray-700">
          APAAR ID
          <span className="text-xs text-gray-500 ml-1">(Optional - Academic Bank of Credits)</span>
        </label>
        <div className="mt-1">
          <input
            id="apaarId"
            name="apaarId"
            type="text"
            value={formData.apaarId}
            onChange={handleChange}
            placeholder="Enter your APAAR ID (if available)"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <div className="mt-1">
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </form>

    <div className="mt-6 text-center">
      <Link
        to="/auth/signin-student"
        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
      >
        Already have an account? Sign in
      </Link>
    </div>
        </div>
      </div>
    </div>
  );
}