import { fetchProjectTaskById } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useProjectTaskDetail = ({ pid, tid }: { pid: string | undefined, tid: string | undefined }) => {
    return useQuery({
        queryKey: ["tasks", pid, tid],
        queryFn: async () => {
            return await fetchProjectTaskById({ pid, tid });
        },
        enabled: !!pid && !!tid
    });
};
