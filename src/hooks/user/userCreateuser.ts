import { createUser } from "@/service/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return createUser(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/users");
    },
  });
};
