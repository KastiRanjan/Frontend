import { updateUser } from "@/service/user.service";
import { useMutation } from "@tanstack/react-query";

export const useUpdateUser = () => {

    return useMutation({
        mutationFn: ({ id, payload }: any) => {
            return updateUser(id, payload);
        },
        onSuccess: () => {

        },
    });
};
