import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { FileUpload } from '../components/FileUpload';
import { QRVerification } from '../components/QRVerification';
import { 
  Shield, CheckCircle, Users, Building2, Award, GraduationCap, Calendar, User, Mail, BookOpen,
  FileText, Download, Eye, Hash, Clock, Copy, ZoomIn, X, Printer, Share2, QrCode, Upload, Camera, AlertCircle, XCircle
} from 'lucide-react';

export const LandingPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [verificationData, setVerificationData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadedFiles(files);
    setIsProcessing(true);
    setVerificationResult(null);
    
    try {
      const file = files[0]; // Take first file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/api/verify-upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVerificationResult(data.result);
      } else {
        alert(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify certificate. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilePreview = (file) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      setIsCameraOpen(true);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      // Create video element to display camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', true); // Required for iOS
      video.play();
      
      // QR code scanning
      setTimeout(async () => {
        // Stop camera
        stream.getTracks().forEach(track => track.stop());
        setIsCameraOpen(false);
        
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // TODO: Implement actual QR code verification
        setIsProcessing(false);
        alert('QR code verification system not yet implemented.');
      }, 3000);
      
    } catch (error) {
      setIsCameraOpen(false);
      console.error('Camera access error:', error);
      
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permission and try again.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (error.name === 'NotSupportedError') {
        setCameraError('Camera is not supported on this device.');
      } else {
        setCameraError('Failed to access camera. Please try again.');
      }
    }
  };

  const stopCamera = () => {
    setIsCameraOpen(false);
    setCameraError('');
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure Verification',
      description: 'Advanced cryptographic methods ensure document authenticity'
    },
    {
      icon: CheckCircle,
      title: 'Instant Validation',
      description: 'Real-time certificate verification with blockchain technology'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Separate portals for students, institutions, and authorities'
    },
    {
      icon: Building2,
      title: 'Institution Network',
      description: 'Connected network of verified educational institutions'
    }
  ];

  const stats = [
    { number: '500+', label: 'Verified Institutions' },
    { number: '1M+', label: 'Certificates Issued' },
    { number: '50K+', label: 'Active Students' },
    { number: '99.9%', label: 'Uptime Reliability' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Academic Certificate
            <span className="text-blue-600"> Verification System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Secure, fast, and reliable verification of academic certificates using blockchain technology. 
            Trusted by institutions worldwide for authentic document verification.
          </p>
        </div>

        {/* File Upload / Verification Results Section */}
        {!verificationResult ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verify Your Certificate
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Upload your academic documents for instant verification. Our AI-powered system will process 
                your certificates and generate a comprehensive verification report with blockchain authentication.
              </p>
              
            </div>
            
            {isProcessing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Processing your certificate...</p>
                <p className="text-gray-500 text-sm mt-2">Extracting data and verifying with database...</p>
              </div>
            ) : (
              <>
                <FileUpload onFileSelect={handleFileSelect} />
                
                {/* QR Verification Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="text-center mb-6">
                    <div className="bg-blue-600 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                      <QrCode className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Or Verify with QR Code
                    </h3>
                    <p className="text-gray-600">
                      Quickly verify certificates by scanning their QR codes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* Quick Scan Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-900 mb-2">Quick Scan</h4>
                      <p className="text-gray-600 mb-3 text-sm">Use camera to scan QR code</p>
                      {cameraError && (
                        <p className="text-red-600 text-xs mb-3">{cameraError}</p>
                      )}
                      <button
                        onClick={isCameraOpen ? stopCamera : startCamera}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                          isCameraOpen 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isProcessing ? 'Processing...' : isCameraOpen ? 'Stop Camera' : 'Start Scanning'}
                      </button>
                      {isCameraOpen && (
                        <p className="text-blue-600 text-xs mt-2">Camera is active - point at QR code</p>
                      )}
                    </div>

                    {/* Upload QR Image */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-900 mb-2">Upload QR Image</h4>
                      <p className="text-gray-600 mb-3 text-sm">Choose image with QR code</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          if (!file.type.startsWith('image/')) {
                            alert('Please upload a valid image file.');
                            return;
                          }
                          
                          setIsProcessing(true);
                          await new Promise(resolve => setTimeout(resolve, 1000));
                          
                          // TODO: Implement actual QR code verification from image
                          setIsProcessing(false);
                          alert('QR code verification from image not yet implemented.');
                        }}
                        className="hidden"
                        id="qr-upload"
                      />
                      <label
                        htmlFor="qr-upload"
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer inline-block"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Verification Results Display */}
        {verificationResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Verification Results</h2>
              <button
                onClick={() => {
                  setVerificationResult(null);
                  setUploadedFiles([]);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Verification Status Banner */}
            <div className={`p-6 rounded-lg mb-6 ${
              verificationResult.verification_status === 'verified' 
                ? 'bg-green-50 border border-green-200'
                : verificationResult.verification_status === 'semi-verified'
                ? 'bg-yellow-50 border border-yellow-200'
                : verificationResult.verification_status === 'not_found'
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                {verificationResult.verification_status === 'verified' ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-green-800">Certificate Verified</h3>
                      <p className="text-green-700">
                        Match Percentage: {verificationResult.match_percentage?.toFixed?.(2) ?? verificationResult.match_percentage}%
                      </p>
                    </div>
                  </>
                ) : verificationResult.verification_status === 'semi-verified' ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                    <div>
                      <h3 className="text-xl font-bold text-yellow-800">Semi-Verified ✓</h3>
                      <p className="text-yellow-700">
                        Template matches database records (Match: {verificationResult.match_percentage?.toFixed?.(2) ?? verificationResult.match_percentage}%)
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        ✓ The respective university has been alerted for manual verification
                      </p>
                    </div>
                  </>
                ) : verificationResult.verification_status === 'not_found' ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="text-xl font-bold text-orange-800">Record Not Found</h3>
                      <p className="text-orange-700">
                        No matching records found in our database
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-red-800">Verification Failed</h3>
                      <p className="text-red-700">
                        Match Percentage: {(verificationResult.match_percentage?.toFixed?.(2) ?? verificationResult.match_percentage) ?? 0}% –
                        {' '}Certificate data does not match database records
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Extracted Data */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Extracted Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className="font-medium text-gray-900">{verificationResult.extracted_data.student_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-medium text-gray-900">{verificationResult.extracted_data.student_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">University</p>
                  <p className="font-medium text-gray-900">{verificationResult.extracted_data.university_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium text-gray-900">{verificationResult.extracted_data.course_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Degree Type</p>
                  <p className="font-medium text-gray-900">{verificationResult.extracted_data.degree_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CGPA</p>
                  <p className="font-medium text-gray-900">{verificationResult.extracted_data.cgpa || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Blockchain Verification Details */}
            {verificationResult.blockchain_hash && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Blockchain Verification
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      Status:
                      {verificationResult.is_on_blockchain ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          ✓ On-chain (hash found)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          ✗ Not on-chain
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {verificationResult.is_on_blockchain
                        ? 'Certificate hash matches a record on the blockchain. Authenticity is cryptographically proven.'
                        : 'No matching hash found on the blockchain. Result is based on institutional database matching only.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono max-w-full sm:max-w-xl">
                    <Hash className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate flex-1" title={verificationResult.blockchain_hash}>
                      {verificationResult.blockchain_hash}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(verificationResult.blockchain_hash)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subject Grades */}
            {verificationResult.extracted_data.subject_grades && 
             verificationResult.extracted_data.subject_grades.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Subject-wise Grades
                  {verificationResult.subject_match_info && (
                    <span className="ml-3 text-sm text-gray-600">
                      {verificationResult.subject_match_info.matched?.length > 0 && (
                        <span className="text-green-600">✓ {verificationResult.subject_match_info.matched.length} matched</span>
                      )}
                      {verificationResult.subject_match_info.corrected?.length > 0 && (
                        <span className="text-orange-600 ml-2">⚠ {verificationResult.subject_match_info.corrected.length} corrected</span>
                      )}
                      {verificationResult.subject_match_info.missing_in_excel?.length > 0 && (
                        <span className="text-red-600 ml-2">✗ {verificationResult.subject_match_info.missing_in_excel.length} not in database</span>
                      )}
                    </span>
                  )}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {verificationResult.extracted_data.subject_grades.map((subject, idx) => {
                        const subjectName = subject.subject_name || '';
                        
                        // Check if this subject was matched exactly
                        const matchedSubject = verificationResult.subject_match_info?.matched?.find(
                          m => m.extracted === subjectName
                        );
                        
                        // Check if this subject was corrected
                        const correctedSubject = verificationResult.subject_match_info?.corrected?.find(
                          c => c.extracted === subjectName
                        );
                        
                        // Check if this subject is missing in Excel
                        const isMissing = verificationResult.subject_match_info?.missing_in_excel?.includes(subjectName);
                        
                        const rowClass = matchedSubject 
                          ? 'bg-green-50 hover:bg-green-100' 
                          : correctedSubject 
                          ? 'bg-orange-50 hover:bg-orange-100' 
                          : isMissing 
                          ? 'bg-red-50 hover:bg-red-100' 
                          : 'hover:bg-gray-50';
                        
                        const textColor = matchedSubject 
                          ? 'text-green-900' 
                          : correctedSubject 
                          ? 'text-orange-900' 
                          : isMissing 
                          ? 'text-red-900' 
                          : 'text-gray-900';
                        
                        return (
                          <tr key={idx} className={rowClass}>
                            <td className={`px-4 py-3 text-sm ${textColor}`}>
                              {correctedSubject ? correctedSubject.excel : (matchedSubject ? matchedSubject.excel : subjectName) || '-'}
                              {correctedSubject && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Database: <span className="font-medium">{correctedSubject.extracted}</span>
                                </div>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-sm ${textColor} font-medium`}>
                              {(correctedSubject || matchedSubject) ? (correctedSubject?.excel_grade || matchedSubject?.excel_grade) : subject.grade || '-'}
                              {(correctedSubject || matchedSubject) && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (Database: {subject.grade})
                                </span>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-sm ${textColor}`}>{subject.marks || '-'}</td>
                            <td className={`px-4 py-3 text-sm ${textColor}`}>{subject.credits || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              {matchedSubject && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Matched
                                </span>
                              )}
                              {correctedSubject && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  ⚠ Similar
                                </span>
                              )}
                              {isMissing && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  ✗ Not in DB
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {verificationData && (
          /* Verification Results */
          <div className="space-y-8 mb-16">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-600 p-3 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
                  <p className="text-gray-600">Academic Credentials Verification System (ACVS)</p>
                </div>
              </div>
              
              {/* Verification Status */}
              <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="font-medium text-green-800">Verification Successful</span>
                <span className="text-xs text-green-600 ml-auto">Version {verificationData.version}</span>
              </div>
            </div>

            {/* Student Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-2" />
                Student Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900 text-lg">{verificationData.studentInfo.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{verificationData.studentInfo.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">University</p>
                      <p className="font-medium text-gray-900">{verificationData.studentInfo.university}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium text-gray-900">{verificationData.studentInfo.course}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Academic Year</p>
                      <p className="font-medium text-gray-900">{verificationData.studentInfo.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="h-5 w-5 text-gray-400 flex items-center justify-center text-sm font-bold">#</span>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium text-gray-900">{verificationData.studentInfo.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Verification Summary</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">{verificationData.verification.total}</div>
                  <div className="text-sm text-gray-600">Total Documents</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{verificationData.verification.verified}</div>
                  <div className="text-sm text-green-600">Verified</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-blue-600">Verification Score</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{verificationData.blockchainInfo.confirmations}</div>
                  <div className="text-sm text-purple-600">Blockchain Confirmations</div>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Blockchain Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Hash:</span>
                      <button 
                        onClick={() => copyToClipboard(verificationData.blockchainInfo.transactionHash)}
                        className="font-mono text-xs bg-white px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        {verificationData.blockchainInfo.transactionHash.substring(0, 20)}...
                        <Copy className="inline h-3 w-3 ml-1" />
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Block Number:</span>
                      <span className="font-medium">{verificationData.blockchainInfo.blockNumber.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network:</span>
                      <span className="font-medium">Ethereum Mainnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmations:</span>
                      <span className="font-medium">{verificationData.blockchainInfo.confirmations}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Previews */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-blue-600" />
                Uploaded Documents
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {verificationData.uploadedFiles.map((file) => (
                  <div key={file.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="relative mb-4">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleFilePreview(file)}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                             onClick={() => handleFilePreview(file)}>
                          <FileText className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white bg-opacity-80 text-gray-800 px-2 py-1 rounded text-xs">
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </div>
                      <button
                        onClick={() => handleFilePreview(file)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all duration-200 rounded group"
                      >
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatFileSize(file.size)}</span>
                        <span className="text-green-600 font-medium">✓ Verified</span>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleFilePreview(file)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            link.click();
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    setVerificationData(null);
                    setUploadedFiles([]);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Verify Another Document</span>
                </button>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Download Report</span>
                </button>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <Share2 className="h-5 w-5" />
                  <span>Share Results</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ACVS?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Trusted Globally
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">ACVS</h3>
                  <p className="text-sm text-gray-400">Academic Certificate Verification</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Leading the digital transformation in academic credential verification 
                with secure, blockchain-based technology solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Academic Certificate Verification System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h3>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedFile.url;
                    link.download = selectedFile.name;
                    link.click();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Print"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowFilePreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Verified Document</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Blockchain Secured</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-100" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <div className="flex items-center justify-center p-8">
                {selectedFile.type.startsWith('image/') ? (
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name}
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Preview not available for this file type</p>
                    <p className="text-gray-500 text-sm mt-2">Click download to view the file</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};