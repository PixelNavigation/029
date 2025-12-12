import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, CheckCircle, Clock, Loader } from 'lucide-react';

export const FileUpload = ({ onFileSelect, acceptedFileTypes = '.pdf,.jpg,.jpeg,.png' }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'processing', 'completed'
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (onFileSelect) {
      const fileObjects = acceptedFiles; // Pass the actual File objects
      onFileSelect(fileObjects);
    }
  }, [onFileSelect]);

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProcessDocuments = async () => {
    setIsProcessing(true);
    setVerificationStatus('processing');

    // Simulate document processing
    try {
      // Show processing message for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock verification data
      const mockVerificationData = {
        studentInfo: {
          name: 'John Doe Smith',
          email: 'john.smith@university.edu',
          id: 'STU2024001',
          university: 'MIT University',
          course: 'Bachelor of Technology',
          year: '2020-2024'
        },
        verification: {
          total: uploadedFiles.length,
          verified: uploadedFiles.length,
          semiVerified: 0,
          unableToVerify: 0,
          verifiedDocuments: uploadedFiles.map((file, index) => ({
            name: file.name,
            type: file.name.toLowerCase().includes('degree') ? 'Degree Certificate' : 
                  file.name.toLowerCase().includes('transcript') ? 'Academic Transcript' : 
                  'Academic Document',
            submittedAt: new Date().toISOString(),
            verificationId: `VER${Date.now()}${index}`
          }))
        },
        issuedAt: new Date().toISOString(),
        signature: '0x' + Math.random().toString(16).substr(2, 64),
        version: '2.1.0'
      };
      
      // Navigate to verification page with data
      const encodedData = encodeURIComponent(JSON.stringify(mockVerificationData));
      navigate(`/verify?data=${encodedData}`);
      
    } catch (error) {
      setIsProcessing(false);
      setVerificationStatus(null);
      console.error('Document processing failed:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <div>
            <p className="text-lg font-medium text-blue-600 mb-2">Drop files here</p>
            <p className="text-sm text-gray-600">Release to upload your documents</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag & drop your documents here
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse files
            </p>
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-5 w-5 mr-2" />
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Supports PDF, JPG, PNG files up to 10MB each
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Process Documents Button */}
          {uploadedFiles.length > 0 && verificationStatus !== 'processing' && verificationStatus !== 'completed' && (
            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleProcessDocuments}
                disabled={isProcessing}
                className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Process Documents (${uploadedFiles.length})`}
              </button>
            </div>
          )}

          {/* Verification Status Messages */}
          {verificationStatus === 'processing' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-3">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Document Under Verification
                  </h3>
                  <p className="text-blue-700">
                    Your document is being processed and verified. Please wait while we authenticate your certificate.
                  </p>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span>Estimated time: 2-3 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === 'completed' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Redirecting to Detailed Report
                  </h3>
                  <p className="text-green-700 mb-4">
                    Your documents have been processed successfully. Generating detailed verification report...
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Loading comprehensive verification results...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};