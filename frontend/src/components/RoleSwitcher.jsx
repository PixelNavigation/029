import { useAuthStore } from '../store/auth';

const testUsers = [
  { email: 'student@example.com', role: 'student', name: 'John Doe' },
  { email: 'admin@university.edu', role: 'institution', name: 'Dr. Jane Smith' },
  { email: 'verifier@company.com', role: 'verifier', name: 'Mike Johnson' },

];

export const RoleSwitcher = () => {
  const { user, setUser, signOut } = useAuthStore();

  const switchRole = (testUser) => {
    setUser({
      id: Math.random().toString(),
      email: testUser.email,
      role: testUser.role,
      name: testUser.name,
      verified: true,
      createdAt: new Date().toISOString()
    });
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="font-semibold text-sm text-gray-700 mb-2">Development Mode</h3>

      {user ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">
            Current: <span className="font-medium">{user.name}</span> ({user.role})
          </div>

          <div className="space-y-1">
            {testUsers.map((testUser) => (
              <button
                key={testUser.email}
                onClick={() => switchRole(testUser)}
                className={`w-full text-left px-2 py-1 text-xs rounded ${user.email === testUser.email
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {testUser.name} ({testUser.role})
              </button>
            ))}
          </div>

          <button
            onClick={signOut}
            className="w-full mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="text-xs text-gray-500">Not signed in</div>
      )}
    </div>
  );
};