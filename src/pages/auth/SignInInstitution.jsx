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
        let parsed;
        try { parsed = JSON.parse(text); } catch (j) { parsed = null; }
        if (parsed && parsed.kty) {
          const privStr = JSON.stringify(parsed);
          const pub = { kty: parsed.kty, n: parsed.n, e: parsed.e, alg: parsed.alg };
          const pubStr = JSON.stringify(pub);
          localStorage.setItem('acvs_demo_univ_priv', privStr);
          localStorage.setItem('acvs_demo_univ_pub', pubStr);
          setDemoPrivateKey(privStr);
          setDemoPublicKey(pubStr);
          setKeyFileName(file.name);
        } else {
          const pem = text.trim();
          const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
          const binary = atob(b64);
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
          const der = bytes.buffer;
          const imported = await window.crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['sign']);
          const privJwk = await window.crypto.subtle.exportKey('jwk', imported);
          const pubJwk = { kty: privJwk.kty, n: privJwk.n, e: privJwk.e, alg: privJwk.alg };
          const privStr = JSON.stringify(privJwk);
          const pubStr = JSON.stringify(pubJwk);
          localStorage.setItem('acvs_demo_univ_priv', privStr);
          localStorage.setItem('acvs_demo_univ_pub', pubStr);
          setDemoPrivateKey(privStr);
          setDemoPublicKey(pubStr);
          setKeyFileName(file.name);
        }

        if (!email) {
          setError('Please enter email before loading the key file');
          return;
        }

        const result = await signAndVerify(email);
        if (!result.verified) throw new Error('Digital signature verification failed');
        const mockUser = {
          id: 'univ-1',
          email,
          role: 'institution',
          name: 'University Administrator',
          institutionName: email.split('@')[1]?.split('.')[0] || 'University',
          verified: true,
          createdAt: new Date().toISOString(),
          signatureDemo: { signature: result.signature, message: result.message, publicJwk: result.publicJwk }
        };
        const { setUser } = useAuthStore.getState();
        setUser(mockUser);
      } catch (err) {
        setError('Failed to load key file: ' + (err.message || err));
      }
    };
    reader.readAsText(file);
  };

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); /* nothing: login occurs on key load */ }}>
      <div>
        <label htmlFor="institution-email" className="block text-sm font-medium text-gray-700">Email address</label>
        <div className="mt-1">
          <input id="institution-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your university email" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
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
        <p className="mt-2 text-xs text-gray-500">Select a private key file from your USB/pendrive (JWK JSON or PEM PKCS#8). The login will proceed automatically after loading the key.</p>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <button type="submit" disabled className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-300">Load key to sign</button>
      </div>
    </form>
  );
}
