import { deleteWorklog } from "@/service/worklog.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const useDeleteWorklog = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: any) => {
            return deleteWorklog({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
        },
    });
};