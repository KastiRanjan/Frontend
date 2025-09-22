import { useQuery } from '@tanstack/react-query';
import { fetchMyNoticeBoards } from '@/service/notice-board.service';

export const useMyNoticeBoards = () => {
  return useQuery({
    queryKey: ['myNoticeBoards'],
    queryFn: fetchMyNoticeBoards
  });
};