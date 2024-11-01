import { updateUser } from "@/service/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useUpdateUser = () => {

    return useMutation({
        mutationFn: ({ id, payload }: any) => {
            return updateUser(id, payload);
        },
        onSuccess: (response) => {

        },
    });
};
