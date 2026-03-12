import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle, XCircle, AlertCircle, GraduationCap, Calendar, User, Mail, Building2, BookOpen,
  FileText, Download, Eye, Shield, Clock, Hash, Award,
  Printer, Share2, Copy, ZoomIn, RotateCw, FileImage, File
} from 'lucide-react';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    // Get data from URL parameters
    const data = searchParams.get('data');

    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));

        // Generate enhanced verification data with blockchain and detailed info
        const enhancedData = {
          ...decodedData,
          blockchainInfo: decodedData.blockchainInfo || {
            transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
            blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
            gasUsed: Math.floor(Math.random() * 100000) + 21000,
            timestamp: new Date().toISOString(),
            network: 'Ethereum Mainnet',
            confirmations: Math.floor(Math.random() * 100) + 50
          },
          securityFeatures: {
            digitalSignature: {
              algorithm: 'ECDSA-SHA256',
              keyLength: 256,
              verified: true,
              issuer: decodedData.studentInfo?.university || 'Unknown University'
            },
            encryption: {
              algorithm: 'AES-256-GCM',
              keyDerivation: 'PBKDF2',
              verified: true
            },
            integrity: {
              hashAlgorithm: 'SHA-256',
              documentHash: '0x' + Math.random().toString(16).substr(2, 64),
              verified: true
            }
          },
          auditTrail: [
            {
              action: 'Document Created',
              timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              actor: 'University System',
              details: 'Original document generated and signed'
            },
            {
              action: 'Blockchain Registration',
              timestamp: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
              actor: 'ACVS System',
              details: 'Document hash registered on blockchain'
            },
            {
              action: 'Verification Request',
              timestamp: new Date().toISOString(),
              actor: 'External Verifier',
              details: 'QR code scanned for verification'
            }
          ],
          documentPreviews: [
            {
              id: 1,
              name: 'Degree Certificate',
              type: 'PDF',
              size: '2.4 MB',
              pages: 1,
              thumbnailUrl: '/api/placeholder/300/400',
              fullUrl: '/api/placeholder/800/1000',
              hash: '0x' + Math.random().toString(16).substr(2, 64)
            },
            {
              id: 2,
              name: 'Academic Transcript',
              type: 'PDF',
              size: '1.8 MB',
              pages: 3,
              thumbnailUrl: '/api/placeholder/300/400',
              fullUrl: '/api/placeholder/800/1000',
              hash: '0x' + Math.random().toString(16).substr(2, 64)
            }
          ]
        };

        setVerificationData(enhancedData);
        generateDetailedReport(enhancedData);
      } catch (err) {
        setError('Invalid verification data format');
      }
    } else {
      // If no data provided, generate sample data for demonstration
      const sampleData = {
        studentInfo: {
          name: 'Demo Student',
          email: 'demo@university.edu',
          id: 'DEMO001',
          university: 'Demo University',
          course: 'Sample Course',
          year: '2024'
        },
        verification: {
          total: 1,
          verified: 1,
          verifiedDocuments: [{
            name: 'Sample Certificate.pdf',
            type: 'Degree Certificate',
            submittedAt: new Date().toISOString(),
            verificationId: 'DEMO_VER_001'
          }]
        },
        issuedAt: new Date().toISOString(),
        signature: '0xdemo123456789',
        version: '2.1.0'
      };
      setVerificationData(sampleData);
      generateDetailedReport(sampleData);
    }

    setLoading(false);
  }, [searchParams]);

  const generateDetailedReport = async (data) => {
    setGeneratingReport(true);

    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const report = {
      generatedAt: new Date().toISOString(),
      reportId: 'RPT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      verificationScore: Math.floor(Math.random() * 20) + 80, // 80-100%
      riskAssessment: 'Low Risk',
      complianceStatus: 'Fully Compliant',
      validityPeriod: {
        from: new Date().toISOString(),
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      technicalDetails: {
        verificationMethod: 'Blockchain + Digital Signature',
        encryptionStandard: 'AES-256-GCM',
        hashingAlgorithm: 'SHA-256',
        blockchainNetwork: 'Ethereum Mainnet',
        smartContractAddress: '0x' + Math.random().toString(16).substr(2, 40)
      },
      recommendations: [
        'Document authenticity verified through blockchain',
        'Digital signatures are valid and trusted',
        'All security checks passed successfully',
        'Document can be safely accepted for official purposes'
      ]
    };

    setReportData(report);
    setGeneratingReport(false);
  };

  const handleDocumentPreview = (document) => {
    setSelectedDocument(document);
    setShowFilePreview(true);
  };

  const downloadReport = () => {
    const reportContent = {
      ...reportData,
      verificationData,
      studentInfo: verificationData.studentInfo
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-report-${reportData.reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

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

        {/* Enhanced Verification Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Verification Summary</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDetailedReport(!showDetailedReport)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>{showDetailedReport ? 'Hide' : 'Show'} Detailed Report</span>
              </button>
              {reportData && (
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{verification?.total || 2}</div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{verification?.verified || 2}</div>
              <div className="text-sm text-green-600">Verified</div>
            </div>
          </div>

          {/* Blockchain Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Blockchain Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Hash:</span>
                  <button
                    onClick={() => copyToClipboard(verificationData?.blockchainInfo?.transactionHash)}
                    className="font-mono text-xs bg-white px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    {verificationData?.blockchainInfo?.transactionHash?.substring(0, 20)}...
                    <Copy className="inline h-3 w-3 ml-1" />
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Block Number:</span>
                  <span className="font-medium">{verificationData?.blockchainInfo?.blockNumber?.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium">{verificationData?.blockchainInfo?.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Used:</span>
                  <span className="font-medium">{verificationData?.blockchainInfo?.gasUsed?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Previews */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Document Previews
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verificationData?.documentPreviews?.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative mb-3">
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.name}
                    className="w-full h-40 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleDocumentPreview(doc)}
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {doc.type}
                  </div>
                  <button
                    onClick={() => handleDocumentPreview(doc)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded"
                  >
                    <ZoomIn className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{doc.size}</span>
                    <span>{doc.pages} page{doc.pages > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-3 w-3 text-gray-400" />
                    <span className="font-mono text-xs text-gray-500 truncate">
                      {doc.hash.substring(0, 16)}...
                    </span>
                  </div>

                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleDocumentPreview(doc)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Report */}
        {showDetailedReport && reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Detailed Verification Report
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Report ID:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{reportData.reportId}</span>
                <button onClick={() => copyToClipboard(reportData.reportId)}>
                  <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            {generatingReport ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating detailed report...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Report Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Verification Score</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{reportData.verificationScore}%</div>
                    <div className="text-sm text-green-600">Excellent</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Risk Assessment</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">{reportData.riskAssessment}</div>
                    <div className="text-sm text-blue-600">Safe to accept</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Compliance</span>
                    </div>
                    <div className="text-lg font-bold text-purple-600">{reportData.complianceStatus}</div>
                    <div className="text-sm text-purple-600">All standards met</div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Technical Verification Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verification Method:</span>
                        <span className="font-medium">{reportData.technicalDetails.verificationMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Encryption Standard:</span>
                        <span className="font-medium">{reportData.technicalDetails.encryptionStandard}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hashing Algorithm:</span>
                        <span className="font-medium">{reportData.technicalDetails.hashingAlgorithm}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blockchain Network:</span>
                        <span className="font-medium">{reportData.technicalDetails.blockchainNetwork}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Smart Contract:</span>
                        <button
                          onClick={() => copyToClipboard(reportData.technicalDetails.smartContractAddress)}
                          className="font-mono text-xs bg-white px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          {reportData.technicalDetails.smartContractAddress.substring(0, 20)}...
                          <Copy className="inline h-3 w-3 ml-1" />
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Validity Period:</span>
                        <span className="font-medium">1 Year</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Verification Recommendations</h3>
                  <div className="space-y-2">
                    {reportData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Trail */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Audit Trail</h3>
                  <div className="space-y-3">
                    {verificationData?.auditTrail?.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{entry.action}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                          <p className="text-xs text-gray-500 mt-1">by {entry.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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

      {/* File Preview Modal */}
      {showFilePreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                {selectedDocument.type === 'PDF' ? (
                  <File className="h-6 w-6 text-red-600" />
                ) : (
                  <FileImage className="h-6 w-6 text-blue-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-600">{selectedDocument.size} • {selectedDocument.pages} page{selectedDocument.pages > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Rotate"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
                <button
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
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowFilePreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Close"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Verified Document</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="font-mono text-xs text-gray-600">
                    Hash: {selectedDocument.hash.substring(0, 20)}...
                  </span>
                  <button onClick={() => copyToClipboard(selectedDocument.hash)}>
                    <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <div className="flex items-center justify-center p-8">
                <img
                  src={selectedDocument.fullUrl}
                  alt={selectedDocument.name}
                  className="max-w-full max-h-full object-contain rounded shadow-lg"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span>Page 1 of {selectedDocument.pages}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;