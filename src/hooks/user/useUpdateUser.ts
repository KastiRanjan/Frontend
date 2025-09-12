import { updateUser } from "@/service/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: any) => {
            return updateUser(id, payload);
        },
        onSuccess: () => {
            // Invalidate all user-related queries to ensure table refresh
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};
