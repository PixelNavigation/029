import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, Building2, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    const routes = {
      institution: '/auth/signin-institution',
      student: '/auth/signin-student'
    };
    navigate(routes[role] || '/auth/signin');
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ACVS</h1>
                <p className="text-xs text-gray-600">Academic Certificate Verification</p>
              </div>
            </Link>
          </div>

          {/* Right side - Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Always show login buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleLogin('institution')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <Building2 className="h-4 w-4" />
                <span>University Login</span>
              </button>

              <button
                onClick={() => handleLogin('student')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student Login</span>
              </button>

              {/* Show user info and sign out if logged in */}
              {user && (
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                  <div className="text-sm">
                    <span className="text-gray-700">Welcome, </span>
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({user.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            {/* Always show login buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleLogin('institution')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Building2 className="h-5 w-5" />
                <span className="font-medium">University Login</span>
              </button>

              <button
                onClick={() => handleLogin('student')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <GraduationCap className="h-5 w-5" />
                <span className="font-medium">Student Login</span>
              </button>
            </div>

            {/* Show user info and sign out if logged in */}
            {user && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="text-sm">
                  <span className="text-gray-700">Welcome, </span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500 block">({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};