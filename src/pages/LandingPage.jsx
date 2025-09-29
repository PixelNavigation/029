import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { FileUpload } from '../components/FileUpload';
import { Shield, CheckCircle, Users, Building2, Award } from 'lucide-react';

export const LandingPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileSelect = (files) => {
    setUploadedFiles(files);
    console.log('Files selected:', files);
    // Here you can add logic to handle the uploaded files
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure Verification',
      description: 'Advanced cryptographic methods ensure document authenticity'
    },
    {
      icon: CheckCircle,
      title: 'Instant Validation',
      description: 'Real-time certificate verification with blockchain technology'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Separate portals for students, institutions, and authorities'
    },
    {
      icon: Building2,
      title: 'Institution Network',
      description: 'Connected network of verified educational institutions'
    }
  ];

  const stats = [
    { number: '500+', label: 'Verified Institutions' },
    { number: '1M+', label: 'Certificates Issued' },
    { number: '50K+', label: 'Active Students' },
    { number: '99.9%', label: 'Uptime Reliability' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Academic Certificate
            <span className="text-blue-600"> Verification System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Secure, fast, and reliable verification of academic certificates using blockchain technology. 
            Trusted by institutions worldwide for authentic document verification.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Verify Your Certificate
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload your academic documents for instant verification. Our AI-powered system will process 
              your certificates and generate a comprehensive verification report with blockchain authentication.
            </p>
          </div>
          
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ACVS?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Trusted Globally
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">ACVS</h3>
                  <p className="text-sm text-gray-400">Academic Certificate Verification</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Leading the digital transformation in academic credential verification 
                with secure, blockchain-based technology solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Academic Certificate Verification System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};