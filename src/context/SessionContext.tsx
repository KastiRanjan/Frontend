import { useProfile } from "@/hooks/user/useProfile";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

type SessionContextType = {
  isAuthenticated: Boolean;
  loading: Boolean;
  profile?: any;
  isProfilePending?: boolean;
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
  const [cookie] = useCookies(["ExpiresIn"]);
  const [loading, setLoading] = useState(true);
  const { data: profile, isPending: isProfilePending } =
    useProfile(isAuthenticated);

  useEffect(() => {
    const currentDateTime = new Date().getTime();
    const expiresInDateTime = cookie?.ExpiresIn
      ? new Date(cookie.ExpiresIn).getTime()
      : 0;
    if (expiresInDateTime < currentDateTime) {
      console.log("Session expired");
      setIsAuthenticated(false);
    } else {
      setLoading(false);
      setIsAuthenticated(true);
    }
  }, [cookie]);

  return (
    <SessionContext.Provider
      value={{ isAuthenticated, loading, profile, isProfilePending }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
