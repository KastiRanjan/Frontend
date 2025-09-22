import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNoticeBoardAsRead } from '@/service/notice-board.service';

export const useMarkNoticeBoardAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNoticeBoardAsRead,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['noticeBoard', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myNoticeBoards'] });
    }
  });
};