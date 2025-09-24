import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export const UniversityDashboard = () => {
  const { user, signOut } = useAuthStore();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [applicationData, setApplicationData] = useState({
    studentInfo: {
      fullName: '',
      studentId: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: ''
    },
    academicInfo: {
      course: '',
      specialization: '',
      yearOfAdmission: '',
      yearOfCompletion: '',
      cgpa: '',
      grade: '',
      rollNumber: ''
    },
    certificateInfo: {
      certificateType: '',
      issueDate: '',
      certificateNumber: '',
      verificationCode: '',
      additionalNotes: ''
    }
  });

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type
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

  const handleInputChange = (section, field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const calculateFormCompletion = () => {
    const allFields = [
      // Student Info (6 fields)
      applicationData.studentInfo.fullName,
      applicationData.studentInfo.studentId,
      applicationData.studentInfo.email,
      applicationData.studentInfo.phone,
      applicationData.studentInfo.dateOfBirth,
      applicationData.studentInfo.address,
      
      // Academic Info (7 fields)
      applicationData.academicInfo.course,
      applicationData.academicInfo.specialization,
      applicationData.academicInfo.yearOfAdmission,
      applicationData.academicInfo.yearOfCompletion,
      applicationData.academicInfo.cgpa,
      applicationData.academicInfo.grade,
      applicationData.academicInfo.rollNumber,
      
      // Certificate Info (4 required fields + notes optional)
      applicationData.certificateInfo.certificateType,
      applicationData.certificateInfo.issueDate,
      applicationData.certificateInfo.certificateNumber,
      applicationData.certificateInfo.verificationCode
    ];
    
    const filledFields = allFields.filter(field => field && field.trim() !== '');
    const totalFields = allFields.length;
    
    // Add bonus for uploaded files (up to 10% extra)
    const fileBonus = Math.min(uploadedFiles.length * 2, 10);
    
    const basePercentage = Math.round((filledFields.length / totalFields) * 100);
    const finalPercentage = Math.min(basePercentage + fileBonus, 100);
    
    return finalPercentage;
  };

  const handleSubmit = () => {
    const completionRate = calculateFormCompletion();
    
    if (completionRate < 80) {
      alert(`Please complete more form fields. Current completion: ${completionRate}%`);
      return;
    }
    
    console.log('Application Data:', applicationData);
    console.log('Uploaded Files:', uploadedFiles);
    console.log('Form Completion:', completionRate + '%');
    alert('Application submitted successfully!');
  };

  const certificateTypes = [
    'Degree Certificate',
    'Mark Sheet',
    'Provisional Certificate',
    'Character Certificate',
    'Migration Certificate',
    'Transcript',
    'Diploma Certificate',
    'Course Completion Certificate'
  ];

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
                Welcome, <span className="font-medium">{user?.name}</span>
                {user?.institutionName && (
                  <span className="text-gray-500 ml-2">({user.institutionName})</span>
                )}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Application</h2>
          <p className="text-gray-600">Submit student documents and application details for certificate processing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Application Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={applicationData.studentInfo.fullName}
                    onChange={(e) => handleInputChange('studentInfo', 'fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter student's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={applicationData.studentInfo.studentId}
                    onChange={(e) => handleInputChange('studentInfo', 'studentId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={applicationData.studentInfo.email}
                    onChange={(e) => handleInputChange('studentInfo', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={applicationData.studentInfo.phone}
                    onChange={(e) => handleInputChange('studentInfo', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={applicationData.studentInfo.dateOfBirth}
                    onChange={(e) => handleInputChange('studentInfo', 'dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={applicationData.studentInfo.address}
                    onChange={(e) => handleInputChange('studentInfo', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <input
                    type="text"
                    value={applicationData.academicInfo.course}
                    onChange={(e) => handleInputChange('academicInfo', 'course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., B.Tech, MBA, M.Sc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input
                    type="text"
                    value={applicationData.academicInfo.specialization}
                    onChange={(e) => handleInputChange('academicInfo', 'specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Computer Science, Finance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year of Admission</label>
                  <input
                    type="text"
                    value={applicationData.academicInfo.yearOfAdmission}
                    onChange={(e) => handleInputChange('academicInfo', 'yearOfAdmission', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year of Completion</label>
                  <input
                    type="text"
                    value={applicationData.academicInfo.yearOfCompletion}
                    onChange={(e) => handleInputChange('academicInfo', 'yearOfCompletion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CGPA/Percentage</label>
                  <input
                    type="text"
                    value={applicationData.academicInfo.cgpa}
                    onChange={(e) => handleInputChange('academicInfo', 'cgpa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 8.5 CGPA or 85%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select
                    value={applicationData.academicInfo.grade}
                    onChange={(e) => handleInputChange('academicInfo', 'grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C+">C+ (Above Average)</option>
                    <option value="C">C (Average)</option>
                    <option value="Pass">Pass</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                  <input
                    type="text"
                    value={applicationData.academicInfo.rollNumber}
                    onChange={(e) => handleInputChange('academicInfo', 'rollNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter roll number"
                  />
                </div>
              </div>
            </div>

            {/* Certificate Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Award className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Certificate Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Type</label>
                  <select
                    value={applicationData.certificateInfo.certificateType}
                    onChange={(e) => handleInputChange('certificateInfo', 'certificateType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Certificate Type</option>
                    {certificateTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                  <input
                    type="date"
                    value={applicationData.certificateInfo.issueDate}
                    onChange={(e) => handleInputChange('certificateInfo', 'issueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Number</label>
                  <input
                    type="text"
                    value={applicationData.certificateInfo.certificateNumber}
                    onChange={(e) => handleInputChange('certificateInfo', 'certificateNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter certificate number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={applicationData.certificateInfo.verificationCode}
                    onChange={(e) => handleInputChange('certificateInfo', 'verificationCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Auto-generated verification code"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={applicationData.certificateInfo.additionalNotes}
                    onChange={(e) => handleInputChange('certificateInfo', 'additionalNotes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional information or special requirements"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - File Upload */}
          <div className="space-y-6">
            {/* Document Upload */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
              </div>

              {/* Drop Zone */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 mb-4
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                
                {isDragActive ? (
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Drop files here</p>
                    <p className="text-xs text-gray-600">Release to upload documents</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Drag & drop documents
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      or click to browse
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
              </p>

              {/* Required Documents List */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Required Documents:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Student ID Card</li>
                  <li>• Academic Transcripts</li>
                  <li>• Passport Size Photo</li>
                  <li>• Fee Receipt</li>
                  <li>• Any supporting documents</li>
                </ul>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((fileObj) => (
                      <div
                        key={fileObj.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border text-sm"
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {fileObj.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(fileObj.size)}
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
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>Save as Draft</span>
                </button>
                
                <button 
                  onClick={handleSubmit}
                  disabled={calculateFormCompletion() < 80}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    calculateFormCompletion() >= 80
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={calculateFormCompletion() < 80 ? `Complete ${80 - calculateFormCompletion()}% more to submit` : 'Submit your application'}
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {calculateFormCompletion() >= 100 
                      ? 'Submit Application' 
                      : calculateFormCompletion() >= 80
                      ? `Submit (${calculateFormCompletion()}% complete)`
                      : `Complete Form (${calculateFormCompletion()}%)`
                    }
                  </span>
                </button>
                
                {calculateFormCompletion() < 80 && (
                  <p className="text-xs text-gray-500 text-center">
                    Fill at least 80% of required fields to submit
                  </p>
                )}
              </div>
            </div>

            {/* Application Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Form Completion:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${calculateFormCompletion() >= 80 ? 'text-green-600' : calculateFormCompletion() >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {calculateFormCompletion()}%
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${calculateFormCompletion() >= 80 ? 'bg-green-500' : calculateFormCompletion() >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${calculateFormCompletion()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Documents Uploaded:</span>
                  <span className="font-medium text-gray-900">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Required Fields:</span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const allFields = [
                        applicationData.studentInfo.fullName,
                        applicationData.studentInfo.studentId,
                        applicationData.studentInfo.email,
                        applicationData.studentInfo.phone,
                        applicationData.studentInfo.dateOfBirth,
                        applicationData.studentInfo.address,
                        applicationData.academicInfo.course,
                        applicationData.academicInfo.specialization,
                        applicationData.academicInfo.yearOfAdmission,
                        applicationData.academicInfo.yearOfCompletion,
                        applicationData.academicInfo.cgpa,
                        applicationData.academicInfo.grade,
                        applicationData.academicInfo.rollNumber,
                        applicationData.certificateInfo.certificateType,
                        applicationData.certificateInfo.issueDate,
                        applicationData.certificateInfo.certificateNumber,
                        applicationData.certificateInfo.verificationCode
                      ];
                      const filled = allFields.filter(field => field && field.trim() !== '').length;
                      return `${filled}/${allFields.length} completed`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    calculateFormCompletion() >= 100 
                      ? 'bg-green-100 text-green-800' 
                      : calculateFormCompletion() >= 80 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {calculateFormCompletion() >= 100 
                      ? 'Ready to Submit' 
                      : calculateFormCompletion() >= 80 
                      ? 'Nearly Complete'
                      : 'In Progress'
                    }
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