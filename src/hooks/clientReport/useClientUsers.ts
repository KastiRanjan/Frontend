import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientUsers,
  fetchClientUserById,
  createClientUser,
  updateClientUser,
  deleteClientUser
} from "@/service/clientPortal.service";
import { CreateClientUserPayload, UpdateClientUserPayload } from "@/types/clientUser";

// Hook to fetch all client users
export const useClientUsers = (customerId?: string) => {
  return useQuery({
    queryKey: ["client-users", customerId],
    queryFn: () => fetchClientUsers(customerId)
  });
};

// Hook to fetch a single client user by ID
export const useClientUserById = (id: string) => {
  return useQuery({
    queryKey: ["client-user", id],
    queryFn: () => fetchClientUserById(id),
    enabled: !!id
  });
};

// Hook to create a new client user
export const useCreateClientUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientUserPayload) => createClientUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-users"] });
    }
  });
};

// Hook to update a client user
export const useUpdateClientUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientUserPayload }) =>
      updateClientUser(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["client-users"] });
      queryClient.invalidateQueries({ queryKey: ["client-user", id] });
    }
  });
};

// Hook to delete a client user
export const useDeleteClientUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClientUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-users"] });
    }
  });
};
