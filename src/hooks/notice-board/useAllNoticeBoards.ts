import { useQuery } from '@tanstack/react-query';
import { fetchAllNoticeBoards } from '@/service/notice-board.service';

export const useAllNoticeBoards = () => {
  return useQuery({
    queryKey: ['noticeBoards'],
    queryFn: fetchAllNoticeBoards
  });
};