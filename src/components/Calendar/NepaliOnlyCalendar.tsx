import React, { useState, useMemo } from 'react';
import { Card, Modal, Typography, Space, Button, Avatar, Badge, Divider, Row, Col, Statistic, Progress, Tag, Spin, Alert } from 'antd';
import { LeftOutlined, RightOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, HourglassOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { DualDateConverter } from '../../utils/dateConverter';
import type { CalendarEvent } from '../../types/calendar';
import { useHolidays } from '../../hooks/holiday/useHoliday';
import { useCalendarEvents } from '../../hooks/calendar/useCalendar';
import { useWorklogbyUser } from '../../hooks/worklog/useWorklogbyUser';
import type { HolidayType } from '../../types/holiday';

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
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentViewDate, setCurrentViewDate] = useState(today);
  const [isWorklogModalVisible, setIsWorklogModalVisible] = useState(false);
  
  // Fetch real data from backend
  const { data: holidayData, isLoading: holidaysLoading, error: holidaysError } = useHolidays();
  const { data: calendarData, isLoading: calendarLoading, error: calendarError } = useCalendarEvents();
  const { data: worklogData, isLoading: worklogLoading, error: worklogError } = useWorklogbyUser('all');
  
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

  // Get worklog data for selected date
  const selectedDateWorklog = useMemo(() => {
    if (!worklogData) return null;
    const dateWorklogs = worklogData.filter((worklog: any) => 
      dayjs(worklog.date).isSame(selectedDate, 'day')
    );
    
    if (dateWorklogs.length === 0) return null;

    // Calculate total hours and efficiency
    let totalHours = 0;
    dateWorklogs.forEach((worklog: any) => {
      if (worklog.startTime && worklog.endTime) {
        const start = dayjs(`${worklog.date} ${worklog.startTime}`);
        const end = dayjs(`${worklog.date} ${worklog.endTime}`);
        totalHours += end.diff(start, 'hour', true);
      }
    });

    const expectedHours = 8.0;
    const efficiency = Math.round((totalHours / expectedHours) * 100);

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      expectedHours,
      efficiency,
      tasks: dateWorklogs.map((worklog: any) => ({
        id: worklog.id,
        title: worklog.description || 'Work Task',
        duration: worklog.startTime && worklog.endTime ? 
          dayjs(`${worklog.date} ${worklog.endTime}`).diff(dayjs(`${worklog.date} ${worklog.startTime}`), 'hour', true) : 0,
        status: worklog.status?.toLowerCase() || 'pending'
      }))
    };
  }, [worklogData, selectedDate]);

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
    // Open worklog modal for any date click
    setIsWorklogModalVisible(true);
  };

  const getEventsForDate = (date: Dayjs) => {
    if (!calendarData) return [];
    return calendarData.filter((event: any) => dayjs(event.date).isSame(date, 'day'));
  };

  const getHolidaysForDate = (date: Dayjs) => {
    if (!holidayData) return [];
    return holidayData.filter((holiday: HolidayType) => dayjs(holiday.date).isSame(date, 'day'));
  };

  const isToday = (date: Dayjs) => date.isSame(today, 'day');
  const isCurrentMonth = (date: Dayjs) => date.isSame(currentViewDate, 'month');
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
        
        {/* Event Indicators */}
        <div className="flex flex-wrap justify-center gap-1">
          {dayHolidays.map((_: any, idx: number) => (
            <div key={idx} className="text-xs">
              🎉
            </div>
          ))}
          {dayEvents.slice(0, 2).map((event: any, idx: number) => (
            <div key={idx} className="text-xs" title={event.title || event.description}>
              {event.status === 'approved' && '✅'}
              {event.status === 'pending' && '⏳'}
              {event.status === 'rejected' && '❌'}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-blue-600 font-semibold">+{dayEvents.length - 2}</div>
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
          
          <Button 
            onClick={goToToday} 
            type="primary" 
            className="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
          >
            आज
          </Button>
        </div>
      </div>

        {/* Monthly Holidays Summary */}
        <Card className="mb-4 border border-gray-200 shadow-sm">
          <Title level={5} className="text-gray-800 mb-3 flex items-center">
            <CalendarOutlined className="mr-2 text-orange-500" />
            यस महिनाका छुट्टी र चाडपर्वहरू
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
        </Card>      {/* Calendar Container */}
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

      {/* Worklog Report Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-2 text-blue-600" />
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {nepaliMonths[DualDateConverter.gregorianToNepali(selectedDate).getMonth()]} {DualDateConverter.gregorianToNepali(selectedDate).getDate()}, {DualDateConverter.gregorianToNepali(selectedDate).getYear()}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate.format('dddd, MMMM D, YYYY')}
              </div>
            </div>
          </div>
        }
        open={isWorklogModalVisible}
        onCancel={() => setIsWorklogModalVisible(false)}
        footer={null}
        width={700}
        className="worklog-modal"
      >
        <div className="worklog-content">
          {worklogLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <Text className="ml-2" type="secondary">Loading worklog data...</Text>
            </div>
          ) : selectedDateWorklog ? (
            <>
              {/* Work Summary */}
              <Row gutter={16} className="mb-6">
                <Col span={8}>
                  <Statistic
                    title="कुल काम गरेको समय"
                    value={selectedDateWorklog.totalHours}
                    suffix="घण्टा"
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="अपेक्षित समय"
                    value={selectedDateWorklog.expectedHours}
                    suffix="घण्टा"
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<HourglassOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="कार्यक्षमता"
                    value={selectedDateWorklog.efficiency}
                    suffix="%"
                    valueStyle={{ color: selectedDateWorklog.efficiency >= 100 ? '#52c41a' : '#faad14' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
              </Row>

              {/* Efficiency Progress */}
              <div className="mb-6">
                <Text strong className="mb-2 block">दैनिक कार्यक्षमता</Text>
                <Progress 
                  percent={selectedDateWorklog.efficiency} 
                  strokeColor={selectedDateWorklog.efficiency >= 100 ? '#52c41a' : '#faad14'}
                  showInfo={true}
                />
              </div>

              <Divider />

              {/* Task Details */}
              <Title level={5} className="mb-4">आजका कार्यहरू</Title>
              <div className="space-y-3">
                {selectedDateWorklog.tasks.map((task: any) => (
                  <Card key={task.id} size="small" className="bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-3" />
                        <div>
                          <Text strong className="text-gray-800">{task.title}</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            Status: <Tag color={task.status === 'approved' ? 'green' : task.status === 'pending' ? 'orange' : 'red'}>
                              {task.status}
                            </Tag>
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text strong className="text-blue-600">{Math.round(task.duration * 10) / 10}h</Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CalendarOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <br />
              <Title level={4} type="secondary">यो दिनमा कुनै कार्य रेकर्ड छैन</Title>
              <Text type="secondary">
                {selectedDate.format('dddd, MMMM D, YYYY')} मा कुनै worklog फेला परेन।
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NepaliOnlyCalendar;
