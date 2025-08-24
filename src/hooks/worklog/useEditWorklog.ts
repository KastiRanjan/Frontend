import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editWorklog } from "../../service/worklog.service";

export const useEditWorklog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ remark,status, id }: any) => {
            return editWorklog({ remark,status, id });
        },
        onSuccess: (_data, variables) => {
            // Invalidate all possible status queries and the generic worklogs query
            queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
            queryClient.invalidateQueries({ queryKey: ["worklog-user"] });
            queryClient.invalidateQueries({ queryKey: ["worklogs"] });
            // Also invalidate the specific status if available
            if (variables && variables.status) {
                queryClient.invalidateQueries({ queryKey: ["worklog-all", variables.status] });
                queryClient.invalidateQueries({ queryKey: ["worklog-user", variables.status] });
            }
        },
    });
};
