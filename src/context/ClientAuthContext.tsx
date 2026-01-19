import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { ClientUserType, CustomerBasic } from "@/types/clientUser";
import { getClientProfile, clientLogout, switchCustomer } from "@/service/clientPortal.service";

interface ClientAuthContextType {
  clientUser: ClientUserType | null;
  isClientAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedCustomer: CustomerBasic | null;
  logout: () => Promise<void>;
  refreshClientAuth: () => Promise<boolean>;
  selectCustomer: (customerId: string) => Promise<boolean>;
}

const ClientAuthContext = createContext<ClientAuthContextType>({
  clientUser: null,
  isClientAuthenticated: false,
  isLoading: true,
  error: null,
  selectedCustomer: null,
  logout: async () => {},
  refreshClientAuth: async () => false,
  selectCustomer: async () => false
});

export const ClientAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [clientUser, setClientUser] = useState<ClientUserType | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBasic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkClientAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("client_token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Set the Authorization header for client requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const profile = await getClientProfile();
      setClientUser(profile);
      
      // Set selected customer from profile or localStorage
      const savedCustomerId = localStorage.getItem("selected_customer_id");
      if (profile.selectedCustomerId) {
        const customer = profile.customers?.find((c: CustomerBasic) => c.id === profile.selectedCustomerId);
        if (customer) setSelectedCustomer(customer);
      } else if (savedCustomerId) {
        const customer = profile.customers?.find((c: CustomerBasic) => c.id === savedCustomerId);
        if (customer) setSelectedCustomer(customer);
      } else if (profile.customers?.length === 1) {
        setSelectedCustomer(profile.customers[0]);
        localStorage.setItem("selected_customer_id", profile.customers[0].id);
      }
    } catch (err) {
      console.error("Client auth check failed:", err);
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
      localStorage.removeItem("selected_customer_id");
      setError("Session expired. Please login again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkClientAuth();
  }, []);

  const logout = async () => {
    try {
      await clientLogout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
      localStorage.removeItem("selected_customer_id");
      setClientUser(null);
      setSelectedCustomer(null);
      setError(null);
    }
  };

  const selectCustomer = async (customerId: string): Promise<boolean> => {
    try {
      const result = await switchCustomer({ customerId });
      
      // Update token
      localStorage.setItem("client_token", result.token);
      localStorage.setItem("selected_customer_id", customerId);
      axios.defaults.headers.common["Authorization"] = `Bearer ${result.token}`;
      
      setSelectedCustomer(result.customer);
      
      // Invalidate all client portal queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["my-client-reports"] });
      queryClient.invalidateQueries({ queryKey: ["my-client-report-stats"] });
      queryClient.invalidateQueries({ queryKey: ["client-report-details"] });
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      
      // Refresh profile
      await checkClientAuth();
      return true;
    } catch (err) {
      console.error("Switch customer failed:", err);
      return false;
    }
  };

  const refreshClientAuth = async (): Promise<boolean> => {
    try {
      await checkClientAuth();
      return !!clientUser;
    } catch {
      return false;
    }
  };

  return (
    <ClientAuthContext.Provider
      value={{
        clientUser,
        isClientAuthenticated: !!clientUser,
        isLoading,
        error,
        selectedCustomer,
        logout,
        refreshClientAuth,
        selectCustomer
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => useContext(ClientAuthContext);
