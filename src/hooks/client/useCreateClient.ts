import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../../service/client.service";
import { useNavigate } from "react-router-dom";

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return createClient(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigate("/client");
    },
  });
};
