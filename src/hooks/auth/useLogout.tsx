import { useMutation } from "@tanstack/react-query";
import { login, logout } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: (response) => {
      console.log(response);
      navigate("/login");
    },
  });
};
