// Type definitions converted from TypeScript to JSDoc

/**
 * @typedef {'student' | 'institution' | 'verifier' | 'admin'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {UserRole} role
 * @property {string} name
 * @property {string} [institutionId]
 * @property {boolean} verified
 * @property {string} createdAt
 */

/**
 * @typedef {'active' | 'revoked' | 'expired' | 'pending'} CertificateStatus
 */

/**
 * @typedef {Object} CertificateMetadata
 * @property {string} fileHash
 * @property {string} [originalFileName]
 * @property {string} mimeType
 * @property {number} fileSize
 * @property {string} uploadedAt
 * @property {number} verificationCount
 * @property {string} [lastVerified]
 */

/**
 * @typedef {Object} Certificate
 * @property {string} id
 * @property {string} studentName
 * @property {string} rollNo
 * @property {string} courseName
 * @property {string} institutionName
 * @property {string} institutionId
 * @property {string} issueDate
 * @property {string} validFrom
 * @property {string} [validTo]
 * @property {string} [grade]
 * @property {number} [cgpa]
 * @property {string} anchorHash
 * @property {string} qrSignature
 * @property {CertificateStatus} status
 * @property {string} issuerId
 * @property {CertificateMetadata} metadata
 * @property {string} [revocationReason]
 * @property {string} [revokedAt]
 */

/**
 * @typedef {'verified' | 'pending' | 'blacklisted' | 'suspended'} IssuerStatus
 */

/**
 * @typedef {Object} Address
 * @property {string} street
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} postalCode
 */

/**
 * @typedef {Object} Issuer
 * @property {string} id
 * @property {string} name
 * @property {'university' | 'college' | 'school' | 'training_center' | 'government'} type
 * @property {IssuerStatus} status
 * @property {string} publicKey
 * @property {string} contactEmail
 * @property {string} [website]
 * @property {number} [establishedYear]
 * @property {string[]} accreditation
 * @property {Address} address
 * @property {string} [verifiedAt]
 * @property {string} [blacklistedAt]
 * @property {string} [blacklistReason]
 */

/**
 * @typedef {Object} VerificationCheck
 * @property {string} name
 * @property {'passed' | 'failed' | 'warning' | 'skipped'} status
 * @property {string} description
 * @property {string} [details]
 */

/**
 * @typedef {Object} VerificationMetadata
 * @property {'qr_scan' | 'file_upload'} method
 * @property {string} [clientIp]
 * @property {string} [userAgent]
 * @property {string} [location]
 * @property {number} processingTimeMs
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} success
 * @property {number} trustScore
 * @property {string} [certificateId]
 * @property {VerificationCheck[]} checks
 * @property {string[]} warnings
 * @property {string[]} errors
 * @property {string} verifiedAt
 * @property {VerificationMetadata} metadata
 */

/**
 * @typedef {Object} Anomaly
 * @property {'ocr_mismatch' | 'signature_invalid' | 'anchor_mismatch' | 'issuer_blacklisted' | 'certificate_revoked' | 'format_suspicious'} type
 * @property {'low' | 'medium' | 'high' | 'critical'} severity
 * @property {string} description
 * @property {string} details
 * @property {number} confidence
 * @property {string} [suggestedAction]
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {string | null} token
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 */

/**
 * @typedef {Object} AuthActions
 * @property {function(string, string?): Promise<{otpSent?: boolean, user?: User, token?: string}>} signIn
 * @property {function(): void} signOut
 * @property {function(User): void} setUser
 * @property {function(string): void} setToken
 * @property {function(): void} clearAuth
 */

/**
 * @typedef {Object} SignInFormData
 * @property {string} email
 * @property {string} [otp]
 */

/**
 * @typedef {'draft' | 'submitted' | 'under_review' | 'additional_info_required' | 'approved' | 'rejected' | 'waitlisted'} ApplicationStatus
 */

/**
 * @typedef {Object} ApplicationAddress
 * @property {string} street
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} postalCode
 */

