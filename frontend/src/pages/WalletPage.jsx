import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Shield,
    CheckCircle,
    XCircle,
    FileText,
    User,
    GraduationCap,
    Building,
    Calendar,
    ExternalLink,
    AlertTriangle,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * WalletPage – read-only public credential wallet for employers / verifiers.
 *
 * Route: /wallet/:token
 * Data source: GET /api/public/shared-profile/<profile_token>
 */
export default function WalletPage() {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [certificates, setCertificates] = useState([]);

    useEffect(() => {
        if (!token) return;

        const fetchWallet = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_URL}/api/public/shared-profile/${token}`);
                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error || 'Failed to load wallet');
                }

                setProfile(data.profile);
                setCertificates(data.verified_certificates || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWallet();
    }, [token]);

    /* ── Loading ──────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading credential wallet…</p>
                </div>
            </div>
        );
    }

    /* ── Error ────────────────────────────────────────────── */
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Wallet Not Found</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link
                        to="/"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Main ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header banner */}
                <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                        {profile?.profile_photo ? (
                            <img src={profile.profile_photo} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'Student'}</h1>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                            {profile?.university && (
                                <span className="flex items-center gap-1">
                                    <Building className="w-3.5 h-3.5" />
                                    {profile.university}
                                </span>
                            )}
                            {profile?.course && (
                                <span className="flex items-center gap-1">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    {profile.course}
                                </span>
                            )}
                            {profile?.year && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {profile.year}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Verified badge */}
                    <div className="flex-shrink-0 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-center">
                        <Shield className="w-5 h-5 text-green-500 mx-auto" />
                        <span className="text-xs font-semibold text-green-600 mt-0.5 block">Verified</span>
                    </div>
                </div>

                {/* Certificate count */}
                <div className="bg-white rounded-2xl shadow p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Verified Credentials
                        <span className="ml-auto bg-blue-100 text-blue-700 text-sm font-bold px-2.5 py-0.5 rounded-full">
                            {certificates.length}
                        </span>
                    </h2>
                    <p className="text-xs text-gray-400">
                        Only blockchain-verified certificates are shown here.
                    </p>
                </div>

                {/* Certificate list */}
                {certificates.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                        <p className="text-gray-500">No verified certificates found for this wallet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="bg-white rounded-2xl shadow p-5 flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{cert.file_name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{cert.document_type}</p>
                                    {cert.uploaded_at && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Uploaded {new Date(cert.uploaded_at).toLocaleDateString()}
                                        </p>
                                    )}
                                    {cert.blockchain_hash && (
                                        <p className="text-xs text-green-600 font-mono mt-1 truncate" title={cert.blockchain_hash}>
                                            ⛓ {cert.blockchain_hash.slice(0, 20)}…
                                        </p>
                                    )}
                                </div>
                                {cert.file_url && (
                                    <a
                                        href={cert.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-blue-500 hover:text-blue-700"
                                        title="View document"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 pb-4">
                    This credential wallet is powered by{' '}
                    <span className="font-semibold text-blue-500">ACVS Blockchain</span>.
                    Verification is immutable and tamper-proof.
                </p>
            </div>
        </div>
    );
}
