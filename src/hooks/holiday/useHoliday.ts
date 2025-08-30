import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as holidayService from "../../service/holiday.service";
import { CreateHolidayDto, UpdateHolidayDto } from "../../types/holiday";

export function useHolidays() {
  return useQuery({
    queryKey: ["holidays"],
    queryFn: holidayService.fetchHolidays,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holidayService.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHolidayDto }) =>
      holidayService.updateHoliday(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holidayService.deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useImportHolidaysFromCSV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holidayService.importHolidaysFromCSV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function usePreviewHolidaysFromCSV() {
  return useMutation({
    mutationFn: holidayService.previewHolidaysFromCSV,
  });
}
