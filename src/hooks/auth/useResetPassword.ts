import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";

export const useResetPassword = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (response) => {
            console.log(response);
            navigate("/login");
        },
    });
};

