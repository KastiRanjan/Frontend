import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateNoticeBoard } from '@/service/notice-board.service';

export const useUpdateNoticeBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNoticeBoard,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['noticeBoards'] });
      queryClient.invalidateQueries({ queryKey: ['myNoticeBoards'] });
      queryClient.invalidateQueries({ queryKey: ['noticeBoard', variables.id] });
    }
  });
};