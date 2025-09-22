import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNoticeBoard } from '@/service/notice-board.service';

export const useCreateNoticeBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNoticeBoard,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['noticeBoards'] });
      queryClient.invalidateQueries({ queryKey: ['myNoticeBoards'] });
    }
  });
};