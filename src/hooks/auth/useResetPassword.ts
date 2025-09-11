import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../service/auth.service";

export const useResetPassword = () => {
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (response) => {
            console.log(response);
            // We'll let the component handle the navigation
        },
    });
};