/**
 * @typedef {Object} AcademicRecord
 * @property {string} id
 * @property {string} institutionName
 * @property {string} degree
 * @property {string} fieldOfStudy
 * @property {string} startDate
 * @property {string} [endDate]
 * @property {number} [gpa]
 * @property {number} [maxGpa]
 * @property {boolean} isCompleted
 * @property {string} [transcriptUrl]
 */

/**
 * @typedef {'transcript' | 'diploma' | 'letter_of_recommendation' | 'personal_statement' | 'identity_proof' | 'passport' | 'test_scores' | 'portfolio' | 'other'} DocumentType
 */

/**
 * @typedef {Object} ApplicationDocument
 * @property {string} id
 * @property {DocumentType} type
 * @property {string} fileName
 * @property {string} fileUrl
 * @property {string} uploadedAt
 * @property {boolean} verified
 * @property {number} fileSize
 * @property {string} mimeType
 */

/**
 * @typedef {Object} AdmissionDecision
 * @property {'accepted' | 'rejected' | 'waitlisted'} decision
 * @property {string} program
 * @property {string} [startDate]
 * @property {string[]} [conditions]
 * @property {boolean} [scholarshipOffered]
 * @property {number} [scholarshipAmount]
 * @property {string} [deadlineToRespond]
 */

/**
 * @typedef {Object} StudentApplication
 * @property {string} id
 * @property {string} studentId
 * @property {string} universityId
 * @property {string} studentName
 * @property {string} email
 * @property {string} phone
 * @property {string} dateOfBirth
 * @property {ApplicationAddress} address
 * @property {AcademicRecord[]} academicHistory
 * @property {string} programAppliedFor
 * @property {ApplicationDocument[]} documents
 * @property {ApplicationStatus} status
 * @property {string} submittedAt
 * @property {string} [reviewedAt]
 * @property {string} [reviewedBy]
 * @property {string} [reviewNotes]
 * @property {AdmissionDecision} [admissionDecision]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ProgramRequirement
 * @property {DocumentType} type
 * @property {boolean} required
 * @property {string} description
 */

/**
 * @typedef {Object} UniversityProgram
 * @property {string} id
 * @property {string} name
 * @property {'bachelor' | 'master' | 'phd' | 'diploma' | 'certificate'} degree
 * @property {string} department
 * @property {string} duration
 * @property {number} credits
 * @property {number} tuitionFee
 * @property {string} currency
 * @property {string[]} eligibilityCriteria
 * @property {string} applicationDeadline
 * @property {string} startDate
 * @property {boolean} isActive
 * @property {string} description
 * @property {ProgramRequirement[]} requirements
 */

/**
 * @typedef {Object} ApplicationFormData
 * @property {Object} personalInfo
 * @property {string} personalInfo.studentName
 * @property {string} personalInfo.email
 * @property {string} personalInfo.phone
 * @property {string} personalInfo.dateOfBirth
 * @property {ApplicationAddress} personalInfo.address
 * @property {AcademicRecord[]} academicHistory
 * @property {string} programAppliedFor
 * @property {File[]} documents
 * @property {string} [personalStatement]
 */

/**
 * @typedef {Object} ApplicationTrend
 * @property {string} month
 * @property {number} applications
 * @property {number} approved
 * @property {number} rejected
 */

/**
 * @typedef {Object} UniversityStats
 * @property {number} totalApplications
 * @property {number} pendingReview
 * @property {number} approved
 * @property {number} rejected
 * @property {number} totalPrograms
 * @property {number} totalEnrolledStudents
 * @property {ApplicationTrend[]} applicationTrends
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {T} [data]
 * @property {string} [message]
 * @property {string[]} [errors]
 * @property {Object} [meta]
 * @property {number} [meta.page]
 * @property {number} [meta.limit]
 * @property {number} [meta.total]
 * @property {boolean} [meta.hasNext]
 * @property {boolean} [meta.hasPrev]
 */

export {};