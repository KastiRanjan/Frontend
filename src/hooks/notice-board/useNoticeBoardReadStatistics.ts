import { useQuery } from '@tanstack/react-query';
import { getNoticeBoardReadStatistics } from '@/service/notice-board.service';

export const useNoticeBoardReadStatistics = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['noticeBoardStatistics', id],
    queryFn: () => getNoticeBoardReadStatistics({ id }),
    enabled
  });
};