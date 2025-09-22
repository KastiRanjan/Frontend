import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNoticeBoard } from '@/service/notice-board.service';

export const useDeleteNoticeBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNoticeBoard,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['noticeBoards'] });
      queryClient.invalidateQueries({ queryKey: ['myNoticeBoards'] });
    }
  });
};