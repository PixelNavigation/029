import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth';

export default function SignInStudent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!email || !password) throw new Error('Please enter both email and password');
      const mockUser = {
        id: 'student-1',
        email,
        role: 'student',
        name: 'John Doe',
        studentId: '1608-22-733-130',
        course: 'B.Tech Computer Science',
        year: '4th Year',
        university: 'Osmania University',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      const { setUser } = useAuthStore.getState();
      setUser(mockUser);
    } catch (err) {
      setError(err.message || 'Signin failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="student-email" className="block text-sm font-medium text-gray-700">Email address</label>
        <div className="mt-1">
          <input id="student-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your student email" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
      </div>

      <div>
        <label htmlFor="student-password" className="block text-sm font-medium text-gray-700">Password</label>
        <div className="mt-1">
          <input id="student-password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{isLoading ? 'Signing In...' : 'Sign In'}</button>
      </div>
    </form>
  );
}
