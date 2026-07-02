import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Modal, 
  Typography, 
  Button, 
  Tag, 
  Spin,
  Dropdown
} from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  CalendarOutlined, 
  PlusOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import NepaliDate from 'nepali-date';
import { DualDateConverter } from '../../utils/dateConverter';
import { useHolidays } from '../../hooks/holiday/useHoliday';
import { useCalendarEvents } from '../../hooks/calendar/useCalendar';
import { getItem } from '../../hooks/useCookies';
import type { HolidayType } from '../../types/holiday';
import LeaveRequestModal from '../Leave/LeaveRequestModal';
import WorklogModal from "./WorklogModal";
import LeaveTypeManager from '../LeaveTypeManager';
import { useNavigate } from 'react-router-dom';
import { useAllWorklog } from '../../hooks/worklog/useAllWorklog';

const { Title, Text } = Typography;

// Nepali months
const nepaliMonths = [
  'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत'
];

// Nepali weekdays (short form)
const shortNepaliWeekdays = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];

interface NepaliOnlyCalendarProps {
  // Optional props - component now fetches its own data
}

const WorklogCalendar: React.FC<any> = () => {
  const today = dayjs();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentViewDate, setCurrentViewDate] = useState(today);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const { data: worklogData } = useAllWorklog();
  const [isLeaveTypeManagerVisible, setIsLeaveTypeManagerVisible] = useState(false);
  
  // Get user data from cookies
  const userData = JSON.parse(getItem('user') || '{}');
  const userRole = userData?.role;
  const isAdmin = userRole === 'admin';
  
  // Fetch real data from backend
  const { data: holidayData, isLoading: holidaysLoading } = useHolidays();
  
  
  // Get Nepali date for current view
  const currentNepaliDate = useMemo(() => {
    return DualDateConverter.gregorianToNepali(currentViewDate);
  }, [currentViewDate]);

  // Get holidays for current month from real data
  const currentMonthHolidays = useMemo(() => {
    if (!holidayData) return [];
    return holidayData.filter((holiday: HolidayType) => {
      const holidayNepali = DualDateConverter.gregorianToNepali(dayjs(holiday.date));
      return holidayNepali.getYear() === currentNepaliDate.getYear() && 
             holidayNepali.getMonth() === currentNepaliDate.getMonth();
    });
  }, [holidayData, currentNepaliDate]);

  // Generate calendar days in Nepali format
  const calendarDays = useMemo(() => {
    const nepaliYear = currentNepaliDate.getYear();
    const nepaliMonth = currentNepaliDate.getMonth();
    
    // 1st day of the Nepali month
    const firstDayOfNepaliMonth = new NepaliDate(nepaliYear, nepaliMonth, 1);
    
    // Determine how many days are in this Nepali month dynamically
    let daysInMonth = 29;
    while(true) {
      try {
        const testDate = new NepaliDate(nepaliYear, nepaliMonth, daysInMonth + 1);
        if (testDate.getMonth() !== nepaliMonth) break;
        daysInMonth++;
      } catch (e) {
        break; // if invalid date is thrown
      }
    }
    
    const startDayOfWeek = firstDayOfNepaliMonth.getDay(); // 0 for Sunday
    const days: Dayjs[] = [];
    
    // We get the exact gregorian start date for the 1st of the nepali month
    // Set to noon (12:00) to avoid any timezone shifts when adding/subtracting days
    const gregorianFirstDay = DualDateConverter.nepaliToGregorian(firstDayOfNepaliMonth).hour(12).minute(0).second(0).millisecond(0);
    
    // Add padded days from the previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(gregorianFirstDay.subtract(i + 1, 'day'));
    }
    
    // Add all days of the current Nepali month
    for (let i = 0; i < daysInMonth; i++) {
      days.push(gregorianFirstDay.add(i, 'day'));
    }
    
    // Add padded days for the next month to fill the grid up to a multiple of 7
    const remainder = days.length % 7;
    if (remainder !== 0) {
      const daysToAdd = 7 - remainder;
      const lastDayInGrid = days[days.length - 1];
      for (let i = 1; i <= daysToAdd; i++) {
        days.push(lastDayInGrid.add(i, 'day'));
      }
    }
    
    return days;
  }, [currentNepaliDate]);

  const goToPreviousMonth = () => {
    setCurrentViewDate(prev => {
       const nepali = DualDateConverter.gregorianToNepali(prev);
       let y = nepali.getYear();
       let m = nepali.getMonth() - 1;
       if (m < 0) {
          m = 11;
          y -= 1;
       }
       const newNepali = new NepaliDate(y, m, 1);
       return DualDateConverter.nepaliToGregorian(newNepali).hour(12).minute(0);
    });
  };

  const goToNextMonth = () => {
    setCurrentViewDate(prev => {
       const nepali = DualDateConverter.gregorianToNepali(prev);
       let y = nepali.getYear();
       let m = nepali.getMonth() + 1;
       if (m > 11) {
          m = 0;
          y += 1;
       }
       const newNepali = new NepaliDate(y, m, 1);
       return DualDateConverter.nepaliToGregorian(newNepali).hour(12).minute(0);
    });
  };

  const goToToday = () => {
    setCurrentViewDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
    
    // Always show the event/holiday modal with worklogs for the selected date
    setIsEventModalVisible(true);
  };

  const getEventsForDate = (date: Dayjs) => {
    if (!worklogData) return [];
    return worklogData.filter((event: any) => dayjs(event.date).isSame(date, 'day'));
  };

  const getHolidaysForDate = (date: Dayjs) => {
    if (!holidayData) return [];
    // Compare only the date part (YYYY-MM-DD) to avoid timezone/time issues
    const target = date.format('YYYY-MM-DD');
    return holidayData.filter((holiday: HolidayType) => {
      // holiday.date may be in 'YYYY-MM-DD' or ISO string
      const holidayDate = dayjs(holiday.date).format('YYYY-MM-DD');
      return holidayDate === target;
    });
  };

  const isToday = (date: Dayjs) => date.isSame(today, 'day');
  const isCurrentMonth = (date: Dayjs) => {
    const nepali = DualDateConverter.gregorianToNepali(date);
    return nepali.getYear() === currentNepaliDate.getYear() && 
           nepali.getMonth() === currentNepaliDate.getMonth();
  };
  const isWeekend = (date: Dayjs) => date.day() === 6; // Saturday is weekend in Nepal

  const renderDateCell = (date: Dayjs) => {
    const dayEvents = getEventsForDate(date);
    const dayHolidays = getHolidaysForDate(date);
        const nepaliDate = DualDateConverter.gregorianToNepali(date);
    
    const isCurrentDay = isToday(date);
    const isOtherMonth = !isCurrentMonth(date);
    const isWeekendDay = isWeekend(date);
    const hasEvents = dayEvents.length > 0 || dayHolidays.length > 0;

    return (
      <div
        key={date.format('YYYY-MM-DD')}
        className={`
          relative p-2 min-h-[80px] cursor-pointer transition-all duration-200 border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm rounded-lg
          ${isCurrentDay ? 'bg-blue-100 border-blue-400 shadow-sm' : 'bg-white'}
          ${isOtherMonth ? 'opacity-40' : ''}
          ${isWeekendDay ? 'bg-red-50' : ''}
          ${hasEvents ? 'border-orange-300 bg-orange-50' : ''}
        `}
        onClick={() => handleDateClick(date)}
      >
        {/* Date Numbers */}
        <div className="text-center mb-2">
          <div className={`text-lg font-bold ${isCurrentDay ? 'text-blue-700' : isWeekendDay ? 'text-red-600' : 'text-gray-700'}`}>
            {nepaliDate ? nepaliDate.getDate() : date.format('D')}
          </div>
          <div className="text-xs text-gray-400">
            {date.format('D')}
          </div>
        </div>
        
        {/* Holiday Indicators */}
        {dayHolidays.slice(0, 1).map((holiday: HolidayType, idx: number) => (
          <div key={idx} className="text-xs bg-red-100 text-red-700 px-1 rounded mb-1 truncate">
            🎉 {holiday.title}
          </div>
        ))}

        {/* Event Indicators */}
        {dayEvents.slice(0, 1).map((event: any, idx: number) => (
          <div key={idx} className="text-xs bg-blue-100 text-blue-700 px-1 rounded mb-1 truncate">
            📅 {event.title || event.description}
          </div>
        ))}
      </div>
    );
  };

  const actionMenuItems = [
    {
      key: 'leave',
      icon: <FileTextOutlined />,
      label: 'Request Leave',
      onClick: () => setIsLeaveModalVisible(true)
    },
    ...(isAdmin ? [{
      key: 'manage-leave-types',
      icon: <SettingOutlined />,
      label: 'Manage Leave Types', 
      onClick: () => setIsLeaveTypeManagerVisible(true)
    }] : [])
  ];

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
                {nepaliMonths[currentNepaliDate?.getMonth() || 0]} {currentNepaliDate?.getYear()}
              </Title>
              <Text type="secondary" className="text-sm text-gray-500">
                {currentViewDate.format('MMMM YYYY')}
              </Text>
            </div>
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={goToNextMonth}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={goToToday} 
              type="primary" 
              className="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              आज
            </Button>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button type="primary" icon={<PlusOutlined />} className="bg-green-600 border-green-600 hover:bg-green-700">
                Actions
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full">
          <Card className="border border-gray-200 shadow-sm h-full">
            {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {shortNepaliWeekdays.map((day, idx) => (
            <div key={idx} className={`text-center py-3 text-sm font-semibold ${idx === 6 ? 'text-red-600' : 'text-gray-600'} bg-gray-50 rounded`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(renderDateCell)}
        </div>
      </Card>
        </div>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        open={isLeaveModalVisible}
        onCancel={() => setIsLeaveModalVisible(false)}
      />

      {/* Event/Holiday Detail Modal */}
      <WorklogModal
        open={isEventModalVisible}
        onCancel={() => setIsEventModalVisible(false)}
        selectedDate={selectedDate.format('YYYY-MM-DD')}
        worklogs={worklogData}
        
      />

      {/* Leave Type Manager Modal (Admin Only) */}
      {isAdmin && (
        <Modal
          title="Leave Type Management"
          open={isLeaveTypeManagerVisible}
          onCancel={() => setIsLeaveTypeManagerVisible(false)}
          footer={null}
          width={900}
          bodyStyle={{ padding: 0 }}
        >
          <LeaveTypeManager />
        </Modal>
      )}
    </div>
  );
};

export default WorklogCalendar;
