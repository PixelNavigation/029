import QRCode from 'qrcode';

/**
 * Encode data as QR code payload string
 */
export const encodeQrPayload = (payload) => {
  return JSON.stringify(payload);
};

/**
 * Decode QR code payload string
 */
export const decodeQrPayload = (payloadString) => {
  try {
    return JSON.parse(payloadString);
  } catch (error) {
    throw new Error('Invalid QR payload format');
  }
};

/**
 * Generate QR code as data URL
 */
export const generateQrCode = async (payload, options = {}) => {
  const payloadString = encodeQrPayload(payload);
  
  const qrOptions = {
    width: options?.size || 512,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  };
  
  try {
    return await QRCode.toDataURL(payloadString, qrOptions);
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

/**
 * Generate QR code as PNG buffer (for server-side or download)
 */
export const generateQrCodePng = async (payload, options = {}) => {
  const payloadString = encodeQrPayload(payload);
  
  const qrOptions = {
    width: options?.size || 512,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  };
  
  try {
    return await QRCode.toBuffer(payloadString, qrOptions);
  } catch (error) {
    throw new Error(`Failed to generate QR code buffer: ${error}`);
  }
};

/**
 * Validate QR payload structure
 */
export const validateQrPayload = (payload) => {
  return (
    payload &&
    typeof payload.version === 'string' &&
    typeof payload.certificateId === 'string' &&
    typeof payload.anchorHash === 'string' &&
    typeof payload.issuerId === 'string' &&
    typeof payload.issuedAt === 'string' &&
    typeof payload.signature === 'string'
  );
};

/**
 * Validate student portfolio QR payload structure
 */
export const validateStudentPortfolioPayload = (payload) => {
  return (
    payload &&
    typeof payload.subjectDid === 'string' &&
    typeof payload.studentName === 'string' &&
    typeof payload.totalCertificates === 'number' &&
    typeof payload.lastUpdated === 'string' &&
    typeof payload.portfolioHash === 'string' &&
    typeof payload.signature === 'string'
  );
};

/**
 * Create a sample QR payload for testing
 */
export const createSampleQrPayload = () => ({
  version: '1.0',
  certificateId: 'cert-sample-001',
  anchorHash: 'sha256:abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012',
  issuerId: 'inst-001',
  issuedAt: '2024-05-15T10:30:00Z',
  expiresAt: '2029-05-15T10:30:00Z',
  signature: 'sample-ecdsa-signature-base64url-encoded'
});

/**
 * Create a sample student portfolio payload for testing
 */
export const createSamplePortfolioPayload = () => ({
  subjectDid: 'did:example:student1',
  studentName: 'John Doe',
  totalCertificates: 3,
  lastUpdated: new Date().toISOString(),
  portfolioHash: 'sha256:portfolio-hash-sample',
  signature: 'sample-portfolio-signature'
});

/**
 * Download QR code as PNG file
 */
export const downloadQrCode = async (payload, filename = 'certificate-qr.png', options) => {
  try {
    const dataUrl = await generateQrCode(payload, options);
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new Error(`Failed to download QR code: ${error}`);
  }
};