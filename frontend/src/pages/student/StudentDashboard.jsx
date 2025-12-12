import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  GraduationCap,
  Upload,
  FileText,
  X,
  Send,
  Mail,
  BookOpen,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  QrCode,
  Copy,
  Share2,
  Eye,
  Linkedin,
  Github,
  Globe,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { generateQrCode, downloadQrCode } from '../../utils/qr';

export const StudentDashboard = () => {
  const { user, signOut } = useAuthStore();

  // Minimal placeholder profile (replace with real data from auth/profile)
  const currentUser = {
    name: user?.name || 'Student Name',
    studentId: user?.studentId || 'STU-XXXX',
    email: user?.email || 'student@example.com',
    course: user?.course || 'B.Tech Computer Science',
    year: user?.year || '4th Year',
    university: user?.university || 'Your University',
    profilePhoto: user?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    socialLinks: user?.socialLinks || {}
  };

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submittedDocuments, setSubmittedDocuments] = useState([]);
  const [dummyQrCode, setDummyQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [generatingQr, setGeneratingQr] = useState(false);

  const [submissionData, setSubmissionData] = useState({ documentType: '' });
  const [showVerificationResults, setShowVerificationResults] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [scannedDocuments, setScannedDocuments] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Generate a small sample QR for profile display
  useEffect(() => {
    const generate = async () => {
      try {
        const payload = { name: currentUser.name, studentId: currentUser.studentId };
        const dataUrl = await generateQrCode(JSON.stringify(payload), { size: 300 });
        setDummyQrCode(dataUrl);
      } catch (err) {
        console.error('generate QR error', err);
      }
    };
    generate();
  }, [currentUser.name, currentUser.studentId]);
  const onDrop = (acceptedFiles) => {
    const files = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2, 9),
      name: file.name,
      size: file.size,
      file,
      uploadedAt: new Date().toISOString()
    }));
    setUploadedFiles((s) => [...s, ...files]);
  };
  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleInputChange = (field, value) => {
    setSubmissionData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const getDocumentVerificationStatus = (fileName, documentType) => {
    const fileNameLower = (fileName || '').toLowerCase();
    const docTypeLower = (documentType || '').toLowerCase();

    if (fileNameLower.includes('math') && fileNameLower.includes('competition')) {
      return 'unable-to-verify';
    }

    if (fileNameLower.includes('ssc') && fileNameLower.includes('memo')) {
      return 'verified';
    }

    if (fileNameLower.includes('inter') && (fileNameLower.includes('memo') || fileNameLower.includes('short'))) {
      return 'verified';
    }

    if (fileNameLower.includes('sem all') || (fileNameLower.includes('sem') && fileNameLower.includes('all'))) {
      return 'verified';
    }

    if (docTypeLower.includes('5th') && docTypeLower.includes('semester')) {
      return 'semi-verified';
    }

    if (fileNameLower.includes('competition') || fileNameLower.includes('participation')) {
      return 'unable-to-verify';
    }

    return 'verified';
  };

  const handleSubmitDocuments = () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document before submitting.');
      return;
    }

    const processedDocuments = uploadedFiles.map((file) => {
      const verificationStatus = getDocumentVerificationStatus(file.name, submissionData.documentType);
      return {
        ...file,
        documentType: submissionData.documentType || 'Academic Records',
        verificationStatus,
        submittedAt: new Date().toISOString(),
        verificationId: Math.random().toString(36).substring(2, 10).toUpperCase()
      };
    });

    setSubmittedDocuments((prev) => [...prev, ...processedDocuments]);
    setShowVerificationResults(true);

    const verifiedCount = processedDocuments.filter((d) => d.verificationStatus === 'verified').length;
    const semiVerifiedCount = processedDocuments.filter((d) => d.verificationStatus === 'semi-verified').length;
    const unableToVerifyCount = processedDocuments.filter((d) => d.verificationStatus === 'unable-to-verify').length;

    alert(
      `Documents submitted successfully!\n\n` +
        `✅ Verified: ${verifiedCount}\n` +
        `⚠️ Semi-Verified: ${semiVerifiedCount}\n` +
        `❌ Unable to Verify: ${unableToVerifyCount}`
    );

    setUploadedFiles([]);
    setSubmissionData({ documentType: '' });
  };

  const generateStudentQrCode = async () => {
    if (submittedDocuments.length === 0) {
      alert('Please submit documents before generating QR code.');
      return;
    }

    setGeneratingQr(true);
    try {
      const verifiedDocs = submittedDocuments.filter((d) => d.verificationStatus === 'verified');

      const verificationData = {
        type: 'DOCUMENT_VERIFICATION',
        version: '1.0',
        studentInfo: {
          id: currentUser.studentId,
          name: currentUser.name,
          email: currentUser.email,
          university: currentUser.university,
          course: currentUser.course,
          year: currentUser.year
        },
        verification: {
          total: submittedDocuments.length,
          verified: verifiedDocs.length,
          semiVerified: submittedDocuments.filter((d) => d.verificationStatus === 'semi-verified').length,
          unableToVerify: submittedDocuments.filter((d) => d.verificationStatus === 'unable-to-verify').length,
          verifiedDocuments: verifiedDocs.map((doc) => ({
            name: doc.name,
            type: doc.documentType,
            verificationId: doc.verificationId,
            submittedAt: doc.submittedAt,
            status: 'VERIFIED',
            hash: `sha256_${doc.verificationId}`,
            size: doc.size,
            fileExtension: doc.name.split('.').pop().toLowerCase(),
            previewAvailable: ['pdf', 'jpg', 'jpeg', 'png'].includes(doc.name.split('.').pop().toLowerCase())
          }))
        },
        issuedAt: new Date().toISOString(),
        signature: `ACVS_${Date.now()}_${currentUser.studentId}`
      };

      const dataUrl = await generateQrCode(verificationData, { size: 512 });
      setQrCodeDataUrl(dataUrl);
      setShowQrModal(true);
    } catch (error) {
      alert('Failed to generate QR code: ' + error.message);
    } finally {
      setGeneratingQr(false);
    }
  };

  const downloadStudentQrCode = async () => {
    if (submittedDocuments.length === 0) {
      alert('Please submit documents before downloading QR code.');
      return;
    }

    try {
      const verifiedDocs = submittedDocuments.filter((d) => d.verificationStatus === 'verified');

      const qrPayload = {
        type: 'DOCUMENT_VERIFICATION',
        version: '1.0',
        studentInfo: {
          id: currentUser.studentId,
          name: currentUser.name,
          email: currentUser.email,
          university: currentUser.university,
          course: currentUser.course,
          year: currentUser.year
        },
        verification: {
          total: submittedDocuments.length,
          verified: verifiedDocs.length,
          semiVerified: submittedDocuments.filter((d) => d.verificationStatus === 'semi-verified').length,
          unableToVerify: submittedDocuments.filter((d) => d.verificationStatus === 'unable-to-verify').length,
          verifiedDocuments: verifiedDocs.map((doc) => ({
            name: doc.name,
            type: doc.documentType,
            verificationId: doc.verificationId,
            submittedAt: doc.submittedAt,
            status: 'VERIFIED',
            hash: `sha256_${doc.verificationId}`,
            size: doc.size,
            fileExtension: doc.name.split('.').pop().toLowerCase(),
            previewAvailable: ['pdf', 'jpg', 'jpeg', 'png'].includes(doc.name.split('.').pop().toLowerCase())
          }))
        },
        issuedAt: new Date().toISOString(),
        signature: `ACVS_${Date.now()}_${currentUser.studentId}`
      };

      await downloadQrCode(
        qrPayload,
        `${currentUser.name.replace(/\s+/g, '_')}_verified_documents.png`,
        { size: 400 }
      );
    } catch (error) {
      alert('Failed to download QR code: ' + error.message);
    }
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

  // QR data generation is handled in generateStudentQrCode function

  const documentTypes = [
    '10th Certificate',
    'Inter/Diploma Certificate',
    'Undergraduate Certificate',
    'Post Graduate Certificate',
    'PHD Certificate',
    'Internship Certificate'
  ];

  // Submission purposes removed as requested

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
                Welcome, <span className="font-medium">{currentUser?.name}</span>
                <span className="text-gray-500 ml-2">({currentUser?.studentId})</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Document Submission (3/4 width) */}
          <div className="lg:col-span-3 space-y-6">
            {/* All Documents Section - Merged */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {2 + submittedDocuments.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Permanent Documents - SSC Memo */}
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900" title="SSC Memo_shash.pdf">
                        SSC Memo_shash.pdf
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Academic Records
                      </p>
                      
                      <div className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>Size: 0.13 MB</p>
                        <p>Uploaded: {new Date().toLocaleDateString()}</p>
                        <p>ID: VER001SSC</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permanent Documents - Inter Short Memo */}
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900" title="Inter Short Memo_shash.pdf">
                        Inter Short Memo_shash.pdf
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Academic Records
                      </p>
                      
                      <div className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>Size: 0.10 MB</p>
                        <p>Uploaded: {new Date().toLocaleDateString()}</p>
                        <p>ID: VER002INT</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Submitted Documents */}
                {submittedDocuments.map((doc) => (
                  <div
                    key={doc.verificationId}
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                      doc.verificationStatus === 'verified'
                        ? 'bg-green-50 border-green-200'
                        : doc.verificationStatus === 'semi-verified'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {doc.verificationStatus === 'verified' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : doc.verificationStatus === 'semi-verified' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.documentType}
                        </p>
                        
                        <div className={`inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium ${
                          doc.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : doc.verificationStatus === 'semi-verified'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.verificationStatus === 'verified'
                            ? '✓ Verified'
                            : doc.verificationStatus === 'semi-verified'
                            ? '⚠ Semi-verified'
                            : '✗ Unable to Verify'
                          }
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <p>Size: {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Submitted: {new Date(doc.submittedAt).toLocaleDateString()}</p>
                          <p>ID: {doc.verificationId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Statistics */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      {2 + submittedDocuments.filter(d => d.verificationStatus === 'verified').length}
                    </div>
                    <div className="text-sm text-green-600">Verified</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-600">
                      {submittedDocuments.filter(d => d.verificationStatus === 'semi-verified').length}
                    </div>
                    <div className="text-sm text-yellow-600">Semi-verified</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-red-600">
                      {submittedDocuments.filter(d => d.verificationStatus === 'unable-to-verify').length}
                    </div>
                    <div className="text-sm text-red-600">Unable to Verify</div>
                  </div>
                </div>
              </div>
            </div>

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

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Uploaded Documents ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-3">
                    {uploadedFiles.map((fileObj) => {
                      const expectedStatus = getDocumentVerificationStatus(fileObj.name, submissionData.documentType);
                      return (
                        <div
                          key={fileObj.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            expectedStatus === 'verified' 
                              ? 'bg-green-50 border-green-200' 
                              : expectedStatus === 'semi-verified'
                              ? 'bg-yellow-50 border-yellow-200'
                              : expectedStatus === 'unable-to-verify'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              {expectedStatus === 'verified' && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {expectedStatus === 'semi-verified' && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                              {expectedStatus === 'unable-to-verify' && (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 truncate text-sm">
                                  {fileObj.name}
                                </p>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  expectedStatus === 'verified'
                                    ? 'bg-green-100 text-green-800'
                                    : expectedStatus === 'semi-verified'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : expectedStatus === 'unable-to-verify'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {expectedStatus === 'verified' && 'Will be Verified'}
                                  {expectedStatus === 'semi-verified' && 'Will be Semi-Verified'}
                                  {expectedStatus === 'unable-to-verify' && 'Unable to Verify'}
                                </span>
                              </div>
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
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-3">
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
                    <span>Submit Documents for Verification ({uploadedFiles.length})</span>
                  </button>
                  
                  {uploadedFiles.length === 0 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Please upload documents to submit for verification
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Results */}
            {showVerificationResults && submittedDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Document Verification Results</h3>
                  </div>
                  <button
                    onClick={() => setShowVerificationResults(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {submittedDocuments.map((doc) => (
                    <div
                      key={doc.verificationId}
                      className={`p-4 rounded-lg border-2 ${
                        doc.verificationStatus === 'verified'
                          ? 'border-green-200 bg-green-50'
                          : doc.verificationStatus === 'semi-verified'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            {doc.verificationStatus === 'verified' && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {doc.verificationStatus === 'semi-verified' && (
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            )}
                            {doc.verificationStatus === 'unable-to-verify' && (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          
                          <div className="mb-3">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              doc.verificationStatus === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : doc.verificationStatus === 'semi-verified'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {doc.verificationStatus === 'verified' && 'Verified'}
                              {doc.verificationStatus === 'semi-verified' && 'Semi-Verified'}
                              {doc.verificationStatus === 'unable-to-verify' && 'Unable to Verify'}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Document Type:</span> {doc.documentType}</p>
                            <p><span className="font-medium">File Size:</span> {formatFileSize(doc.size)}</p>
                            <p><span className="font-medium">Submitted:</span> {new Date(doc.submittedAt).toLocaleString()}</p>
                            <p><span className="font-medium">Verification ID:</span> {doc.verificationId}</p>
                          </div>

                          {doc.verificationStatus === 'verified' && (
                            <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-700">
                              ✓ Document successfully verified and authenticated by our system
                            </div>
                          )}
                          
                          {doc.verificationStatus === 'semi-verified' && (
                            <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-700">
                              ⚠ Document requires additional verification - Manual review in progress
                            </div>
                          )}
                          
                          {doc.verificationStatus === 'unable-to-verify' && (
                            <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-700">
                              ✗ Unable to verify document - Please contact support or provide alternative documentation
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Verification Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {submittedDocuments.filter(d => d.verificationStatus === 'verified').length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Verified</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="text-lg font-bold text-yellow-600">
                          {submittedDocuments.filter(d => d.verificationStatus === 'semi-verified').length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Semi-Verified</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-lg font-bold text-red-600">
                          {submittedDocuments.filter(d => d.verificationStatus === 'unable-to-verify').length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Unable to Verify</p>
                    </div>
                  </div>
                </div>


              </div>
            )}
          </div>

          {/* Right Column - Student Profile Card (1/4 width) */}
          <div className="space-y-6">
            {/* Student Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4">
                <div className="flex justify-center mb-3">
                  <img
                    src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                    alt={currentUser?.name}
                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-white text-center">{currentUser?.name}</h3>
                <p className="text-green-100 text-sm text-center">Apaar ID: {currentUser?.studentId}</p>
              </div>

              {/* Profile Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{currentUser?.email}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{currentUser?.course}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{currentUser?.year}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-xs">{currentUser?.university}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="px-4 pb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Connect</h4>
                <div className="grid grid-cols-3 gap-2">
                  {currentUser?.socialLinks?.linkedin && (
                    <button
                      onClick={() => openLink(currentUser.socialLinks.linkedin)}
                      className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="h-4 w-4" />
                    </button>
                  )}
                  
                  {currentUser?.socialLinks?.github && (
                    <button
                      onClick={() => openLink(currentUser.socialLinks.github)}
                      className="flex items-center justify-center p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="h-4 w-4" />
                    </button>
                  )}
                  
                  {currentUser?.socialLinks?.portfolio && (
                    <button
                      onClick={() => openLink(currentUser.socialLinks.portfolio)}
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
                  Document QR
                </h4>
                
                {!isScanning && !scannedDocuments ? (
                  <div className="text-center">
                    <div className="mb-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      {dummyQrCode ? (
                        <div className="mb-3">
                          <img 
                            src={dummyQrCode} 
                            alt="Sample QR Code"
                            className="w-32 h-32 mx-auto mb-3 border-2 border-gray-300 rounded-lg shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="mb-3">
                          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        </div>
                      )}
                    </div>
                    
                    {/* Copy QR and Share QR buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (dummyQrCode) {
                            // Convert data URL to blob and copy to clipboard
                            fetch(dummyQrCode)
                              .then(res => res.blob())
                              .then(blob => {
                                navigator.clipboard.write([
                                  new ClipboardItem({ [blob.type]: blob })
                                ]);
                                alert('QR code copied to clipboard!');
                              })
                              .catch(() => {
                                // Fallback: copy the data URL as text
                                navigator.clipboard.writeText(dummyQrCode);
                                alert('QR code data copied to clipboard!');
                              });
                          }
                        }}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy QR</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (dummyQrCode && navigator.share) {
                            // Use Web Share API if available
                            fetch(dummyQrCode)
                              .then(res => res.blob())
                              .then(blob => {
                                const file = new File([blob], 'document-qr.png', { type: blob.type });
                                navigator.share({
                                  title: 'Document Verification QR Code',
                                  text: 'Scan this QR code to verify documents',
                                  files: [file]
                                });
                              })
                              .catch(() => {
                                // Fallback: copy to clipboard
                                navigator.clipboard.writeText(dummyQrCode);
                                alert('QR code copied to clipboard for sharing!');
                              });
                          } else {
                            // Fallback for browsers without Web Share API
                            navigator.clipboard.writeText(dummyQrCode);
                            alert('QR code copied to clipboard for sharing!');
                          }
                        }}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Share2 className="h-3 w-3" />
                        <span>Share QR</span>
                      </button>
                    </div>
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


          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCodeDataUrl && (
        <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-white' : 'bg-black bg-opacity-75 flex items-center justify-center p-4'}`}>
          <div className={`${
            isFullscreen 
              ? 'w-full h-full flex flex-col bg-white' 
              : 'bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
          } transition-all duration-300`}>
            <div className={`flex items-center justify-between ${isFullscreen ? 'p-6 border-b border-gray-200' : 'mb-6'}`}>
              <div className="flex items-center space-x-2">
                <QrCode className="h-6 w-6 text-green-600" />
                <h3 className={`${isFullscreen ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900`}>Verified Documents QR Code</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    setIsFullscreen(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close QR Modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className={`${isFullscreen ? 'flex-1 flex flex-col items-center justify-center p-8 overflow-auto' : 'text-center mb-6'}`}>
              <div className={`inline-block ${isFullscreen ? 'p-8' : 'p-4'} bg-white border-2 border-gray-200 rounded-lg shadow-lg`}>
                <img 
                  src={qrCodeDataUrl} 
                  alt="Student Verification QR Code" 
                  className={`mx-auto ${
                    isFullscreen 
                      ? 'w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]' 
                      : 'w-64 h-64'
                  }`}
                />
              </div>
              <div className={`${isFullscreen ? 'mt-8' : 'mt-4'} p-4 bg-blue-50 border border-blue-200 rounded-lg ${isFullscreen ? 'max-w-2xl' : 'max-w-lg'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600">📱</span>
                  <p className={`${isFullscreen ? 'text-base' : 'text-sm'} text-blue-700 font-medium`}>
                    Document Verification QR Code
                  </p>
                </div>
                <p className={`${isFullscreen ? 'text-sm' : 'text-xs'} text-blue-600 mb-2`}>
                  <strong>Scan to view:</strong> Complete verification page with student details, verified documents with visual previews, and verification status
                </p>
                <p className={`${isFullscreen ? 'text-sm' : 'text-xs'} text-blue-600`}>
                  <strong>How to use:</strong> Scan this QR code with any QR scanner app to open the verification page showing all verified documents with document previews and detailed information.
                </p>
              </div>
            </div>

            <div className={`${isFullscreen ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-gray-50' : 'space-y-4'} text-sm`}>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 text-base">Verified Documents</span>
                </div>
                <div className="text-green-700 space-y-2">
                  {submittedDocuments.filter(d => d.verificationStatus === 'verified').map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-green-100 rounded">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className={`${isFullscreen ? 'text-sm' : 'text-xs'} font-medium`}>{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 text-base">QR Code Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Student:</span> {currentUser?.name}</p>
                  <p><span className="font-medium">ID:</span> {currentUser?.studentId}</p>
                  <p><span className="font-medium">University:</span> {currentUser?.university}</p>
                  <p><span className="font-medium">Course:</span> {currentUser?.course}</p>
                  <p><span className="font-medium">Verified Documents:</span> {submittedDocuments.filter(d => d.verificationStatus === 'verified').length}</p>
                  <p><span className="font-medium">Generated:</span> {new Date().toLocaleString()}</p>
                  <p><span className="font-medium">QR Type:</span> Document Verification</p>
                  <p><span className="font-medium">Version:</span> 1.0</p>
                </div>
              </div>
            </div>

            <div className={`flex ${isFullscreen ? 'justify-center flex-wrap gap-3 p-6 border-t border-gray-200 bg-white' : 'space-x-3'} mt-6`}>
              <button
                onClick={downloadStudentQrCode}
                className={`flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                  isFullscreen ? 'w-auto' : 'flex-1'
                }`}
              >
                <Eye className="h-5 w-5" />
                <span>Download QR Code</span>
              </button>
              <button
                onClick={() => {
                  const verifiedDocs = submittedDocuments.filter(doc => doc.verificationStatus === 'verified');
                  const verificationData = {
                    type: 'DOCUMENT_VERIFICATION',
                    version: '1.0',
                    studentInfo: {
                      id: currentUser?.studentId,
                      name: currentUser?.name,
                      email: currentUser?.email,
                      university: currentUser?.university,
                      course: currentUser?.course,
                      year: currentUser?.year
                    },
                    verification: {
                      total: submittedDocuments.length,
                      verified: verifiedDocs.length,
                      semiVerified: submittedDocuments.filter(doc => doc.verificationStatus === 'semi-verified').length,
                      unableToVerify: submittedDocuments.filter(doc => doc.verificationStatus === 'unable-to-verify').length,
                      verifiedDocuments: verifiedDocs.map(doc => ({
                        name: doc.name,
                        type: doc.documentType,
                        verificationId: doc.verificationId,
                        submittedAt: doc.submittedAt,
                        status: 'VERIFIED',
                        hash: `sha256_${doc.verificationId}`,
                        size: doc.size,
                        fileExtension: doc.name.split('.').pop().toLowerCase(),
                        previewAvailable: ['pdf', 'jpg', 'jpeg', 'png'].includes(doc.name.split('.').pop().toLowerCase())
                      }))
                    },
                    issuedAt: new Date().toISOString(),
                    signature: `ACVS_${Date.now()}_${currentUser?.studentId}`
                  };
                  
                  const currentHost = window.location.origin;
                  const verificationUrl = `${currentHost}/verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;
                  
                  const copyText = `Verification URL:\n${verificationUrl}\n\nVerification Data:\n${JSON.stringify(verificationData, null, 2)}`;
                  navigator.clipboard.writeText(copyText);
                  alert('Verification URL and data copied to clipboard!');
                }}
                className={`flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isFullscreen ? 'w-auto' : 'flex-1'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>Copy Data</span>
              </button>
              <button
                onClick={() => {
                  const verifiedDocs = submittedDocuments.filter(doc => doc.verificationStatus === 'verified');
                  const verificationData = {
                    type: 'DOCUMENT_VERIFICATION',
                    version: '1.0',
                    studentInfo: {
                      id: currentUser?.studentId,
                      name: currentUser?.name,
                      email: currentUser?.email,
                      university: currentUser?.university,
                      course: currentUser?.course,
                      year: currentUser?.year
                    },
                    verification: {
                      total: submittedDocuments.length,
                      verified: verifiedDocs.length,
                      semiVerified: submittedDocuments.filter(doc => doc.verificationStatus === 'semi-verified').length,
                      unableToVerify: submittedDocuments.filter(doc => doc.verificationStatus === 'unable-to-verify').length,
                      verifiedDocuments: verifiedDocs.map(doc => ({
                        name: doc.name,
                        type: doc.documentType,
                        verificationId: doc.verificationId,
                        submittedAt: doc.submittedAt,
                        status: 'VERIFIED',
                        hash: `sha256_${doc.verificationId}`,
                        size: doc.size,
                        fileExtension: doc.name.split('.').pop().toLowerCase(),
                        previewAvailable: ['pdf', 'jpg', 'jpeg', 'png'].includes(doc.name.split('.').pop().toLowerCase())
                      }))
                    },
                    issuedAt: new Date().toISOString(),
                    signature: `ACVS_${Date.now()}_${currentUser?.studentId}`
                  };
                  
                  const currentHost = window.location.origin;
                  const verificationUrl = `${currentHost}/verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;
                  window.open(verificationUrl, '_blank');
                }}
                className={`flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${
                  isFullscreen ? 'w-auto' : 'flex-1'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View Online</span>
              </button>
              {!isFullscreen && (
                <button
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;