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
import { DualDateConverter } from '../../utils/dateConverter';
import { useHolidays } from '../../hooks/holiday/useHoliday';
import { useCalendarEvents } from '../../hooks/calendar/useCalendar';
import { useWorklogbyUser } from '../../hooks/worklog/useWorklogbyUser';
import { getItem } from '../../hooks/useCookies';
import type { HolidayType } from '../../types/holiday';
import LeaveRequestModal from '../Leave/LeaveRequestModal';
import EventHolidayModal from './EventHolidayModal';
import LeaveTypeManager from '../LeaveTypeManager';
import { useNavigate } from 'react-router-dom';

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

const NepaliOnlyCalendar: React.FC<NepaliOnlyCalendarProps> = () => {
  const today = dayjs();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentViewDate, setCurrentViewDate] = useState(today);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isLeaveTypeManagerVisible, setIsLeaveTypeManagerVisible] = useState(false);
  
  // Get user data from cookies
  const userData = JSON.parse(getItem('user') || '{}');
  const userRole = userData?.role;
  const isAdmin = userRole === 'admin';
  
  // Fetch real data from backend
  const { data: holidayData, isLoading: holidaysLoading } = useHolidays();
  const { data: calendarData } = useCalendarEvents();
  const { data: worklogData } = useWorklogbyUser();
  console.log(worklogData)
  
  // Get Nepali date for current view
  const currentNepaliDate = useMemo(() => {
    return DualDateConverter.gregorianToNepali(currentViewDate);
  }, [currentViewDate]);

  // Get holidays for current month from real data
  const currentMonthHolidays = useMemo(() => {
    if (!holidayData) return [];
    return holidayData.filter((holiday: HolidayType) => 
      dayjs(holiday.date).isSame(currentViewDate, 'month')
    );
  }, [holidayData, currentViewDate]);

  // Generate calendar days in Nepali format
  const calendarDays = useMemo(() => {
    const startOfMonth = currentViewDate.startOf('month');
    const endOfMonth = currentViewDate.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');
    
    const days: Dayjs[] = [];
    let currentDate = startDate;
    
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      days.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }
    
    return days;
  }, [currentViewDate]);

  const goToPreviousMonth = () => {
    setCurrentViewDate(prev => prev.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentViewDate(prev => prev.add(1, 'month'));
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
    if (!calendarData) return [];
    return calendarData.filter((event: any) => dayjs(event.date).isSame(date, 'day'));
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

  const getWorklogsForDate = (date: Dayjs) => {
    if (!worklogData) return [];
    return worklogData.filter((worklog: any) => {
      // Use startTime to match the date since that's the work date
      return dayjs(worklog.startTime).isSame(date, 'day');
    });
  };

  const isToday = (date: Dayjs) => date.isSame(today, 'day');
  const isCurrentMonth = (date: Dayjs) => date.isSame(currentViewDate, 'month');
  const isWeekend = (date: Dayjs) => date.day() === 6; // Saturday is weekend in Nepal

  const renderDateCell = (date: Dayjs) => {
    const dayEvents = getEventsForDate(date);
    const dayHolidays = getHolidaysForDate(date);
    const dayWorklogs = getWorklogsForDate(date);
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
          ${dayWorklogs.length > 0 ? 'border-green-300 bg-green-50' : ''}
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

        {/* Worklog Indicators */}
        <div className="space-y-1">
          {dayWorklogs.slice(0, 2).map((worklog: any, idx: number) => (
            <div 
              key={idx} 
              className="text-xs bg-green-100 text-green-700 px-1 rounded truncate"
              title={`${worklog.task?.name} - ${worklog.user?.name} (${worklog.status})`}
            >
              {worklog.status === 'approved' && '✅'}
              {worklog.status === 'requested' && '⏳'}
              {worklog.status === 'rejected' && '❌'}
              {worklog.task?.name || 'Work'} 
            </div>
          ))}
          {dayWorklogs.length > 2 && (
            <div className="text-xs text-green-600 font-semibold">+{dayWorklogs.length - 2} more</div>
          )}
          {dayWorklogs.length === 0 && isCurrentMonth(date) && (
            <div className="text-xs text-gray-400 italic">No worklogs</div>
          )}
        </div>
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
      <Card className="border border-gray-200 shadow-sm">
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
              {/* Monthly Holidays Summary */}
        <Card className="mb-4 border border-gray-200 shadow-sm">
          <Title level={5} className="text-gray-800 mb-3 flex items-center">
            <CalendarOutlined className="mr-2 text-orange-500" />
            Holidays & Events
          </Title>
          {holidaysLoading ? (
            <div className="text-center py-4">
              <Spin size="small" />
              <Text className="ml-2" type="secondary">Loading holidays...</Text>
            </div>
          ) : currentMonthHolidays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentMonthHolidays.map((holiday: HolidayType, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                    <div>
                      <Text strong className="text-sm text-gray-800">{holiday.title}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {dayjs(holiday.date).format('MMM DD')}
                      </Text>
                    </div>
                  </div>
                  <Tag color={holiday.type === 'religious' ? 'orange' : holiday.type === 'festival' ? 'purple' : 'blue'}>
                    {holiday.type}
                  </Tag>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Text type="secondary">यस महिना कुनै छुट्टी छैन</Text>
            </div>
          )}
        </Card>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        open={isLeaveModalVisible}
        onCancel={() => setIsLeaveModalVisible(false)}
      />

      {/* Event/Holiday Detail Modal */}
      <EventHolidayModal
        open={isEventModalVisible}
        onCancel={() => setIsEventModalVisible(false)}
        selectedDate={selectedDate.format('YYYY-MM-DD')}
        events={calendarData}
        holidays={holidayData}
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

export default NepaliOnlyCalendar;
