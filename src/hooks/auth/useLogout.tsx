
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../../service/auth.service";
import useQueryClient from "../useQueryClient";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: (response) => {
      // Invalidate all queries on logout
      queryClient.clear();
      navigate("/login");
    },
  });
};
