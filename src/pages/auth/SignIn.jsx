import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import SignInAdmin from './SignInAdmin';
import SignInStudent from './SignInStudent';
import SignInInstitution from './SignInInstitution';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoPublicKey, setDemoPublicKey] = useState('');
  const [demoPrivateKey, setDemoPrivateKey] = useState('');
  const [signing, setSigning] = useState(false);
  const [keyFileName, setKeyFileName] = useState('');
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the role from navigation state
  const selectedRole = location.state?.role;
  const successMessage = location.state?.message;

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'institution':
          navigate('/institution');
          break;
        case 'verifier':
          navigate('/verifier');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, navigate]);

  // Load demo keys from localStorage if present
  useEffect(() => {
    try {
      const pub = localStorage.getItem('acvs_demo_univ_pub');
      const priv = localStorage.getItem('acvs_demo_univ_priv');
      if (pub) setDemoPublicKey(pub);
      if (priv) setDemoPrivateKey(priv);
    } catch (e) {
      // ignore
    }
  }, []);

  // Web Crypto helpers
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  

  // load key from a file (JWK JSON or PEM PKCS#8) and auto sign/verify+login
  const handleKeyFile = (file) => {
    setError('');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      try {
        // try JSON JWK first
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (jsonErr) {
          parsed = null;
        }

        if (parsed && parsed.kty) {
          // assume full JWK (private) provided
          const privStr = JSON.stringify(parsed);
          const pub = { kty: parsed.kty, n: parsed.n, e: parsed.e, alg: parsed.alg };
          const pubStr = JSON.stringify(pub);
          localStorage.setItem('acvs_demo_univ_priv', privStr);
          localStorage.setItem('acvs_demo_univ_pub', pubStr);
          setDemoPrivateKey(privStr);
          setDemoPublicKey(pubStr);
          setKeyFileName(file.name);

          // attempt sign/verify and login immediately
          if (!email) {
            setError('Please enter email before loading the key file');
            return;
          }
          const result = await signAndVerifyDemo(email);
          if (!result.verified) throw new Error('Digital signature verification failed (from file)');
          const mockUser = {
            id: 'univ-1',
            email: email,
            role: 'institution',
            name: 'University Administrator',
            institutionName: email.split('@')[1]?.split('.')[0] || 'University',
            verified: true,
            createdAt: new Date().toISOString(),
            signatureDemo: { signature: result.signature, message: result.message, publicJwk: result.publicJwk }
          };
          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
          return;
        }

        // else treat as PEM (PKCS#8)
        const pem = text.trim();
        const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        const der = bytes.buffer;

        // import private key in pkcs8 format
        const imported = await window.crypto.subtle.importKey(
          'pkcs8',
          der,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          true,
          ['sign']
        );

        // export as JWK (private contains public params too)
        const privJwk = await window.crypto.subtle.exportKey('jwk', imported);
        const pubJwk = { kty: privJwk.kty, n: privJwk.n, e: privJwk.e, alg: privJwk.alg };
        const privStr = JSON.stringify(privJwk);
        const pubStr = JSON.stringify(pubJwk);
        localStorage.setItem('acvs_demo_univ_priv', privStr);
        localStorage.setItem('acvs_demo_univ_pub', pubStr);
        setDemoPrivateKey(privStr);
        setDemoPublicKey(pubStr);
        setKeyFileName(file.name);

        // attempt sign/verify and login immediately
        if (!email) {
          setError('Please enter email before loading the key file');
          return;
        }
        const result2 = await signAndVerifyDemo(email);
        if (!result2.verified) throw new Error('Digital signature verification failed (from file)');
        const mockUser2 = {
          id: 'univ-1',
          email: email,
          role: 'institution',
          name: 'University Administrator',
          institutionName: email.split('@')[1]?.split('.')[0] || 'University',
          verified: true,
          createdAt: new Date().toISOString(),
          signatureDemo: { signature: result2.signature, message: result2.message, publicJwk: result2.publicJwk }
        };
        const { setUser } = useAuthStore.getState();
        setUser(mockUser2);
      } catch (err) {
        setError('Failed to load key file: ' + (err.message || err));
      }
    };
    reader.readAsText(file);
  };

  const signAndVerifyDemo = async (emailForSigning) => {
    setSigning(true);
    setError('');
    try {
      const privStr = demoPrivateKey || localStorage.getItem('acvs_demo_univ_priv');
      const pubStr = demoPublicKey || localStorage.getItem('acvs_demo_univ_pub');
      if (!privStr || !pubStr) throw new Error('No demo key pair available. Generate one first.');

      const privJwk = JSON.parse(privStr);
      const pubJwk = JSON.parse(pubStr);

      const message = `${emailForSigning}|${Date.now()}`;
      const encoded = new TextEncoder().encode(message);

      const importedPriv = await window.crypto.subtle.importKey(
        'jwk',
        privJwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign('RSASSA-PKCS1-v1_5', importedPriv, encoded);
      const signatureB64 = arrayBufferToBase64(signature);

      const importedPub = await window.crypto.subtle.importKey(
        'jwk',
        pubJwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const verified = await window.crypto.subtle.verify('RSASSA-PKCS1-v1_5', importedPub, signature, encoded);
      setSigning(false);
      return { verified, signature: signatureB64, message, publicJwk: pubJwk };
    } catch (err) {
      setSigning(false);
      setError('Signing failed: ' + (err.message || err));
      return { verified: false };
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For Central Authority, use direct email/password login
      if (selectedRole === 'admin') {
        if (email && password) {
          const mockUser = {
            id: 'admin-1',
            email: email,
            role: 'admin',
            name: 'Central Administrator',
            verified: true,
            createdAt: new Date().toISOString()
          };

          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
        } else {
          throw new Error('Please enter both email and password');
        }

      // For Student, use direct email/password login
      } else if (selectedRole === 'student') {
        if (email && password) {
          const mockUser = {
            id: 'student-1',
            email: email,
            role: 'student',
            name: 'John Doe',
            studentId: '1608-22-733-130',
            course: 'B.Tech Computer Science',
            year: '4th Year',
            university: 'Osmania University',
            profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            verified: true,
            createdAt: new Date().toISOString(),
            socialLinks: {
              linkedin: 'https://linkedin.com/in/johndoe',
              github: 'https://github.com/johndoe',
              portfolio: 'https://johndoe.dev'
            }
          };

          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
        } else {
          throw new Error('Please enter both email and password');
        }

      // For University, use email and digital signature (demo)
      } else if (selectedRole === 'institution') {
        // For institution: require a key loaded from USB/pendrive (stored in localStorage)
        if (demoPrivateKey || localStorage.getItem('acvs_demo_univ_priv')) {
          const result = await signAndVerifyDemo(email);
          if (!result.verified) throw new Error('Digital signature verification failed (from stored key)');

          const mockUser = {
            id: 'univ-1',
            email: email,
            role: 'institution',
            name: 'University Administrator',
            institutionName: email.split('@')[1]?.split('.')[0] || 'University',
            verified: true,
            createdAt: new Date().toISOString(),
            signatureDemo: { signature: result.signature, message: result.message, publicJwk: result.publicJwk }
          };
          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
        } else {
          throw new Error('Please load your private key from USB/pendrive before signing in');
        }

      // No role provided: basic email/password infer role by domain
      } else if (!selectedRole) {
        if (email && password) {
          let mockUser;

          if (email.includes('@admin') || email.includes('@central')) {
            mockUser = {
              id: 'admin-1',
              email: email,
              role: 'admin',
              name: 'Central Administrator',
              verified: true,
              createdAt: new Date().toISOString()
            };
          } else if (email.includes('@university') || email.includes('@edu')) {
            mockUser = {
              id: 'univ-1',
              email: email,
              role: 'institution',
              name: 'University Administrator',
              institutionName: email.split('@')[1]?.split('.')[0] || 'University',
              verified: true,
              createdAt: new Date().toISOString()
            };
          } else {
            mockUser = {
              id: 'student-1',
              email: email,
              role: 'student',
              name: 'John Doe',
              studentId: '1608-22-733-130',
              course: 'B.Tech Computer Science',
              year: '4th Year',
              university: 'Osmania University',
              profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              verified: true,
              createdAt: new Date().toISOString(),
              socialLinks: {
                linkedin: 'https://linkedin.com/in/johndoe',
                github: 'https://github.com/johndoe',
                portfolio: 'https://johndoe.dev'
              }
            };
          }

          const { setUser } = useAuthStore.getState();
          setUser(mockUser);
        } else {
          throw new Error('Please enter both email and password');
        }

      } else {
        // Fallback: attempt signIn (if any extra flow provided by store)
        const result = await signIn(email);
        if (result?.otpSent) {
          // OTP not implemented in UI; inform user
          throw new Error('OTP flow is not available in this demo. Use email/password or select your role.');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleTitle = (role) => {
    switch (role) {
      case 'admin': return 'Central Authority';
      case 'student': return 'Student';
      case 'institution': return 'University';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header with back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link 
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {selectedRole ? `${getRoleTitle(selectedRole)} Sign In` : 'Sign In to ACVS'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {selectedRole ? `Access your ${getRoleTitle(selectedRole).toLowerCase()} portal` : 'Sign in to your account'}
        </p>
        
        {/* Show role selection hint when no role is provided */}
        {!selectedRole && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              💡 For a better experience, please{' '}
              <Link to="/" className="font-medium underline hover:text-blue-900">
                select your role from the homepage
              </Link>{' '}
              before signing in.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Registration Successful!
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* If a specific role is selected, render the dedicated component */}
          {selectedRole === 'admin' && <SignInAdmin />}
          {selectedRole === 'student' && <SignInStudent />}
          {selectedRole === 'institution' && <SignInInstitution />}

          {/* Generic form when no role is selected */}
          {!selectedRole && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Show password field for Central Authority, Student, or when no role is selected (default to password) */}
            {(selectedRole === 'admin' || selectedRole === 'student' || !selectedRole) && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            )}

            {/* Show digital signature file loader only for University */}
            {selectedRole === 'institution' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Digital Signature</label>
                <div className="mt-1 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-50 hover:bg-gray-100"
                  >
                    Load from USB / Pendrive
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.jwk,.pem,.key,text/plain"
                    onChange={(e) => handleKeyFile(e.target.files && e.target.files[0])}
                    className="hidden"
                  />
                  {signing && <div className="text-sm text-gray-600">Signing…</div>}
                </div>

                {keyFileName && (
                  <div className="mt-2 text-sm text-gray-700">Loaded key file: <span className="font-medium">{keyFileName}</span></div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Select a private key file from your USB/pendrive (JWK JSON or PEM PKCS#8). The login will proceed automatically after loading the key.
                </p>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            </form>
          )}
        </div>

        {/* University Registration Option */}
        {selectedRole === 'institution' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New university? Need to register your institution?
            </p>
            <Link
              to="/auth/university-signup"
              className="mt-2 inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Register Your University
            </Link>
            <p className="mt-2 text-xs text-gray-500">
              Complete verification process to join ACVS
            </p>
          </div>
        )}
      </div>
    </div>
  );
};