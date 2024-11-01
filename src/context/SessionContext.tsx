import { useProfile } from "@/hooks/user/useProfile";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

type SessionContextType = {
  isAuthenticated: Boolean;
  loading: Boolean;
  profile?: any;
  isProfilePending?: boolean;
  permissions?: any;
};

const SessionContext = createContext<SessionContextType>(
  {} as SessionContextType
);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cookies] = useCookies(["ExpiresIn"],{
    doNotParse: true,
  });
  const [loading, setLoading] = useState(true);
  const { data: profile, isPending: isProfilePending } =
    useProfile(isAuthenticated);

  useEffect(() => {
    const currentDateTime = new Date().getTime();
    const expiresInDateTime = cookies?.ExpiresIn
      ? new Date(cookies.ExpiresIn).getTime()
      : 0;
    if (expiresInDateTime < currentDateTime) {
      console.log("Session expired");
      setIsAuthenticated(false);
    } else {
      setLoading(false);
      setIsAuthenticated(true);
    }
  }, [cookies]);

  return (
    <SessionContext.Provider
      value={{ isAuthenticated, loading, profile, isProfilePending, permissions: profile?.role?.permission || [] }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
