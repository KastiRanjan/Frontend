import { useQuery } from '@tanstack/react-query';
import { fetchNoticeBoard } from '@/service/notice-board.service';

export const useNoticeBoard = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['noticeBoard', id],
    queryFn: () => fetchNoticeBoard({ id }),
    enabled
  });
};