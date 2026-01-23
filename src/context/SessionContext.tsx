import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useProfile } from "@/hooks/user/useProfile";
import { extractAndStoreAuthToken, isAuthenticated as checkIsAuthenticated } from "@/utils/auth";

type Profile = {
  id?: string;
  role?: { permission: string[] };
  status?: string;
  email?: string;
  avatar?: string | null;
  name?: string;
};

type SessionContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  profile?: Profile;
  isProfilePending?: boolean;
  permissions?: string[];
  refreshAuth?: () => void;
};

const SessionContext = createContext<SessionContextType>({
  isAuthenticated: false,
  loading: true,
  profile: undefined,
  isProfilePending: false,
  permissions: [],
  refreshAuth: () => {},
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cookies] = useCookies(["ExpiresIn"]);
  const [loading, setLoading] = useState(true);
  const { data: profile, isPending: isProfilePending, error } =
    useProfile(isAuthenticated);

  // On initial load, extract token from cookies and store in localStorage
  useEffect(() => {
    console.log('SessionProvider: Initializing, extracting auth token');
    extractAndStoreAuthToken();
    
    // Check both cookies and localStorage for authentication
    const currentDateTime = new Date().getTime();
    const expiresInDateTime = cookies?.ExpiresIn && !isNaN(new Date(cookies.ExpiresIn).getTime())
      ? new Date(cookies.ExpiresIn).getTime()
      : 0;
    
    const isAuthByExpiry = expiresInDateTime >= currentDateTime;
    const isAuthByToken = checkIsAuthenticated();
    
    // If either method confirms authentication, consider the user authenticated
    const newAuthState = isAuthByExpiry || isAuthByToken;
    
    // Only update if state actually changed to prevent unnecessary re-renders
    setIsAuthenticated(prevAuth => {
      if (prevAuth !== newAuthState) {
        console.log('SessionProvider: Auth state changed from', prevAuth, 'to', newAuthState);
      }
      return newAuthState;
    });
    setLoading(false);
    
    console.log('SessionProvider: Auth state -', { 
      isAuthByExpiry, 
      isAuthByToken, 
      expiresIn: cookies?.ExpiresIn,
      hasLocalStorageToken: !!localStorage.getItem('access_token')
    });
  }, [cookies]);

  useEffect(() => {
    if (error) {
      console.log('SessionProvider: Error in profile fetch, logging out', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [error]);

  // Check user status and automatically log out blocked/suspended/inactive users
  useEffect(() => {
    if (profile && profile.status && ['suspended', 'inactive', 'blocked'].includes(profile.status)) {
      console.log('SessionProvider: User status requires logout:', profile.status);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Clear authentication data
      localStorage.removeItem('access_token');
      localStorage.removeItem('userId');
      
      // Redirect to login with a message
      if (typeof window !== 'undefined') {
        const statusMessages = {
          'inactive': 'Your account is inactive. Please contact the administrator.',
          'blocked': 'Your account has been blocked. Please contact the administrator.',
          'suspended': 'Your account has been suspended. Please contact the administrator.',
        };
        
        const message = statusMessages[profile.status as keyof typeof statusMessages] || 'Account access restricted.';
        
        // Store message in sessionStorage to display on login page
        sessionStorage.setItem('loginMessage', message);
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
  }, [profile]);

  useEffect(() => {
    if (profile && profile.id) {
      localStorage.setItem('userId', profile.id);
      console.log('SessionProvider: Stored userId in localStorage:', profile.id);
    }
  }, [profile]);

  // Function to manually refresh authentication state
  const refreshAuth = () => {
    console.log('SessionProvider: Manual auth refresh triggered');
    const isAuthByToken = checkIsAuthenticated();
    const currentDateTime = new Date().getTime();
    const expiresInDateTime = cookies?.ExpiresIn && !isNaN(new Date(cookies.ExpiresIn).getTime())
      ? new Date(cookies.ExpiresIn).getTime()
      : 0;
    const isAuthByExpiry = expiresInDateTime >= currentDateTime;
    
    setIsAuthenticated(isAuthByExpiry || isAuthByToken);
    setLoading(false);
  };

  return (
    <SessionContext.Provider
      value={{
        isAuthenticated,
        loading,
        profile,
        isProfilePending,
        permissions: profile?.role?.permission || [],
        refreshAuth,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);