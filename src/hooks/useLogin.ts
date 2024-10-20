import { useMutation } from "@tanstack/react-query";
import { login } from "../service/auth.service";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      console.log(response);
      navigate("/");
    },
  });
};
