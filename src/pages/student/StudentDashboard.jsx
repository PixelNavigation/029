import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  GraduationCap, 
  Upload, 
  FileText, 
  X, 
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ExternalLink,
  QrCode,
  Camera,
  Github,
  Linkedin,
  Globe,
  Award,
  BookOpen,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Eye,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export const StudentDashboard = () => {
  const { user, signOut } = useAuthStore();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDocuments, setScannedDocuments] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [submissionData, setSubmissionData] = useState({
    documentType: '',
    purpose: '',
    additionalNotes: ''
  });

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInputChange = (field, value) => {
    setSubmissionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitDocuments = () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document before submitting.');
      return;
    }
    
    console.log('Submission Data:', submissionData);
    console.log('Uploaded Files:', uploadedFiles);
    alert('Documents submitted successfully! You will receive a confirmation email shortly.');
  };

  const mockStudentDocuments = {
    'STU2024001': {
      studentInfo: {
        name: 'John Doe',
        studentId: 'STU2024001',
        email: 'john.doe@dtu.ac.in',
        course: 'B.Tech Computer Science',
        university: 'Delhi Technological University',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      documents: [
        {
          id: 'doc1',
          name: 'Academic Transcript',
          type: 'transcript',
          uploadDate: '2024-01-15',
          isGenuine: true,
          verificationHash: 'abc123def456',
          issuer: 'Delhi Technological University',
          validUntil: '2026-01-15'
        },
        {
          id: 'doc2',
          name: 'Identity Card',
          type: 'identity',
          uploadDate: '2024-01-10',
          isGenuine: true,
          verificationHash: 'xyz789uvw012',
          issuer: 'Government of India',
          validUntil: '2029-01-10'
        },
        {
          id: 'doc3',
          name: 'Character Certificate',
          type: 'character',
          uploadDate: '2024-02-01',
          isGenuine: false,
          verificationHash: 'invalid_hash',
          issuer: 'Unknown Institution',
          validUntil: '2024-02-01',
          flagReason: 'Document format inconsistent with issuer standards'
        },
        {
          id: 'doc4',
          name: 'Fee Receipt',
          type: 'receipt',
          uploadDate: '2024-02-15',
          isGenuine: true,
          verificationHash: 'fee456receipt789',
          issuer: 'Delhi Technological University',
          validUntil: '2024-12-31'
        },
        {
          id: 'doc5',
          name: 'Medical Certificate',
          type: 'medical',
          uploadDate: '2024-03-01',
          isGenuine: false,
          verificationHash: 'fake_medical_123',
          issuer: 'Unverified Clinic',
          validUntil: '2024-03-01',
          flagReason: 'Digital signature verification failed'
        }
      ]
    },
    'STU2024002': {
      studentInfo: {
        name: 'Jane Smith',
        studentId: 'STU2024002',
        email: 'jane.smith@iitd.ac.in',
        course: 'M.Tech Information Technology',
        university: 'IIT Delhi',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      documents: [
        {
          id: 'doc1',
          name: 'Degree Certificate',
          type: 'degree',
          uploadDate: '2024-01-20',
          isGenuine: true,
          verificationHash: 'degree_cert_456',
          issuer: 'IIT Delhi',
          validUntil: '2030-01-20'
        },
        {
          id: 'doc2',
          name: 'Research Papers',
          type: 'research',
          uploadDate: '2024-02-10',
          isGenuine: true,
          verificationHash: 'research_789',
          issuer: 'IEEE Publications',
          validUntil: '2025-02-10'
        }
      ]
    }
  };

  const validateDocumentAuthenticity = (document) => {
    // Simulate AI-based document validation
    const validationChecks = {
      hashVerification: document.verificationHash && !document.verificationHash.includes('fake') && !document.verificationHash.includes('invalid'),
      issuerVerification: ['Delhi Technological University', 'IIT Delhi', 'Government of India', 'IEEE Publications'].includes(document.issuer),
      formatValidation: document.type && document.name && document.uploadDate,
      temporalValidation: new Date(document.validUntil) > new Date()
    };

    return {
      isValid: Object.values(validationChecks).every(check => check),
      checks: validationChecks,
      confidence: document.isGenuine ? 95 : 15
    };
  };

  const simulateQRScan = () => {
    // Simulate scanning different student QR codes
    const studentIds = ['STU2024001', 'STU2024002'];
    const randomStudentId = studentIds[Math.floor(Math.random() * studentIds.length)];
    return mockStudentDocuments[randomStudentId];
  };

  const startQRScanning = async () => {
    setIsScanning(true);
    setScannedDocuments(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Simulate QR code detection after 3 seconds
        setTimeout(() => {
          if (isScanning) {
            handleQRDetected();
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Fallback to simulation if camera access denied
      setTimeout(() => {
        if (isScanning) {
          handleQRDetected();
        }
      }, 2000);
    }
  };

  const handleQRDetected = () => {
    setIsValidating(true);
    
    // Simulate QR code scanning and document retrieval
    setTimeout(() => {
      const studentData = simulateQRScan();
      setScannedDocuments(studentData);
      setIsValidating(false);
      stopQRScanning();
    }, 2000);
  };

  const stopQRScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const generateQRData = () => {
    return JSON.stringify({
      studentId: user?.studentId,
      name: user?.name,
      email: user?.email,
      documents: uploadedFiles.map(f => f.name),
      socialLinks: user?.socialLinks,
      profileUrl: `https://acvs.gov.in/student/${user?.studentId}`,
      generatedAt: new Date().toISOString()
    });
  };

  const documentTypes = [
    'Academic Transcript',
    'Degree Certificate',
    'Identity Proof',
    'Address Proof',
    'Character Certificate',
    'Medical Certificate',
    'Fee Receipt',
    'Scholarship Documents',
    'Research Papers',
    'Project Reports',
    'Internship Certificate',
    'Other Documents'
  ];

  const submissionPurposes = [
    'University Application',
    'Job Application',
    'Scholarship Application',
    'Visa Processing',
    'Higher Education',
    'Document Verification',
    'Legal Requirements',
    'Government Services',
    'Other Purpose'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">Document Submission & Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
                <span className="text-gray-500 ml-2">({user?.studentId})</span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Documents</h2>
          <p className="text-gray-600">Upload and manage your academic documents for verification and processing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Document Submission (3/4 width) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Document Upload Area */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Upload className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
              </div>

              {/* Submission Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select
                    value={submissionData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <select
                    value={submissionData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Purpose</option>
                    {submissionPurposes.map((purpose) => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 mb-6
                  ${isDragActive 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                
                {isDragActive ? (
                  <div>
                    <p className="text-lg font-medium text-green-600 mb-2">Drop files here</p>
                    <p className="text-sm text-gray-600">Release to upload documents</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop your documents here
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      or click to browse files from your device
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-6 text-center">
                Supported formats: PDF, DOC, DOCX, JPG, PNG • Maximum file size: 10MB each
              </p>

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={submissionData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Any additional information about your documents..."
                />
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Uploaded Documents ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-3">
                    {uploadedFiles.map((fileObj) => (
                      <div
                        key={fileObj.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">
                              {fileObj.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(fileObj.size)} • Uploaded {new Date(fileObj.uploadedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 pt-6 border-t">
                <button 
                  onClick={handleSubmitDocuments}
                  disabled={uploadedFiles.length === 0}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    uploadedFiles.length > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-5 w-5" />
                  <span>Submit Documents ({uploadedFiles.length})</span>
                </button>
                {uploadedFiles.length === 0 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Upload at least one document to submit
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Student Profile Card (1/4 width) */}
          <div className="space-y-6">
            {/* Student Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4">
                <div className="flex justify-center mb-3">
                  <img
                    src={user?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                    alt={user?.name}
                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-white text-center">{user?.name}</h3>
                <p className="text-green-100 text-sm text-center">Student ID: {user?.studentId}</p>
              </div>

              {/* Profile Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{user?.email}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{user?.course}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{user?.year}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-xs">{user?.university}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="px-4 pb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Connect</h4>
                <div className="grid grid-cols-3 gap-2">
                  {user?.socialLinks?.linkedin && (
                    <button
                      onClick={() => openLink(user.socialLinks.linkedin)}
                      className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="h-4 w-4" />
                    </button>
                  )}
                  
                  {user?.socialLinks?.github && (
                    <button
                      onClick={() => openLink(user.socialLinks.github)}
                      className="flex items-center justify-center p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="h-4 w-4" />
                    </button>
                  )}
                  
                  {user?.socialLinks?.portfolio && (
                    <button
                      onClick={() => openLink(user.socialLinks.portfolio)}
                      className="flex items-center justify-center p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      title="Portfolio Website"
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* QR Scanner Section */}
              <div className="border-t p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  Document QR Scanner
                </h4>
                
                {!isScanning && !scannedDocuments ? (
                  <div className="text-center">
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Scan student QR codes to validate documents</p>
                    </div>
                    <button
                      onClick={startQRScanning}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Scan QR Code</span>
                    </button>
                  </div>
                ) : isScanning ? (
                  <div className="text-center">
                    <video
                      ref={videoRef}
                      className="w-full h-32 bg-gray-900 rounded-lg mb-3 object-cover"
                      playsInline
                    />
                    {isValidating ? (
                      <div className="flex items-center justify-center space-x-2 py-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm">Validating documents...</span>
                      </div>
                    ) : (
                      <button
                        onClick={stopQRScanning}
                        className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Stop Scanning
                      </button>
                    )}
                  </div>
                ) : null}
                
                <canvas ref={canvasRef} className="hidden" />
                
                {!scannedDocuments && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Scan QR codes to validate student documents and check authenticity
                  </p>
                )}
              </div>

              {/* Scanned Documents Display */}
              {scannedDocuments && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      Document Validation
                    </h4>
                    <button
                      onClick={() => setScannedDocuments(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Student Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={scannedDocuments.studentInfo.profilePhoto}
                        alt={scannedDocuments.studentInfo.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {scannedDocuments.studentInfo.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          ID: {scannedDocuments.studentInfo.studentId}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {scannedDocuments.studentInfo.course}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {scannedDocuments.documents.map((doc) => {
                      const validation = validateDocumentAuthenticity(doc);
                      return (
                        <div
                          key={doc.id}
                          className={`p-3 rounded-lg border text-sm ${
                            doc.isGenuine 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 truncate">
                                  {doc.name}
                                </p>
                                {doc.isGenuine ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-600">
                                  {doc.issuer}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {doc.uploadDate}
                                </span>
                              </div>
                              {!doc.isGenuine && doc.flagReason && (
                                <div className="mt-2 flex items-start space-x-1">
                                  <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-red-600">
                                    {doc.flagReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              doc.isGenuine 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {doc.isGenuine ? 'Authentic' : 'Flagged'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Confidence: {validation.confidence}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-600">
                            {scannedDocuments.documents.filter(d => d.isGenuine).length}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">Verified</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <XCircle className="h-3 w-3 text-red-600" />
                          <span className="font-medium text-red-600">
                            {scannedDocuments.documents.filter(d => !d.isGenuine).length}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">Flagged</p>
                      </div>
                    </div>
                  </div>

                  {/* New Scan Button */}
                  <button
                    onClick={() => {
                      setScannedDocuments(null);
                      startQRScanning();
                    }}
                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Scan Another QR</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Documents Submitted:</span>
                  <span className="font-medium text-gray-900">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verification:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};