import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authAPI = {
  // Upload profile photo to Supabase
  uploadProfilePhoto: async (photoFile, studentId) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('studentId', studentId);
    
    const response = await axios.post(`${API_URL}/api/upload-profile-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Upload student certificate to Supabase
  uploadCertificate: async (file, studentId, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);
    formData.append('documentType', documentType);
    
    const response = await axios.post(`${API_URL}/api/student/upload-certificate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get student certificates from Supabase
  getCertificates: async (studentId) => {
    const response = await axios.get(`${API_URL}/api/student/certificates/${studentId}`);
    return response.data;
  },

  // Student signup
  signupStudent: async (studentData) => {
    const response = await axios.post(`${API_URL}/api/auth/signup`, studentData);
    return response.data;
  },

  // Student signin
  signinStudent: async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/signin`, {
      email,
      password,
      role: 'student'
    });
    return response.data;
  }
,

  // Fetch public profile by studentId
  getPublicProfile: async (studentId) => {
    const response = await axios.get(`${API_URL}/api/public_profiles/${encodeURIComponent(studentId)}`);
    return response.data;
  }
};

export const institutionAPI = {
  // Upload bulk certificates
  uploadCertificates: async (files, institutionId, institutionName) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files[]', file);
    });
    
    formData.append('institution_id', institutionId || 'unknown');
    formData.append('institution_name', institutionName || 'Unknown Institution');
    
    const response = await axios.post(`${API_URL}/api/institution/upload-certificates`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });
    
    return response.data;
  },

  // Get all uploads
  getUploads: async (institutionId) => {
    const params = institutionId ? { institution_id: institutionId } : {};
    const response = await axios.get(`${API_URL}/api/institution/uploads`, { params });
    return response.data;
  }
};
