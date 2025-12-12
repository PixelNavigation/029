import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authAPI = {
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
};
