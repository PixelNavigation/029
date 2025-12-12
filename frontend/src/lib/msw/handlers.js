import { http, HttpResponse } from 'msw';

// Mock data fixtures
const mockUsers = [
  {
    id: '1',
    email: 'student@example.com',
    role: 'student',
    name: 'John Doe',
    verified: true,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    email: 'admin@university.edu',
    role: 'institution',
    name: 'Dr. Jane Smith',
    institutionId: 'inst-001',
    verified: true,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    email: 'verifier@company.com',
    role: 'verifier',
    name: 'Mike Johnson',
    verified: true,
    createdAt: '2024-01-12T00:00:00Z'
  },
  {
    id: '4',
    email: 'admin@acvs.gov',
    role: 'admin',
    name: 'Sarah Wilson',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockIssuers = [
  {
    id: 'inst-001',
    name: 'MIT (Massachusetts Institute of Technology)',
    type: 'university',
    status: 'verified',
    publicKey: 'mock-public-key-mit',
    contactEmail: 'admin@mit.edu',
    website: 'https://mit.edu',
    establishedYear: 1861,
    accreditation: ['NEASC', 'AACSB'],
    address: {
      street: '77 Massachusetts Avenue',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      postalCode: '02139'
    },
    verifiedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'inst-002',
    name: 'Stanford University',
    type: 'university',
    status: 'verified',
    publicKey: 'mock-public-key-stanford',
    contactEmail: 'admin@stanford.edu',
    website: 'https://stanford.edu',
    establishedYear: 1885,
    accreditation: ['WASC', 'AACSB'],
    address: {
      street: '450 Serra Mall',
      city: 'Stanford',
      state: 'CA',
      country: 'USA',
      postalCode: '94305'
    },
    verifiedAt: '2024-01-01T00:00:00Z'
  }
];

const mockCertificates = [
  {
    id: 'cert-001',
    studentName: 'John Doe',
    rollNo: 'CS2021001',
    courseName: 'Bachelor of Science in Computer Science',
    institutionName: 'MIT (Massachusetts Institute of Technology)',
    institutionId: 'inst-001',
    issueDate: '2024-05-15',
    validFrom: '2024-05-15',
    validTo: '2029-05-15',
    grade: 'A',
    cgpa: 3.85,
    anchorHash: 'sha256:abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012',
    qrSignature: 'mock-signature-001',
    status: 'active',
    issuerId: 'inst-001',
    metadata: {
      fileHash: 'file-hash-001',
      originalFileName: 'john_doe_cs_degree.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024000,
      uploadedAt: '2024-05-15T10:30:00Z',
      verificationCount: 5,
      lastVerified: '2024-09-20T14:20:00Z'
    }
  },
  {
    id: 'cert-002',
    studentName: 'Alice Johnson',
    rollNo: 'EE2020045',
    courseName: 'Master of Science in Electrical Engineering',
    institutionName: 'Stanford University',
    institutionId: 'inst-002',
    issueDate: '2024-06-10',
    validFrom: '2024-06-10',
    grade: 'A+',
    cgpa: 3.92,
    anchorHash: 'sha256:1234abcd5678efgh9012ijkl3456mnop7890qrst1234uvwx5678yzab9012cdef',
    qrSignature: 'mock-signature-002',
    status: 'active',
    issuerId: 'inst-002',
    metadata: {
      fileHash: 'file-hash-002',
      originalFileName: 'alice_johnson_ee_masters.pdf',
      mimeType: 'application/pdf',
      fileSize: 987000,
      uploadedAt: '2024-06-10T15:45:00Z',
      verificationCount: 2,
      lastVerified: '2024-09-15T09:30:00Z'
    }
  }
];

// Mock Student Applications Data
const mockApplications = [
  {
    id: 'app-001',
    studentId: '1',
    universityId: 'inst-001',
    studentName: 'John Doe',
    email: 'student@example.com',
    phone: '+1-555-0123',
    dateOfBirth: '2000-03-15',
    address: {
      street: '123 Main St',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      postalCode: '02101'
    },
    academicHistory: [
      {
        id: 'ed-001',
        institutionName: 'Boston High School',
        degree: 'High School Diploma',
        fieldOfStudy: 'General Studies',
        startDate: '2016-09-01',
        endDate: '2020-06-15',
        gpa: 3.8,
        maxGpa: 4.0,
        isCompleted: true
      }
    ],
    programAppliedFor: 'Master of Science in Computer Science',
    documents: [
      {
        id: 'doc-001',
        type: 'transcript',
        fileName: 'official_transcript.pdf',
        fileUrl: '/documents/transcript_001.pdf',
        uploadedAt: '2024-01-15T10:00:00Z',
        verified: true,
        fileSize: 256000,
        mimeType: 'application/pdf'
      }
    ],
    status: 'under_review',
    submittedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 'app-002',
    studentId: '2',
    universityId: 'inst-001',
    studentName: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1-555-0456',
    dateOfBirth: '1999-08-22',
    address: {
      street: '456 Oak Ave',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      postalCode: '02138'
    },
    academicHistory: [
      {
        id: 'ed-002',
        institutionName: 'Cambridge College',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Mathematics',
        startDate: '2017-09-01',
        endDate: '2021-05-30',
        gpa: 3.95,
        maxGpa: 4.0,
        isCompleted: true
      }
    ],
    programAppliedFor: 'PhD in Applied Mathematics',
    documents: [
      {
        id: 'doc-002',
        type: 'transcript',
        fileName: 'jane_transcript.pdf',
        fileUrl: '/documents/transcript_002.pdf',
        uploadedAt: '2024-01-12T14:30:00Z',
        verified: true,
        fileSize: 312000,
        mimeType: 'application/pdf'
      }
    ],
    status: 'approved',
    submittedAt: '2024-01-12T14:30:00Z',
    reviewedAt: '2024-01-18T11:15:00Z',
    reviewedBy: 'Dr. Jane Smith',
    admissionDecision: {
      decision: 'accepted',
      program: 'PhD in Applied Mathematics',
      startDate: '2024-09-01',
      scholarshipOffered: true,
      scholarshipAmount: 25000,
      deadlineToRespond: '2024-04-15'
    },
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-18T11:15:00Z'
  }
];

// Mock University Programs
const mockPrograms = [
  {
    id: 'prog-001',
    name: 'Master of Science in Computer Science',
    degree: 'master',
    department: 'Computer Science',
    duration: '2 years',
    credits: 36,
    tuitionFee: 55000,
    currency: 'USD',
    eligibilityCriteria: [
      "Bachelor's degree in Computer Science or related field",
      'Minimum GPA of 3.0',
      'GRE scores required',
      'Two letters of recommendation'
    ],
    applicationDeadline: '2024-12-15',
    startDate: '2024-09-01',
    isActive: true,
    description: 'Advanced program focusing on algorithms, machine learning, and software engineering.',
    requirements: [
      { type: 'transcript', required: true, description: 'Official academic transcripts' },
      { type: 'letter_of_recommendation', required: true, description: 'Two letters of recommendation' },
      { type: 'personal_statement', required: true, description: 'Statement of purpose' }
    ]
  },
  {
    id: 'prog-002',
    name: 'PhD in Applied Mathematics',
    degree: 'phd',
    department: 'Mathematics',
    duration: '5-7 years',
    credits: 72,
    tuitionFee: 0,
    currency: 'USD',
    eligibilityCriteria: [
      "Master's degree in Mathematics or related field",
      'Minimum GPA of 3.5',
      'Research experience preferred',
      'Three letters of recommendation'
    ],
    applicationDeadline: '2024-11-30',
    startDate: '2024-09-01',
    isActive: true,
    description: 'Research-focused program with full funding and teaching assistantship opportunities.',
    requirements: [
      { type: 'transcript', required: true, description: 'Official academic transcripts' },
      { type: 'letter_of_recommendation', required: true, description: 'Three letters of recommendation' },
      { type: 'personal_statement', required: true, description: 'Research statement' }
    ]
  }
];

const mockAnalytics = {
  totalCertificates: 1250,
  totalVerifications: 3420,
  totalIssuers: 45,
  totalUsers: 892,
  verificationsToday: 23,
  certificatesIssuedToday: 8,
  trustScoreAverage: 87.5,
  topIssuersByVolume: [
    { issuerId: 'inst-001', issuerName: 'MIT', certificateCount: 320 },
    { issuerId: 'inst-002', issuerName: 'Stanford University', certificateCount: 285 },
    { issuerId: 'inst-003', issuerName: 'Harvard University', certificateCount: 198 }
  ],
  verificationsByDay: [
    { date: '2024-09-18', count: 45 },
    { date: '2024-09-19', count: 52 },
    { date: '2024-09-20', count: 38 },
    { date: '2024-09-21', count: 61 },
    { date: '2024-09-22', count: 43 },
    { date: '2024-09-23', count: 55 },
    { date: '2024-09-24', count: 23 }
  ],
  anomaliesDetected: 12,
  blacklistedIssuers: 3
};

const mockJwk = {
  kty: 'EC',
  crv: 'P-256',
  x: 'MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4',
  y: '4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM',
  use: 'sig',
  key_ops: ['verify'],
  alg: 'ES256'
};

// Helper function to create API responses
const createApiResponse = (data, success = true, message) => ({
  success,
  data: success ? data : undefined,
  message,
  errors: success ? undefined : [message || 'An error occurred']
});

// Helper function to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/signin', async ({ request }) => {
    await delay(800);
    
    const body = await request.json();
    const { email, otp } = body;
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return HttpResponse.json(
        createApiResponse(null, false, 'User not found'),
        { status: 404 }
      );
    }
    
    if (otp && otp !== '123456') {
      return HttpResponse.json(
        createApiResponse(null, false, 'Invalid OTP'),
        { status: 400 }
      );
    }
    
    // First request: send OTP (no OTP provided)
    if (!otp) {
      return HttpResponse.json(
        createApiResponse({ otpSent: true }, true, 'OTP sent to email')
      );
    }
    
    // Second request: verify OTP and return token
    const token = `mock-token-${user.id}-${Date.now()}`;
    
    return HttpResponse.json(
      createApiResponse({ user, token }, true, 'Sign in successful')
    );
  }),

  http.post('/api/auth/signout', async () => {
    await delay(300);
    return HttpResponse.json(
      createApiResponse({}, true, 'Signed out successfully')
    );
  }),

  // Student Application endpoints
  http.get('/api/student/applications', async ({ request }) => {
    await delay(500);
    
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId') || '1';
    
    const studentApplications = mockApplications.filter(app => app.studentId === studentId);
    
    return HttpResponse.json(createApiResponse(studentApplications));
  }),

  http.post('/api/student/applications', async ({ request }) => {
    await delay(1000);
    
    const body = await request.json();
    
    const newApplication = {
      id: `app-${Date.now()}`,
      studentId: '1',
      universityId: body.universityId || 'inst-001',
      ...body,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(createApiResponse(newApplication));
  }),

  http.get('/api/programs', async () => {
    await delay(400);
    return HttpResponse.json(createApiResponse(mockPrograms));
  }),

  // University Dashboard endpoints
  http.get('/api/university/applications', async ({ request }) => {
    await delay(600);
    
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    let applications = [...mockApplications];
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    return HttpResponse.json(createApiResponse(applications));
  }),

  http.put('/api/university/applications/:id', async ({ params, request }) => {
    await delay(500);
    
    const appId = params.id;
    const body = await request.json();
    
    const application = mockApplications.find(app => app.id === appId);
    
    if (!application) {
      return HttpResponse.json(
        createApiResponse(null, false, 'Application not found'),
        { status: 404 }
      );
    }
    
    const updatedApplication = {
      ...application,
      ...body,
      updatedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Dr. Jane Smith'
    };
    
    return HttpResponse.json(createApiResponse(updatedApplication));
  }),

  http.get('/api/university/stats', async () => {
    await delay(400);
    
    const stats = {
      totalApplications: mockApplications.length,
      pendingReview: mockApplications.filter(app => app.status === 'under_review').length,
      approved: mockApplications.filter(app => app.status === 'approved').length,
      rejected: mockApplications.filter(app => app.status === 'rejected').length,
      totalPrograms: mockPrograms.length,
      totalEnrolledStudents: 1250,
      applicationTrends: [
        { month: 'Jan', applications: 45, approved: 32, rejected: 8 },
        { month: 'Feb', applications: 52, approved: 38, rejected: 9 },
        { month: 'Mar', applications: 48, approved: 35, rejected: 7 }
      ]
    };
    
    return HttpResponse.json(createApiResponse(stats));
  }),

  // Certificate verification endpoints
  http.post('/api/verify/qr', async ({ request }) => {
    await delay(1200);
    
    const body = await request.json();
    const { payload } = body;
    
    const certificate = mockCertificates.find(c => c.id === payload.certificateId);
    
    if (!certificate) {
      const result = {
        success: false,
        trustScore: 0,
        checks: [
          {
            name: 'Certificate Lookup',
            status: 'failed',
            description: 'Certificate not found in registry',
          }
        ],
        warnings: [],
        errors: ['Certificate not found'],
        verifiedAt: new Date().toISOString(),
        metadata: {
          method: 'qr_scan',
          processingTimeMs: 1200
        }
      };
      
      return HttpResponse.json(createApiResponse(result));
    }
    
    const issuer = mockIssuers.find(i => i.id === certificate.institutionId);
    
    const result = {
      success: true,
      trustScore: 95,
      certificateId: certificate.id,
      checks: [
        {
          name: 'QR Signature',
          status: 'passed',
          description: 'Digital signature verified successfully',
          details: 'ECDSA P-256 signature valid'
        },
        {
          name: 'Anchor Hash',
          status: 'passed',
          description: 'Certificate hash matches blockchain anchor',
          details: certificate.anchorHash
        },
        {
          name: 'Issuer Status',
          status: 'passed',
          description: 'Issuing institution is verified and active',
          details: issuer?.name || 'Unknown issuer'
        },
        {
          name: 'Revocation Check',
          status: certificate.status === 'revoked' ? 'failed' : 'passed',
          description: certificate.status === 'revoked' 
            ? 'Certificate has been revoked' 
            : 'Certificate is not revoked'
        }
      ],
      warnings: [],
      errors: [],
      verifiedAt: new Date().toISOString(),
      metadata: {
        method: 'qr_scan',
        processingTimeMs: 1200
      }
    };
    
    return HttpResponse.json(createApiResponse(result));
  }),

  // Admin endpoints
  http.get('/api/admin/analytics', async () => {
    await delay(800);
    return HttpResponse.json(createApiResponse(mockAnalytics));
  }),

  http.get('/api/admin/issuers', async () => {
    await delay(600);
    return HttpResponse.json(createApiResponse(mockIssuers));
  })
];

export default handlers;