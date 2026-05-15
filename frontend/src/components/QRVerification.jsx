import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { QrScanner } from '@yudiel/react-qr-scanner';

export const QRVerification = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scanActive, setScanActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleQrPayload = async (payload) => {
    if (!payload) return;
    setIsProcessing(true);
    setError('');
    setScanActive(false);

    try {
      let url;
      try {
        url = new URL(payload);
      } catch (err) {
        url = null;
      }

      if (url && url.pathname.startsWith('/document-access/')) {
        if (url.origin === window.location.origin) {
          navigate(url.pathname, { replace: true });
        } else {
          window.location.assign(url.toString());
        }
        return;
      }

      setVerificationResult({
        isValid: false,
        message: 'QR code is not a valid ACVS document access link.'
      });
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const decodeQrFromImage = async (file) => {
    if (!('BarcodeDetector' in window)) {
      throw new Error('QR image scanning is not supported in this browser.');
    }

    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const bitmap = await createImageBitmap(file);
    const results = await detector.detect(bitmap);
    if (bitmap && bitmap.close) bitmap.close();

    if (!results.length) {
      throw new Error('No QR code found in the image.');
    }

    return results[0].rawValue;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file containing a QR code.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const payload = await decodeQrFromImage(file);
      await handleQrPayload(payload);
    } catch (err) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickScan = async () => {
    setError('');
    setScanActive(true);
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setError('');
    setIsProcessing(false);
    setScanActive(false);
  };

  if (verificationResult) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${verificationResult.isValid ? 'bg-green-100' : 'bg-red-100'
            }`}>
            {verificationResult.isValid ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
            {verificationResult.isValid ? 'Certificate Verified ✓' : 'Verification Failed ✗'}
          </h3>
        </div>

        {verificationResult.isValid ? (
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Student:</span>
                <p className="font-medium text-gray-900">{verificationResult.studentName}</p>
              </div>
              <div>
                <span className="text-gray-600">University:</span>
                <p className="font-medium text-gray-900">{verificationResult.university}</p>
              </div>
              <div>
                <span className="text-gray-600">Course:</span>
                <p className="font-medium text-gray-900">{verificationResult.course}</p>
              </div>
              <div>
                <span className="text-gray-600">Year:</span>
                <p className="font-medium text-gray-900">{verificationResult.year}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-green-700">
                Certificate ID: {verificationResult.certificateId} | Verified: {verificationResult.verifiedAt}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-lg p-6 mb-6 text-center">
            <p className="text-red-700">{verificationResult.message || 'This certificate could not be verified. It may be invalid, expired, or not in our system.'}</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={resetVerification}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Verify Another QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
          <QrCode className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          QR Code Verification
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Quickly verify academic certificates by scanning their QR codes or uploading an image.
        </p>
      </div>

      {isProcessing ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying certificate...</p>
        </div>
      ) : scanActive ? (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <QrScanner
            onDecode={handleQrPayload}
            onError={() => setError('Unable to read QR code. Please try again.')}
            constraints={{ facingMode: 'environment' }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Scan Button */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Scan</h3>
            <p className="text-gray-600 mb-4 text-sm">Start camera to scan QR code</p>
            <button
              onClick={handleQuickScan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Scanning
            </button>
          </div>

          {/* Upload Image */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Image</h3>
            <p className="text-gray-600 mb-4 text-sm">Choose image with QR code</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Choose File
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};