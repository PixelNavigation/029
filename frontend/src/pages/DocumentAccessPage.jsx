import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authAPI } from '../lib/api';

export const DocumentAccessPage = () => {
	const { studentId } = useParams();
	const [profile, setProfile] = useState(null);
	const [certificates, setCertificates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError('');
			try {
				const [profileData, certData] = await Promise.all([
					authAPI.getPublicProfile(studentId),
					authAPI.getCertificates(studentId),
				]);

				setProfile(profileData);
				setCertificates(certData.certificates || certData || []);
			} catch (err) {
				setError(err?.message || 'Failed to load student profile');
			} finally {
				setLoading(false);
			}
		};

		if (studentId) {
			loadData();
		}
	}, [studentId]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<p className="text-gray-600 text-lg">Loading student portfolio...</p>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white rounded-xl shadow p-8 max-w-lg w-full text-center">
					<h1 className="text-xl font-semibold text-gray-900 mb-2">Profile not available</h1>
					<p className="text-gray-600 mb-4">{error || 'We could not find a public profile for this student.'}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-10">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center space-x-4">
					<img
						src={profile.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || studentId)}`}
						alt={profile.name}
						className="w-20 h-20 rounded-full object-cover border"
					/>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{profile.name || 'Student'}</h1>
						<p className="text-gray-700">{profile.university || 'Mecs'}</p>
						<p className="text-gray-600 text-sm mt-1">Student ID: {profile.student_id || studentId}</p>
						<p className="text-gray-600 text-sm mt-1">Course: {profile.course || 'CSE'}</p>
						<p className="text-gray-600 text-sm">Year: {profile.year || '4th Year'}</p>
						<p className="text-gray-600 text-sm">Email: {profile.email || 'babelgautam16@gmail.com'}</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Verified Certificates</h2>
					{certificates.length === 0 ? (
						<p className="text-gray-600">No certificates available for this student.</p>
					) : (
						<ul className="space-y-3">
							{certificates.map((cert) => {
								const isVerified = (cert.verification_status || cert.status || '').toLowerCase() === 'verified';
								return (
									<li
										key={cert.id || cert.certificateId || cert.file_name}
										className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded-lg px-4 py-3 ${
											isVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
										}`}
									>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-900 flex items-center gap-2 break-words">
												{cert.file_name || cert.name}
												{isVerified && (
													<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
														✓ Verified
													</span>
												)}
											</p>
											<p className="text-xs text-gray-600">
												Uploaded: {cert.uploaded_at || cert.uploadDate || '—'}
											</p>
										</div>
										{cert.file_url && (
											<a
												href={cert.file_url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:underline md:ml-4 whitespace-nowrap"
											>
												View
												</a>
										)}
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
};

export default DocumentAccessPage;

