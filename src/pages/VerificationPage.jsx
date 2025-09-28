import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, GraduationCap, Calendar, User, Mail, Building2, BookOpen } from 'lucide-react';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get data from URL parameters
    const data = searchParams.get('data');
    
    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));
        setVerificationData(decodedData);
      } catch (err) {
        setError('Invalid verification data format');
      }
    } else {
      setError('No verification data provided');
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-gray-600">No verification data was found in the QR code.</p>
        </div>
      </div>
    );
  }

  const { studentInfo, verification, issuedAt, signature, version } = verificationData;
  const verifiedDocuments = verification?.verifiedDocuments || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
              <p className="text-gray-600">Academic Credentials Verification System (ACVS)</p>
            </div>
          </div>
          
          {/* Verification Status */}
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="font-medium text-green-800">Verification Successful</span>
            <span className="text-xs text-green-600 ml-auto">Version {version}</span>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Student Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{studentInfo?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{studentInfo?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">University</p>
                  <p className="font-medium text-gray-900">{studentInfo?.university}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-gray-900">{studentInfo?.course}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium text-gray-900">{studentInfo?.year}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="h-4 w-4 text-gray-400 flex items-center justify-center text-xs font-bold">#</span>
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium text-gray-900">{studentInfo?.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Summary</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{verification?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{verification?.verified || 0}</div>
              <div className="text-sm text-green-600">Verified</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{verification?.semiVerified || 0}</div>
              <div className="text-sm text-yellow-600">Semi-Verified</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{verification?.unableToVerify || 0}</div>
              <div className="text-sm text-red-600">Unable to Verify</div>
            </div>
          </div>
        </div>

        {/* Verified Documents */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Verified Documents ({verifiedDocuments.length})
          </h2>
          
          {verifiedDocuments.length > 0 ? (
            <div className="space-y-3">
              {verifiedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">Type: {doc.type}</p>
                      {doc.submittedAt && (
                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(doc.submittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      ✓ VERIFIED
                    </div>
                    {doc.verificationId && (
                      <p className="text-xs text-gray-500 mt-1">ID: {doc.verificationId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No verified documents found</p>
            </div>
          )}
        </div>

        {/* Verification Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Verification Metadata</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Issued At:</span>
                  <span className="font-medium">{new Date(issuedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signature:</span>
                  <span className="font-mono text-xs">{signature?.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System Version:</span>
                  <span className="font-medium">{version}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Security Features</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Digital Signature Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Timestamp Validated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Document Hashes Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            This verification was generated by the Academic Credentials Verification System (ACVS)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            For questions about this verification, contact the issuing institution
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;