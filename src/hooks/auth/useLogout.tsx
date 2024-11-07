import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../../service/auth.service";

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
