import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
};

export default function SignInInstitution() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Institution type removed, not required
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [keyFileName, setKeyFileName] = useState('');
  const [extractedHashKey, setExtractedHashKey] = useState('');
  const [demoPrivateKey, setDemoPrivateKey] = useState('');
  const [demoPublicKey, setDemoPublicKey] = useState('');
  const fileInputRef = useRef(null);

  // Institution types removed

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'institution') {
        navigate('/institution');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      const pub = localStorage.getItem('acvs_demo_univ_pub');
      const priv = localStorage.getItem('acvs_demo_univ_priv');
      if (pub) setDemoPublicKey(pub);
      if (priv) setDemoPrivateKey(priv);
    } catch (e) { }
  }, []);

  const signAndVerify = async (emailForSigning) => {
    setSigning(true);
    setError('');
    try {
      const privStr = demoPrivateKey || localStorage.getItem('acvs_demo_univ_priv');
      const pubStr = demoPublicKey || localStorage.getItem('acvs_demo_univ_pub');
      if (!privStr || !pubStr) throw new Error('No key loaded');

      const privJwk = JSON.parse(privStr);
      const pubJwk = JSON.parse(pubStr);
      const message = `${emailForSigning}|${Date.now()}`;
      const encoded = new TextEncoder().encode(message);

      const importedPriv = await window.crypto.subtle.importKey('jwk', privJwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
      const signature = await window.crypto.subtle.sign('RSASSA-PKCS1-v1_5', importedPriv, encoded);
      const signatureB64 = arrayBufferToBase64(signature);

      const importedPub = await window.crypto.subtle.importKey('jwk', pubJwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
      const verified = await window.crypto.subtle.verify('RSASSA-PKCS1-v1_5', importedPub, signature, encoded);
      setSigning(false);
      return { verified, signature: signatureB64, message, publicJwk: pubJwk };
    } catch (err) {
      setSigning(false);
      setError('Signing failed: ' + (err.message || err));
      return { verified: false };
    }
  };

  const clearHashKey = () => {
    setExtractedHashKey('');
    setKeyFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyFile = (file) => {
    setError('');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      try {
        // Check if this is a hash key text file from registration
        if (text.includes('Institution Registration Details') && text.includes('SHA256 Hash Key:')) {
          // Extract hash key from the downloaded file
          const hashMatch = text.match(/SHA256 Hash Key:\s*([a-fA-F0-9]+)/);
          if (hashMatch && hashMatch[1]) {
            setExtractedHashKey(hashMatch[1]);
            setKeyFileName(file.name);
            return;
          } else {
            throw new Error('Could not extract hash key from file');
          }
        }

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
          const result = await signAndVerify(email);
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
        const result2 = await signAndVerify(email);
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

  const handleSignIn = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSigning(true);

    try {
      if (!email) {
        throw new Error('Please enter your email before signing in');
      }

      if (!password) {
        throw new Error('Please enter your password');
      }

      // Institution type check removed

      if (!extractedHashKey) {
        throw new Error('Please upload your institution hash key file');
      }

      // Backend API call to verify email, password, and hash key
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/institution/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          hashKey: extractedHashKey
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a hash key verification error
        if (data.error && data.error.toLowerCase().includes('hash')) {
          throw new Error('Error in hash key, please provide correct hash key');
        }
        throw new Error(data.error || 'Sign in failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Sign in failed');
      }

      // Optional: Perform digital signature if private key is available
      let signatureDemo = null;
      if (demoPrivateKey || localStorage.getItem('acvs_demo_univ_priv')) {
        try {
          const result = await signAndVerify(email);
          if (result.verified) {
            signatureDemo = { signature: result.signature, message: result.message, publicJwk: result.publicJwk };
          }
        } catch (err) {
          console.log('Digital signature skipped:', err.message);
        }
      }

      // Create user object with backend data
      const mockUser = {
        id: data.institution?.id || 'univ-1',
        email,
        role: 'institution',
        name: data.institution?.contactPersonName || 'University Administrator',
        institutionName: data.institution?.institutionName || email.split('@')[1]?.split('.')[0] || 'University',
        institutionCode: data.institution?.institutionCode,
        verified: true,
        hashKey: extractedHashKey,
        createdAt: data.institution?.createdAt || new Date().toISOString(),
        signatureDemo: signatureDemo
      };
      const { setUser } = useAuthStore.getState();
      setUser(mockUser);
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setSigning(false);
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
          University Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your university portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignIn}>

            {/* Institution type dropdown removed */}

            <div>
              <label htmlFor="institution-email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="institution-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your university email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="institution-password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  id="institution-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Institution Hash Key File</label>
              <div className="mt-1 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Hash Key File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  onChange={(e) => handleKeyFile(e.target.files && e.target.files[0])}
                  className="hidden"
                />
                {signing && <div className="text-sm text-gray-600">Verifying…</div>}
              </div>
              {keyFileName && extractedHashKey && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-900">Hash key loaded successfully</p>
                        <p className="text-xs text-green-700 mt-0.5">File: {keyFileName}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearHashKey}
                      className="ml-3 inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Clear and upload new hash key"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Upload the hash key file (.txt) you downloaded during registration from your USB/pendrive.
              </p>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={signing}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {signing ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>

        {/* University Registration Option */}
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
      </div>
    </div>
  );
}
