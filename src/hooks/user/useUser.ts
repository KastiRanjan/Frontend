import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../../service/user.service";

export const useUser = ({ status, limit, page, keywords }: { status: string, limit: number, page: number, keywords: string }) => {
  return useQuery({
    queryKey: ["users", status, limit, page, keywords],
    queryFn: () => fetchUsers({ satus: status, limit: limit, page: page, keywords: keywords }),
  });
};
