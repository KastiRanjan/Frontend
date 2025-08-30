export interface HolidayType {
  id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
  bsDate?: string;
}

export interface CreateHolidayDto {
  date: string;
  type: string;
  title: string;
  description?: string;
  bsDate?: string;
}

export interface UpdateHolidayDto {
  date?: string;
  type?: string;
  title?: string;
  description?: string;
  bsDate?: string;
}
