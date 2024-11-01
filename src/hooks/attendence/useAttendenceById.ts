import { useQuery } from "@tanstack/react-query";
import { fetchAttendenceById } from "../../service/attendence.service";

export const useAttendenceById = ({ id }: { id: string }) => {
  return useQuery({

    queryKey: ["attendence", id],
    queryFn: async () => {
      return fetchAttendenceById({ id });
    },
    enabled: !!id,
  });
};
