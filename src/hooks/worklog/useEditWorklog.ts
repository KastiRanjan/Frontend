import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editWorklog } from "../../service/worklog.service";

export const useEditWorklog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ remark,status, id }: any) => {
            return editWorklog({ remark,status, id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["worklog-all", 'open'] });
            queryClient.invalidateQueries({ queryKey: ["worklog-all", 'approved'] });
            queryClient.invalidateQueries({ queryKey: ["worklog-all", 'requested'] });
            queryClient.invalidateQueries({ queryKey: ["worklogs"] });
        },
    });
};
