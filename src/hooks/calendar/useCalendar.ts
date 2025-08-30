import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as calendarService from "../../service/calendar.service";
import { CreateCalendarDto, UpdateCalendarDto } from "../../types/calendar";

export function useCalendarEvents() {
  return useQuery({
    queryKey: ["calendar-events"],
    queryFn: calendarService.fetchCalendarEvents,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calendarService.createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCalendarDto }) =>
      calendarService.updateCalendarEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calendarService.deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useConvertAdToBs() {
  return useMutation({
    mutationFn: calendarService.convertAdToBs,
  });
}

export function useConvertBsToAd() {
  return useMutation({
    mutationFn: calendarService.convertBsToAd,
  });
}

export function useCalendarByMonth(year: number, month: number, calendarType: 'AD' | 'BS' = 'AD') {
  return useQuery({
    queryKey: ["calendar-month", year, month, calendarType],
    queryFn: () => calendarService.getCalendarByMonth(year, month, calendarType),
    enabled: !!(year && month),
  });
}
