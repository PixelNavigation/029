import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Shield, Camera } from 'lucide-react';
import { authAPI } from '../../lib/api';

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
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [aadharVerified, setAadharVerified] = useState(false);
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showCameraPermission, setShowCameraPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
      let profilePhotoUrl = '';

      // Upload profile photo if exists
      if (profileFile) {
        try {
          const uploadResponse = await authAPI.uploadProfilePhoto(profileFile, formData.studentId);
          if (uploadResponse.success) {
            profilePhotoUrl = uploadResponse.url;
          }
        } catch (uploadErr) {
          console.error('Photo upload error:', uploadErr);
          // Continue with signup even if photo upload fails
          setError('Warning: Profile photo upload failed, but continuing with registration...');
        }
      }

      // Call backend API to create student account
      const response = await authAPI.signupStudent({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        studentId: formData.studentId,
        university: formData.university,
        course: formData.course,
        year: formData.year,
        aadharId: formData.aadharId,
        phone: formData.phone,
        profilePhoto: profilePhotoUrl
      });
      
      if (response.success) {
        // Show success message and redirect to signin
        alert(response.message || 'Account created successfully! Please sign in.');
        navigate('/auth/signin-student');
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Handle different error types
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.error || 'Registration failed';
        setError(errorMessage);
      } else if (err.request) {
        // Request made but no response
        setError('Unable to connect to server. Please ensure the backend is running.');
      } else {
        // Other errors
        setError(err.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    try {
      const url = URL.createObjectURL(file);
      setProfilePreview(url);
    } catch (err) {
      setProfilePreview(null);
    }
  };

  const openCamera = async () => {
    setError(''); // Clear any previous errors
    
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser. Please use a modern browser.');
      return;
    }
    
    try {
      // For Brave browser, we need to request permission directly without testing first
      // Show our custom dialog which will handle the actual camera access
      setShowCameraPermission(true);
    } catch (err) {
      console.error('Camera permission error:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  };

  const handleCameraPermission = async (allowed) => {
    setShowCameraPermission(false);
    
    if (!allowed) {
      return;
    }

    setError(''); // Clear any previous errors
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Use a promise to ensure the modal is rendered before setting video source
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Explicitly play the video
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error('Video play error:', playErr);
        }
      }
    } catch (err) {
      setShowCamera(false);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please check permissions and try again.');
      }
      console.error('Camera error:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please wait a moment and try again.');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video has dimensions (is actually playing)
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is loading. Please wait a moment and try again.');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Unable to capture photo. Please try again.');
      return;
    }
    
    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        
        setProfileFile(file);
        setProfilePreview(previewUrl);
        closeCamera();
        
        // Show success feedback
        setError('');
      } else {
        setError('Failed to capture photo. Please try again.');
      }
    }, 'image/jpeg', 0.95);
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
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

            {/* Profile Photo */}
            <div>
              <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      id="profilePhoto"
                      name="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={openCamera}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take a Photo
                  </button>
                </div>
                {profilePreview && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <img src={profilePreview} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-gray-300" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Photo selected</p>
                      <p className="text-xs text-gray-500">Ready to upload</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setProfileFile(null); setProfilePreview(null); }} 
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">Recommended: 200x200 px, JPG/PNG format</p>
              </div>
            </div>

            {/* Camera Permission Dialog */}
            {showCameraPermission && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Camera className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Camera Access Required</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    This application needs access to your camera to take a profile photo.
                  </p>
                  <p className="text-xs text-gray-500 mb-6">
                    When you click "Allow", your browser will ask for camera permission. Please allow it to continue.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => handleCameraPermission(false)}
                      className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCameraPermission(true)}
                      className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Allow Camera
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Modal */}
            {showCamera && (
              <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Take Your Photo</h3>
                    <p className="text-sm text-gray-500">Align your face within the oval</p>
                  </div>
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto rounded-lg"
                      style={{ maxHeight: '60vh' }}
                    />
                    {/* Face alignment overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative">
                        {/* Face oval guide */}
                        <svg width="280" height="360" viewBox="0 0 280 360" className="drop-shadow-lg">
                          {/* Outer oval */}
                          <ellipse
                            cx="140"
                            cy="180"
                            rx="130"
                            ry="170"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeDasharray="10,5"
                            opacity="0.8"
                          />
                          {/* Inner oval */}
                          <ellipse
                            cx="140"
                            cy="180"
                            rx="125"
                            ry="165"
                            fill="none"
                            stroke="rgba(59, 130, 246, 0.6)"
                            strokeWidth="2"
                          />
                          {/* Alignment guides */}
                          <line x1="140" y1="10" x2="140" y2="30" stroke="white" strokeWidth="2" opacity="0.6" />
                          <line x1="140" y1="330" x2="140" y2="350" stroke="white" strokeWidth="2" opacity="0.6" />
                          <line x1="10" y1="180" x2="30" y2="180" stroke="white" strokeWidth="2" opacity="0.6" />
                          <line x1="250" y1="180" x2="270" y2="180" stroke="white" strokeWidth="2" opacity="0.6" />
                        </svg>
                        <p className="text-white text-xs text-center mt-2 font-medium drop-shadow-md">
                          Position your face here
                        </p>
                      </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      <Camera className="inline h-4 w-4 mr-1" />
                      Camera is active • Align face in oval
                    </p>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        📸 Capture Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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