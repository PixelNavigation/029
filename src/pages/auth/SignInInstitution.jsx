import React, { useState, useRef, useEffect } from 'react';
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
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [keyFileName, setKeyFileName] = useState('');
  const [demoPrivateKey, setDemoPrivateKey] = useState('');
  const [demoPublicKey, setDemoPublicKey] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const pub = localStorage.getItem('acvs_demo_univ_pub');
      const priv = localStorage.getItem('acvs_demo_univ_priv');
      if (pub) setDemoPublicKey(pub);
      if (priv) setDemoPrivateKey(priv);
    } catch (e) {}
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

  const handleKeyFile = (file) => {
    setError('');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      try {
        // For demo: treat any selected file as the key (no real crypto).
        const mockKeyMeta = {
          name: file.name,
          size: file.size,
          type: file.type,
          contentPreview: (text || '').slice(0, 256)
        };
        // persist minimal marker so other flows can read that a key was loaded
        localStorage.setItem('acvs_demo_univ_key_meta', JSON.stringify(mockKeyMeta));
        setKeyFileName(file.name);
        // Do NOT auto-login here. User must enter email and click Sign In.
      } catch (err) {
        setError('Failed to load key file: ' + (err.message || err));
      }
    };
    reader.readAsText(file);
  };

  // Mock sign-in triggered by button click. Requires email + loaded key.

  const handleSignIn = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (!keyFileName) {
      setError('Please load a key file from USB/pendrive first');
      return;
    }
    if (!email) {
      setError('Please enter your email before signing in');
      return;
    }

    setSigning(true);
    setTimeout(() => {
      const mockUser = {
        id: 'univ-1',
        email,
        role: 'institution',
        name: 'University Administrator',
        institutionName: email.split('@')[1]?.split('.')[0] || 'University',
        verified: true,
        createdAt: new Date().toISOString(),
        signatureDemo: { keyFile: keyFileName }
      };
      const { setUser } = useAuthStore.getState();
      setUser(mockUser);
      setSigning(false);
    }, 250);
  };

  return (
    <form className="space-y-6" onSubmit={handleSignIn}>
      <div>
        <label htmlFor="institution-email" className="block text-sm font-medium text-gray-700">Email address</label>
        <div className="mt-1">
          <input id="institution-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your university email" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
      </div>

      <div>
        <label htmlFor="institution-password" className="block text-sm font-medium text-gray-700">Password (demo)</label>
        <div className="mt-1">
          <input id="institution-password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter demo password" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Digital Signature</label>
        <div className="mt-1 flex items-center space-x-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-50 hover:bg-gray-100">Load from USB / Pendrive</button>
          <input ref={fileInputRef} type="file" accept=".json,.jwk,.pem,.key,text/plain" onChange={(e) => handleKeyFile(e.target.files && e.target.files[0])} className="hidden" />
          {signing && <div className="text-sm text-gray-600">Signing…</div>}
        </div>
        {keyFileName && <div className="mt-2 text-sm text-gray-700">Loaded key file: <span className="font-medium">{keyFileName}</span></div>}
        <p className="mt-2 text-xs text-gray-500">Select any file from your USB/pendrive (treated as the demo key). Enter your email, then click Sign In to perform a mock login.</p>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <button type="submit" disabled={!keyFileName || !email || !password || signing} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!keyFileName || !email || !password ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {signing ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}
