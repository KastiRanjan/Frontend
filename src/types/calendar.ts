import { DualDate } from '../utils/dateConverter';

export interface CalendarType {
  id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarDto {
  date: string;
  type: string;
  title: string;
  description?: string;
}

export interface UpdateCalendarDto {
  date?: string;
  type?: string;
  title?: string;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: 'leave' | 'holiday' | 'worklog' | 'event';
  status?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  description?: string;
  color?: string;
  dualDate?: {
    start: DualDate;
    end?: DualDate;
  };
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: string) => void;
  userRole?: string;
}
