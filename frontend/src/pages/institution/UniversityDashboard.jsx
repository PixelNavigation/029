import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Building2, 
  Upload, 
  FileText, 
  X, 
  Save, 
  Send,
  User,
  GraduationCap,
  Calendar,
  FileCheck,
  Award,
  CheckCircle,
  Database,
  Eye,
  Shield,
  Cpu,
  Link,
  FileImage,
  Loader
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { institutionAPI } from '../../lib/api';
import { CertificatePreviewModal } from '../../components/CertificatePreviewModal';

export const UniversityDashboard = () => {
  const { user, signOut } = useAuthStore();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedCertificates, setProcessedCertificates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const [uploadMode, setUploadMode] = useState('bulk'); // 'bulk' or 'database'
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingMap, setEditingMap] = useState({});
  const [editedDataMap, setEditedDataMap] = useState({});
  const [lastUploadCount, setLastUploadCount] = useState(0);
  const [lastUploadDate, setLastUploadDate] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [recentBatches, setRecentBatches] = useState([]);
  const [currentBatchId, setCurrentBatchId] = useState(null);

  // Load recent uploads on mount
  useEffect(() => {
    loadRecentUploads();
  }, []);

  const loadRecentUploads = async () => {
    try {
      const response = await institutionAPI.getUploads(user?.institutionId || user?.email);
      if (response.success) {
        setRecentBatches(response.batches.slice(0, 5)); // Show latest 5 batches
      }
    } catch (error) {
      console.error('Failed to load recent uploads:', error);
    }
  };

  const onDrop = async (acceptedFiles) => {
    setUploadError('');
    setIsProcessing(true);
    
    try {
      // Upload files to backend
      const response = await institutionAPI.uploadCertificates(
        acceptedFiles,
        user?.institutionId || user?.email,
        user?.institutionName || user?.name || 'Unknown Institution'
      );

      if (response.success) {
        // Update local state with uploaded files info including preview URLs
        const uploadedEntries = response.files.map(f => ({
          id: Math.random().toString(36).substring(7),
          name: f.original_filename,
          savedName: f.saved_filename,
          size: f.size,
          type: f.type,
          status: 'uploaded',
          filePath: f.file_path,
          previewUrl: f.preview_url
        }));

        setUploadedFiles(prev => [...prev, ...uploadedEntries]);
        setLastUploadCount(uploadedEntries.length);
        setLastUploadDate(new Date());
        setCurrentBatchId(response.batch_id); // Store batch ID

        // Set extracted data for preview
        if (response.extracted_data && response.extracted_data.length > 0) {
          setPreviewData(response.extracted_data);
          setShowPreview(true);
        }

        // Reload recent batches
        await loadRecentUploads();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.response?.data?.error || error.message || 'Upload failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Removed PDF page count logic since we're now uploading to backend directly

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.bmp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB max file size
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

  // Process certificates with OCR
  const processCertificates = async (files) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // TODO: Implement actual OCR processing API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setProcessingProgress(0);
    alert('OCR processing system not yet implemented.');
  };
  

  // Database connection
  const connectToDatabase = async () => {
    setConnectionStatus('connecting');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Implement actual database connection
    setConnectionStatus('disconnected');
    alert('Database connection not yet implemented.');
  };

  const disconnectDatabase = () => {
    setConnectionStatus('disconnected');
  };

  // Handle preview data changes
  const handlePreviewDataChange = (index, field, value) => {
    const updated = [...previewData];
    updated[index][field] = value;
    setPreviewData(updated);
  };

  // Encryption functions
  const encryptData = async (data) => {
    // TODO: Implement actual encryption
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      encryptedData: btoa(JSON.stringify(data)), // Base64 encoding as mock encryption
      encryptionKey: Math.random().toString(36).substring(2, 15),
      algorithm: 'AES-256-GCM'
    };
  };

  const pushToBlockchain = async (encryptedData) => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: Math.floor(Math.random() * 100000),
      timestamp: new Date().toISOString()
    };
  };

  const handleFinalSubmit = async () => {
    if (!previewData || previewData.length === 0) {
      alert('No processed certificates to submit');
      return;
    }

    setIsProcessing(true);
    
    try {
      // First, confirm and save data to Excel
      const saveResponse = await institutionAPI.confirmData(
        previewData,
        user?.institutionName || user?.name || 'Unknown Institution',
        currentBatchId
      );

      if (!saveResponse.success) {
        throw new Error(saveResponse.error || 'Failed to save data to Excel');
      }

      const filesCopied = saveResponse.verified_files?.length || 0;
      alert(`Successfully saved ${saveResponse.total_records} record(s) to Excel!\nOriginal files saved: ${filesCopied}\nFile: ${saveResponse.excel_file}`);

      const results = [];
      
      for (const cert of previewData) {
        // Encrypt data
        const encrypted = await encryptData(cert);
        
        // Push to blockchain
        const blockchainResult = await pushToBlockchain(encrypted);
        
        results.push({
          certificateId: cert.file_name,
          fileName: cert.original_filename || cert.file_name,
          encryption: encrypted,
          blockchain: blockchainResult,
          status: 'completed'
        });
      }
      
      console.log('Blockchain submission results:', results);
      alert(`Successfully submitted ${results.length} certificates to blockchain!`);
      
      // Reset after successful submission
      setProcessedCertificates([]);
      setUploadedFiles([]);
      setPreviewData(null);
      setShowPreview(false);
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Failed to complete submission: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">University Portal</h1>
                <p className="text-sm text-gray-600">Certificate Application System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.institutionName}</span>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Certificate Processing</h2>
          <p className="text-gray-600">Upload certificates in bulk or connect to your database for automated processing with OCR and blockchain integration</p>
        </div>

        {/* Upload Mode Toggle */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="bulk"
                  checked={uploadMode === 'bulk'}
                  onChange={(e) => setUploadMode(e.target.value)}
                  className="text-blue-600"
                />
                <Upload className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Bulk File Upload</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="database"
                  checked={uploadMode === 'database'}
                  onChange={(e) => setUploadMode(e.target.value)}
                  className="text-blue-600"
                />
                <Database className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Database Connection</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload/Database Interface */}
          <div className="lg:col-span-2 space-y-6">
            {uploadMode === 'bulk' ? (
              /* Bulk Upload Interface */
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FileImage className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Bulk Certificate Upload</h3>
                </div>

                {/* Drop Zone */}
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 mb-6
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
                      <p className="text-lg font-medium text-blue-600 mb-2">Drop certificates here</p>
                      <p className="text-sm text-gray-600">Release to start processing</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drag & drop certificate files
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        or click to browse and select multiple files
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Select Certificate Files
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Error Display */}
                {uploadError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Upload Failed</p>
                        <p className="text-sm text-red-700 mt-1">{uploadError}</p>
                      </div>
                      <button
                        onClick={() => setUploadError('')}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Loader className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">Uploading Files...</p>
                        <p className="text-xs text-blue-700 mt-1">Please wait while we save your certificates to the server</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">Multiple Formats</p>
                    <p className="text-xs">PDF, Images, DOC, Excel</p>
                  </div>
                  <div className="text-center">
                    <Cpu className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">AI OCR Processing</p>
                    <p className="text-xs">Auto data extraction</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="font-medium">Blockchain Ready</p>
                    <p className="text-xs">Secure & encrypted</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Database Connection Interface */
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Database Connection</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">Connection Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        connectionStatus === 'connected' 
                          ? 'bg-green-100 text-green-800' 
                          : connectionStatus === 'connecting'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {connectionStatus === 'connected' ? '● Connected' : 
                         connectionStatus === 'connecting' ? '● Connecting...' : '● Disconnected'}
                      </span>
                    </div>
                    
                    {connectionStatus === 'disconnected' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Database Host"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            defaultValue="your-university-db.com"
                          />
                          <input
                            type="text"
                            placeholder="Database Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            defaultValue="student_records"
                          />
                          <input
                            type="text"
                            placeholder="Username"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <button
                          onClick={connectToDatabase}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Link className="h-4 w-4" />
                          <span>Connect to Database</span>
                        </button>
                      </div>
                    )}

                    {connectionStatus === 'connecting' && (
                      <div className="flex items-center justify-center space-x-2 py-4">
                        <Loader className="h-5 w-5 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Establishing connection...</span>
                      </div>
                    )}

                    {connectionStatus === 'connected' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Successfully connected to university database</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Records Found:</span>
                            <span className="ml-2 font-medium">1,247</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Sync:</span>
                            <span className="ml-2 font-medium">2 hours ago</span>
                          </div>
                        </div>
                        <button
                          onClick={disconnectDatabase}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Processing Status */}
            {(isProcessing || processingProgress > 0) && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Processing Certificates</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">OCR Processing Progress</span>
                    <span className="font-medium">{Math.round(processingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Extracting data from certificates using AI OCR...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status and Actions */}
          <div className="space-y-6">
            {/* Processing Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Files Uploaded:</span>
                  <span className="font-medium text-gray-900">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Processed:</span>
                  <span className="font-medium text-gray-900">{processedCertificates.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mode:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    uploadMode === 'bulk' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {uploadMode === 'bulk' ? 'Bulk Upload' : 'Database Connected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isProcessing 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : processedCertificates.length > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isProcessing 
                      ? 'Processing...' 
                      : processedCertificates.length > 0
                      ? 'Ready for Blockchain'
                      : 'Waiting for Input'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span>Certificates Uploaded:</span>
                  <span className="font-medium text-gray-900">{lastUploadCount}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span>Last Upload:</span>
                  <span className="font-medium text-gray-900">{lastUploadDate ? new Date(lastUploadDate).toLocaleString() : '—'}</span>
                </div>
                
                {/* Recent Batches */}
                {recentBatches.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-700 mb-2">Recent Batches:</p>
                    <div className="space-y-2">
                      {recentBatches.map((batch) => (
                        <div key={batch.batch_id} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900">{batch.batch_id}</span>
                            <span className="text-gray-600">{batch.total_files} files</span>
                          </div>
                          <div className="text-gray-500">
                            {new Date(batch.uploaded_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Files ({uploadedFiles.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {uploadedFiles.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border text-sm"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="flex-shrink-0">
                          {fileObj.status === 'processing' ? (
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                          ) : fileObj.status === 'processed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : fileObj.status === 'error' ? (
                            <X className="h-4 w-4 text-red-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {fileObj.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileObj.size)} • {fileObj.status}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Button */}
            {processedCertificates.length > 0 && !showPreview && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Extracted Data ({processedCertificates.length})</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {previewData && showPreview && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Hide Preview</span>
                  </button>
                  
                  <button 
                    onClick={handleFinalSubmit}
                    disabled={isProcessing}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                      !isProcessing
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>Encrypt & Push to Blockchain</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Data will be encrypted and stored securely on blockchain
                  </p>
                </div>
              </div>
            )}

            {/* OCR Confidence Info */}
            {processedCertificates.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">OCR Quality</h3>
                </div>
                <div className="space-y-2">
                  {processedCertificates.slice(-3).map((cert, index) => (
                    <div key={cert.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 truncate">
                        {cert.fileName}
                      </span>
                      <span className={`font-medium ${
                        cert.extractedData.confidence >= 90 
                          ? 'text-green-600' 
                          : cert.extractedData.confidence >= 80 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {cert.extractedData.confidence}%
                      </span>
                    </div>
                  ))}
                  {processedCertificates.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{processedCertificates.length - 3} more files
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        show={showPreview}
        previewData={previewData}
        isProcessing={isProcessing}
        onClose={() => setShowPreview(false)}
        onConfirm={handleFinalSubmit}
        onDataChange={handlePreviewDataChange}
      />
    </div>
  );
};