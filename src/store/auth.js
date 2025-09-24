import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      signIn: async (email, otp) => {
        set({ isLoading: true });
        
        try {
          // First call: send OTP (if no OTP provided)
          if (!otp) {
            const response = await fetch('/api/auth/signin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            
            const result = await response.json();
            set({ isLoading: false });
            
            if (result.success && result.data.otpSent) {
              return { otpSent: true };
            } else {
              throw new Error(result.message || 'Failed to send OTP');
            }
          }
          
          // Second call: verify OTP and complete sign in
          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
          });
          
          const result = await response.json();
          
          if (result.success && result.data.user && result.data.token) {
            const { user, token } = result.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Store token in localStorage for axios interceptor
            localStorage.setItem('acvs_token', token);
            localStorage.setItem('acvs_user', JSON.stringify(user));
            
            return { user, token };
          } else {
            throw new Error(result.message || 'Sign in failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Clear localStorage
        localStorage.removeItem('acvs_token');
        localStorage.removeItem('acvs_user');
        
        // Redirect to home or sign in page
        window.location.href = '/';
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true });
        localStorage.setItem('acvs_user', JSON.stringify(user));
      },

      setToken: (token) => {
        set({ token, isAuthenticated: true });
        localStorage.setItem('acvs_token', token);
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        localStorage.removeItem('acvs_token');
        localStorage.removeItem('acvs_user');
      },
    }),
    {
      name: 'acvs-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize from localStorage if available
        const storedToken = localStorage.getItem('acvs_token');
        const storedUser = localStorage.getItem('acvs_user');
        
        if (storedToken && storedUser && state) {
          try {
            const user = JSON.parse(storedUser);
            state.user = user;
            state.token = storedToken;
            state.isAuthenticated = true;
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            state.clearAuth();
          }
        }
      },
    }
  )
);

// Utility hooks for specific auth checks
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

export const useUser = () => useAuthStore((state) => state.user);

export const useUserRole = () => useAuthStore((state) => state.user?.role);

export const useIsRole = (role) => useAuthStore((state) => state.user?.role === role);

export const useIsStudent = () => useIsRole('student');
export const useIsInstitution = () => useIsRole('institution');
export const useIsVerifier = () => useIsRole('verifier');
export const useIsAdmin = () => useIsRole('admin');

// Auth guards for route protection
export const hasRole = (requiredRole, userRole) => {
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  return userRole === requiredRole;
};

export const hasAnyRole = (requiredRoles, userRole) => {
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  return requiredRoles.includes(userRole);
};