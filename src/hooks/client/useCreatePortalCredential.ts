import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortalCredential } from "@/service/client.service";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

export const useCreatePortalCredential = (clientId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: any) => createPortalCredential(clientId, payload),
    onSuccess: () => {
      message.success("Portal credential created successfully");
      queryClient.invalidateQueries({ queryKey: ["portal-credentials", clientId] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to create portal credential");
    }
  });
};
