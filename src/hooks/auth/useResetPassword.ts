import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../service/auth.service";

interface ResetPasswordDto {
    token: string;
    password: string;
    confirmPassword?: string;
}

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: ResetPasswordDto) => resetPassword(data),
        onError: (error) => {
            console.error("Reset password error:", error);
        },
    });
};
