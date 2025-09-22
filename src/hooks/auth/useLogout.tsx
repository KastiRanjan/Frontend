
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../../service/auth.service";
import useQueryClient from "../useQueryClient";
import { clearAuth } from "@/utils/auth";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: (response) => {
      // Invalidate all queries on logout
      queryClient.clear();
      
      // Clear localStorage token as well
      clearAuth();
      console.log('Logout: Token cleared from localStorage');
      
      navigate("/login");
    },
    onError: () => {
      // Even if the API call fails, still clear local tokens and redirect
      queryClient.clear();
      clearAuth();
      console.log('Logout: Token cleared from localStorage (after error)');
      navigate("/login");
    }
  });
};
