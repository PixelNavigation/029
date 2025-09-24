/**
 * Download text content as a file
 */
export const downloadText = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
};

/**
 * Download JSON data as a file
 */
export const downloadJson = (data, filename) => {
  const content = JSON.stringify(data, null, 2);
  downloadText(content, filename, 'application/json');
};

/**
 * Download CSV data as a file
 */
export const downloadCsv = (data, filename) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');
  
  downloadText(csvContent, filename, 'text/csv');
};

/**
 * Download blob as a file
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Download file from URL
 */
export const downloadFromUrl = async (url, filename) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const downloadFilename = filename || extractFilenameFromUrl(url) || 'download';
    
    downloadBlob(blob, downloadFilename);
  } catch (error) {
    throw new Error(`Download failed: ${error}`);
  }
};

/**
 * Extract filename from URL
 */
export const extractFilenameFromUrl = (url) => {
  try {
    const pathname = new URL(url).pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1) || 'download';
  } catch {
    return 'download';
  }
};

/**
 * Create and download a CSV template for bulk certificate upload
 */
export const downloadCertificateTemplate = () => {
  const template = [
    {
      studentName: 'John Doe',
      rollNo: 'CS2021001',
      courseName: 'Bachelor of Science in Computer Science',
      issueDate: '2024-05-15',
      validFrom: '2024-05-15',
      validTo: '2029-05-15',
      grade: 'A',
      cgpa: '3.85'
    },
    {
      studentName: 'Jane Smith',
      rollNo: 'EE2021002',
      courseName: 'Bachelor of Engineering in Electrical Engineering',
      issueDate: '2024-05-20',
      validFrom: '2024-05-20',
      validTo: '2029-05-20',
      grade: 'A+',
      cgpa: '3.92'
    }
  ];
  
  downloadCsv(template, 'certificate-template.csv');
};

/**
 * Create and download verification results as CSV
 */
export const downloadVerificationResults = (results) => {
  downloadCsv(results, `verification-results-${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Generate and download a certificate report
 */
export const downloadCertificateReport = (certificates) => {
  const reportData = certificates.map(cert => ({
    'Certificate ID': cert.id,
    'Student Name': cert.studentName,
    'Roll Number': cert.rollNo,
    'Course': cert.courseName,
    'Institution': cert.institutionName,
    'Issue Date': cert.issueDate,
    'Valid From': cert.validFrom,
    'Valid To': cert.validTo || 'No expiry',
    'Grade': cert.grade || 'N/A',
    'CGPA': cert.cgpa || 'N/A',
    'Status': cert.status,
    'Verification Count': cert.metadata?.verificationCount || 0,
    'Last Verified': cert.metadata?.lastVerified || 'Never'
  }));
  
  downloadCsv(reportData, `certificate-report-${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Utility to format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};