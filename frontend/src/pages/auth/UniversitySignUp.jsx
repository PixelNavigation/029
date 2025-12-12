import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';

export const UniversitySignUp = () => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Verification
  const [formData, setFormData] = useState({
    // Basic Information
    institutionName: '',
    institutionCode: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    establishedYear: '',
    institutionType: '',
    affiliatedBoard: '',
    
    // Contact Person Details
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    contactPersonDesignation: '',
    
    // Authentication
    password: '',
    confirmPassword: '',
    
    // Agreement
    termsAccepted: false,
    dataProcessingAccepted: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showHashModal, setShowHashModal] = useState(false);
  const [institutionHash, setInstitutionHash] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const navigate = useNavigate();

  const institutionTypes = [
    'Central University',
    'State University',
    'Deemed University',
    'Private University',
    'Institute of National Importance',
    'Autonomous College',
    'Affiliated College',
    'Technical Institute',
    'Medical College',
    'Engineering College',
    'Management Institute',
    'Arts & Science College'
  ];

  const statesOfIndia = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli', 'Daman and Diu',
    'Lakshadweep'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      // Basic Information Validation
      if (!formData.institutionName.trim()) newErrors.institutionName = 'Institution name is required';
      if (!formData.institutionCode.trim()) newErrors.institutionCode = 'Institution code is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
      if (!formData.website.trim()) newErrors.website = 'Website is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      if (!formData.establishedYear.trim()) newErrors.establishedYear = 'Established year is required';
      if (!formData.institutionType) newErrors.institutionType = 'Institution type is required';
      
      // Contact Person Validation
      if (!formData.contactPersonName.trim()) newErrors.contactPersonName = 'Contact person name is required';
      if (!formData.contactPersonEmail.trim()) newErrors.contactPersonEmail = 'Contact person email is required';
      if (!formData.contactPersonPhone.trim()) newErrors.contactPersonPhone = 'Contact person phone is required';
      if (!formData.contactPersonDesignation.trim()) newErrors.contactPersonDesignation = 'Designation is required';
      
      // Password Validation
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (stepNumber === 2) {
      // Agreement Validation
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
      if (!formData.dataProcessingAccepted) newErrors.dataProcessingAccepted = 'You must accept data processing terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    
    setIsLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/institution/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      if (data.success) {
        // Store the hash and code to display in modal
        setInstitutionHash(data.institutionHash);
        setInstitutionCode(data.institutionCode);
        setShowHashModal(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHash = () => {
    const content = `Institution Registration Details\n\n` +
      `Institution Name: ${formData.institutionName}\n` +
      `Institution Code: ${institutionCode}\n` +
      `Email: ${formData.email}\n` +
      `Website: ${formData.website}\n\n` +
      `SHA256 Hash Key:\n${institutionHash}\n\n` +
      `IMPORTANT: Please save this hash key securely. ` +
      `You will need this for verification purposes.\n\n` +
      `Generated on: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${institutionCode}_hash_key.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(institutionHash);
    alert('Hash key copied to clipboard!');
  };

  const handleCloseModal = () => {
    setShowHashModal(false);
    navigate('/auth/signin', { 
      state: { 
        role: 'institution',
        message: 'Registration completed successfully! Please sign in with your credentials.'
      }
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Institution Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700">
              Institution Name *
            </label>
            <input
              type="text"
              id="institutionName"
              name="institutionName"
              value={formData.institutionName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter institution name"
            />
            {errors.institutionName && <p className="mt-1 text-sm text-red-600">{errors.institutionName}</p>}
          </div>
          
          <div>
            <label htmlFor="institutionCode" className="block text-sm font-medium text-gray-700">
              Institution Code *
            </label>
            <input
              type="text"
              id="institutionCode"
              name="institutionCode"
              value={formData.institutionCode}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., UNIV001"
            />
            {errors.institutionCode && <p className="mt-1 text-sm text-red-600">{errors.institutionCode}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Official Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@institution.edu"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Official Website *
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.institution.edu"
            />
            {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
          </div>
          
          <div>
            <label htmlFor="institutionType" className="block text-sm font-medium text-gray-700">
              Institution Type *
            </label>
            <select
              id="institutionType"
              name="institutionType"
              value={formData.institutionType}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select institution type</option>
              {institutionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.institutionType && <p className="mt-1 text-sm text-red-600">{errors.institutionType}</p>}
          </div>
          
          <div>
            <label htmlFor="establishedYear" className="block text-sm font-medium text-gray-700">
              Established Year *
            </label>
            <input
              type="number"
              id="establishedYear"
              name="establishedYear"
              value={formData.establishedYear}
              onChange={handleInputChange}
              min="1800"
              max={new Date().getFullYear()}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="YYYY"
            />
            {errors.establishedYear && <p className="mt-1 text-sm text-red-600">{errors.establishedYear}</p>}
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter complete address"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="City"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State *
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select state</option>
              {statesOfIndia.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>
          
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
              Pincode *
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="000000"
              maxLength="6"
            />
            {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="affiliatedBoard" className="block text-sm font-medium text-gray-700">
            Affiliated Board/University (if applicable)
          </label>
          <input
            type="text"
            id="affiliatedBoard"
            name="affiliatedBoard"
            value={formData.affiliatedBoard}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter affiliated board or parent university"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Person Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700">
              Contact Person Name *
            </label>
            <input
              type="text"
              id="contactPersonName"
              name="contactPersonName"
              value={formData.contactPersonName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter contact person name"
            />
            {errors.contactPersonName && <p className="mt-1 text-sm text-red-600">{errors.contactPersonName}</p>}
          </div>
          
          <div>
            <label htmlFor="contactPersonDesignation" className="block text-sm font-medium text-gray-700">
              Designation *
            </label>
            <input
              type="text"
              id="contactPersonDesignation"
              name="contactPersonDesignation"
              value={formData.contactPersonDesignation}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Registrar, Vice Chancellor"
            />
            {errors.contactPersonDesignation && <p className="mt-1 text-sm text-red-600">{errors.contactPersonDesignation}</p>}
          </div>
          
          <div>
            <label htmlFor="contactPersonEmail" className="block text-sm font-medium text-gray-700">
              Contact Email *
            </label>
            <input
              type="email"
              id="contactPersonEmail"
              name="contactPersonEmail"
              value={formData.contactPersonEmail}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="contact.person@institution.edu"
            />
            {errors.contactPersonEmail && <p className="mt-1 text-sm text-red-600">{errors.contactPersonEmail}</p>}
          </div>
          
          <div>
            <label htmlFor="contactPersonPhone" className="block text-sm font-medium text-gray-700">
              Contact Phone *
            </label>
            <input
              type="tel"
              id="contactPersonPhone"
              name="contactPersonPhone"
              value={formData.contactPersonPhone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+91 XXXXXXXXXX"
            />
            {errors.contactPersonPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPersonPhone}</p>}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password (min. 8 characters)"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review and Confirmation</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Institution Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Institution Name:</span>
              <span className="ml-2 font-medium">{formData.institutionName}</span>
            </div>
            <div>
              <span className="text-gray-500">Institution Code:</span>
              <span className="ml-2 font-medium">{formData.institutionCode}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium">{formData.institutionType}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 font-medium">{formData.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <span className="ml-2 font-medium">{formData.city}, {formData.state}</span>
            </div>
            <div>
              <span className="text-gray-500">Contact Person:</span>
              <span className="ml-2 font-medium">{formData.contactPersonName}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="termsAccepted" className="text-gray-700">
                I accept the <Link to="/terms" className="text-blue-600 hover:text-blue-500">Terms and Conditions</Link> and confirm that all information provided is accurate and up-to-date. *
              </label>
              {errors.termsAccepted && <p className="mt-1 text-sm text-red-600">{errors.termsAccepted}</p>}
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="dataProcessingAccepted"
                name="dataProcessingAccepted"
                type="checkbox"
                checked={formData.dataProcessingAccepted}
                onChange={handleInputChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="dataProcessingAccepted" className="text-gray-700">
                I consent to the processing of institutional data for verification purposes and understand that this data will be securely stored and used only for academic credential verification. *
              </label>
              {errors.dataProcessingAccepted && <p className="mt-1 text-sm text-red-600">{errors.dataProcessingAccepted}</p>}
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Your application will be reviewed by our verification team</li>
                  <li>You'll receive an email confirmation within 24 hours</li>
                  <li>Document verification process will take 3-5 business days</li>
                  <li>Once approved, you'll receive login credentials</li>
                  <li>You can then start issuing verified digital certificates</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link 
          to="/auth/signin"
          state={{ role: 'institution' }}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Sign In
        </Link>
        
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">University Registration</h1>
          <p className="mt-2 text-gray-600">Join the Academic Certificate Verification System</p>
          
          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-center">
              {[1, 2].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepNumber
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step > stepNumber ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < 2 && (
                    <div className={`w-16 h-0.5 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <div className="flex space-x-16 text-xs text-gray-500">
                <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Basic Info</span>
                <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}
              
              {step < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};