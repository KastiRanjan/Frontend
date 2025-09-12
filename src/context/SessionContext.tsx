import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useProfile } from "@/hooks/user/useProfile";

type Profile = {
  role?: { permission: string[] };
  status?: string;
  // Add other profile fields as needed
};

type SessionContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  profile?: Profile;
  isProfilePending?: boolean;
  permissions?: string[];
};

const SessionContext = createContext<SessionContextType>({
  isAuthenticated: false,
  loading: true,
  profile: undefined,
  isProfilePending: false,
  permissions: [],
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

  useEffect(() => {
    const currentDateTime = new Date().getTime();
    const expiresInDateTime = cookies?.ExpiresIn && !isNaN(new Date(cookies.ExpiresIn).getTime())
      ? new Date(cookies.ExpiresIn).getTime()
      : 0;
    setIsAuthenticated(expiresInDateTime >= currentDateTime);
    setLoading(false);
  }, [cookies]);

  useEffect(() => {
    if (error) {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [error]);

  // Check user status and automatically log out blocked/suspended users
  useEffect(() => {
    if (profile && profile.status && ['suspended', 'inactive', 'blocked'].includes(profile.status)) {
      setIsAuthenticated(false);
      setLoading(false);
      // You might want to show a message here about account status
    }
  }, [profile]);

  return (
    <SessionContext.Provider
      value={{
        isAuthenticated,
        loading,
        profile,
        isProfilePending,
        permissions: profile?.role?.permission || [],
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);