import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Spin
} from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  CalendarOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { DualDateConverter } from '../../utils/dateConverter';
import { useHolidays } from '../../hooks/holiday/useHoliday';
import { useCalendarEvents } from '../../hooks/calendar/useCalendar';
import { useWorklogbyUser } from '../../hooks/worklog/useWorklogbyUser';
import type { HolidayType } from '../../types/holiday';
import EventHolidayModal from './EventHolidayModal';

const { Title, Text } = Typography;

// Nepali months
const nepaliMonths = [
  'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत'
];

// Nepali weekdays (short form)
const shortNepaliWeekdays = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];

interface NepaliCalendarViewProps {
  // Optional props - component now fetches its own data
}

const NepaliCalendarView: React.FC<NepaliCalendarViewProps> = () => {
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentViewDate, setCurrentViewDate] = useState(today);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  
  // Fetch real data from backend
  const { data: holidayData, isLoading: holidaysLoading } = useHolidays();
  const { data: calendarData } = useCalendarEvents();
  const { data: worklogData } = useWorklogbyUser();
  
  // Get Nepali date for current view
  const currentNepaliDate = useMemo(() => {
    return DualDateConverter.gregorianToNepali(currentViewDate);
  }, [currentViewDate]);

  // Get holidays for current month from real data
  const currentMonthHolidays = useMemo(() => {
    if (!holidayData) return [];
    return holidayData.filter((holiday: HolidayType) => 
      dayjs(holiday.date).month() === currentViewDate.month() &&
      dayjs(holiday.date).year() === currentViewDate.year()
    );
  }, [holidayData, currentViewDate]);

  const goToPreviousMonth = () => {
    setCurrentViewDate(prev => prev.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentViewDate(prev => prev.add(1, 'month'));
  };

  // Handle clicking on calendar days (view-only)
  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
    
    // Check if there are events or holidays for this date
    const dayEvents = getEventsForDate(date);
    const dayHolidays = getHolidaysForDate(date);
    
    if (dayEvents.length > 0 || dayHolidays.length > 0) {
      // Show event/holiday modal if there are events or holidays
      setIsEventModalVisible(true);
    }
    // Calendar is now view-only for worklogs - no creation functionality
  };

  const getEventsForDate = (date: Dayjs) => {
    if (!calendarData) return [];
    return calendarData.filter((event: any) => dayjs(event.date).isSame(date, 'day'));
  };

  const getHolidaysForDate = (date: Dayjs) => {
    if (!holidayData) return [];
    return holidayData.filter((holiday: HolidayType) => dayjs(holiday.date).isSame(date, 'day'));
  };

  const getWorklogsForDate = (date: Dayjs) => {
    if (!worklogData) return [];
    return worklogData.filter((worklog: any) => dayjs(worklog.date).isSame(date, 'day'));
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const startOfMonth = currentViewDate.startOf('month');
    const endOfMonth = currentViewDate.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');
    
    const days = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      days.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    return (
      <div className="calendar-grid grid grid-cols-7 gap-1">
        {/* Week header */}
        {shortNepaliWeekdays.map((day) => (
          <div key={day} className="text-center p-2 font-semibold text-gray-600 text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => renderDay(date, index))}
      </div>
    );
  };

  const renderDay = (date: Dayjs, index: number) => {
    const isCurrentMonth = date.month() === currentViewDate.month();
    const isToday = date.isSame(today, 'day');
    const isSelected = date.isSame(selectedDate, 'day');
    
    const dayEvents = getEventsForDate(date);
    const dayHolidays = getHolidaysForDate(date);
    const dayWorklogs = getWorklogsForDate(date);

    return (
      <div
        key={index}
        className={`
          relative p-2 min-h-[80px] border border-gray-100 cursor-pointer transition-all
          ${isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 text-gray-400'}
          ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${isSelected ? 'bg-blue-100' : ''}
          ${(dayEvents.length > 0 || dayHolidays.length > 0) ? 'hover:shadow-md' : ''}
        `}
        onClick={() => handleDateClick(date)}
      >
        {/* Date number */}
        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
          {date.date()}
        </div>

        {/* Holidays */}
        {dayHolidays.slice(0, 1).map((holiday: HolidayType, idx: number) => (
          <div key={idx} className="text-xs bg-red-100 text-red-700 px-1 rounded mt-1 truncate">
            🎉 {holiday.title}
          </div>
        ))}

        {/* Events */}
        {dayEvents.slice(0, 1).map((event: any, idx: number) => (
          <div key={idx} className="text-xs bg-green-100 text-green-700 px-1 rounded mt-1 truncate">
            📅 {event.title || event.description}
          </div>
        ))}

        {/* Worklogs - Display only */}
        <div className="text-xs text-gray-600 mt-1">
          {dayWorklogs.slice(0, 2).map((worklog: any, idx: number) => (
            <div key={idx} className="text-xs truncate" title={worklog.description}>
              {worklog.status === 'approved' && '✅'}
              {worklog.status === 'pending' && '⏳'}
              {worklog.status === 'rejected' && '❌'}
              {worklog.project?.name || 'Work'}
            </div>
          ))}
          {dayWorklogs.length > 2 && (
            <div className="text-xs text-blue-600 font-semibold">+{dayWorklogs.length - 2}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="modern-nepali-calendar">
      {/* Modern Calendar Header */}
      <div className="calendar-header bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
        <div className="flex justify-between items-center">
          <div className="month-navigation flex items-center gap-4">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={goToPreviousMonth}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            />
            <div className="text-center">
              <Title level={4} className="m-0 text-gray-800 font-bold text-xl">
                {nepaliMonths[currentNepaliDate.getMonth() - 1]} {currentNepaliDate.getYear()}
              </Title>
              <Text className="text-gray-500 text-sm">
                ({currentViewDate.format('MMMM YYYY')})
              </Text>
            </div>
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={goToNextMonth}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            />
          </div>
          
          <div className="calendar-info flex items-center gap-4">
            <div className="holiday-count bg-red-50 px-3 py-1 rounded-lg">
              <Text className="text-red-600 text-sm font-medium">
                <CalendarOutlined className="mr-1" />
                {currentMonthHolidays.length} Holidays
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <Card className="calendar-body shadow-sm border-gray-200">
        {holidaysLoading ? (
          <div className="text-center p-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">Loading calendar data...</div>
          </div>
        ) : (
          renderCalendarGrid()
        )}
      </Card>

      {/* Event/Holiday Modal */}
      <EventHolidayModal
        open={isEventModalVisible}
        onCancel={() => setIsEventModalVisible(false)}
        selectedDate={selectedDate.format('YYYY-MM-DD')}
        events={getEventsForDate(selectedDate)}
        holidays={getHolidaysForDate(selectedDate)}
      />
    </div>
  );
};

export default NepaliCalendarView;
