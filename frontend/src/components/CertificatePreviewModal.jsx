import {
  X,
  Eye,
  User,
  GraduationCap,
  Award,
  FileCheck,
  Calendar,
  Shield,
  Loader,
  Save,
  FileText
} from 'lucide-react';

export const CertificatePreviewModal = ({
  show,
  previewData,
  isProcessing,
  onClose,
  onConfirm,
  onDataChange
}) => {
  if (!show || !previewData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Extracted Certificate Data Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {previewData.map((cert, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {cert.original_filename || cert.file_name}
                      </h3>
                      {cert.error && (
                        <span className="text-xs text-red-600">Error: {cert.error}</span>
                      )}
                    </div>
                  </div>
                  {cert.preview_url && (
                    <a
                      href={`http://localhost:5000${cert.preview_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View File</span>
                    </a>
                  )}
                </div>

                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Student Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center text-sm mb-3">
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        Student Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <input
                            type="text"
                            value={cert.student_name || ''}
                            onChange={(e) => onDataChange(index, 'student_name', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-gray-600">Student ID:</span>
                          <input
                            type="text"
                            value={cert.student_id || ''}
                            onChange={(e) => onDataChange(index, 'student_id', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Academic Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center text-sm mb-3">
                        <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                        Academic Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">University:</span>
                          <input
                            type="text"
                            value={cert.university_name || ''}
                            onChange={(e) => onDataChange(index, 'university_name', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-gray-600">Course:</span>
                          <input
                            type="text"
                            value={cert.course_name || ''}
                            onChange={(e) => onDataChange(index, 'course_name', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-gray-600">Specialization:</span>
                          <input
                            type="text"
                            value={cert.specialization || ''}
                            onChange={(e) => onDataChange(index, 'specialization', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center text-sm mb-3">
                        <Award className="h-4 w-4 mr-2 text-blue-600" />
                        Results
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">CGPA:</span>
                          <input
                            type="text"
                            value={cert.cgpa || ''}
                            onChange={(e) => onDataChange(index, 'cgpa', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-gray-600">Year:</span>
                          <input
                            type="text"
                            value={cert.year_of_passing || ''}
                            onChange={(e) => onDataChange(index, 'year_of_passing', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center text-sm mb-3">
                        <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                        Certificate Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Degree Type:</span>
                          <input
                            type="text"
                            value={cert.degree_type || ''}
                            onChange={(e) => onDataChange(index, 'degree_type', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-gray-600">Certificate #:</span>
                          <input
                            type="text"
                            value={cert.certificate_number || ''}
                            onChange={(e) => onDataChange(index, 'certificate_number', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center text-sm mb-3">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        Date
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Issue Date:</span>
                          <input
                            type="text"
                            value={cert.issue_date || ''}
                            onChange={(e) => onDataChange(index, 'issue_date', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Authority */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center text-sm mb-3">
                        <Shield className="h-4 w-4 mr-2 text-blue-600" />
                        Issuing Organization
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Organization:</span>
                          <input
                            type="text"
                            value={cert.issuing_authority || ''}
                            onChange={(e) => onDataChange(index, 'issuing_authority', e.target.value)}
                            className="ml-2 px-2 py-1 border rounded text-sm w-full mt-1"
                            placeholder="e.g., Osmania University"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject Grades Section */}
                  {cert.subject_grades && cert.subject_grades.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 flex items-center text-sm mb-3">
                        <Award className="h-4 w-4 mr-2 text-green-600" />
                        Subject-wise Grades
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Subject</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Grade</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Marks</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Credits</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {cert.subject_grades.map((subject, subIdx) => (
                              <tr key={subIdx}>
                                <td className="px-3 py-2">{subject.subject_name || '-'}</td>
                                <td className="px-3 py-2">{subject.grade || '-'}</td>
                                <td className="px-3 py-2">{subject.marks || '-'}</td>
                                <td className="px-3 py-2">{subject.credits || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t p-6 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{previewData.length}</span> certificate(s) ready to save
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${!isProcessing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Confirm & Upload to Blockchain</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
