import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Card, Tooltip, Select, Button, Modal, Tag, Typography, Switch, Space, Divider, Avatar } from 'antd';
import { CalendarOutlined, GlobalOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useLeaves } from '../../hooks/leave/useLeave';
import { useHolidays } from '../../hooks/holiday/useHoliday';
import { useSession } from '../../context/SessionContext';
import { CalendarEvent } from '../../types/calendar';
import { LeaveType } from '../../types/leave';
import { HolidayType } from '../../types/holiday';
import DualDateConverter, { DualDate } from '../../utils/dateConverter';

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { Option } = Select;

interface ImprovedDualCalendarProps {
  showFilters?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

const ImprovedDualCalendar: React.FC<ImprovedDualCalendarProps> = ({
  showFilters = true,
  onEventClick,
  compact = false
}) => {
  const { profile } = useSession();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewType, setViewType] = useState<'all' | 'my' | 'team'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'leave' | 'holiday' | 'worklog'>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  
  // Dual date system state
  const [showDualDates, setShowDualDates] = useState(true);
  const [primaryDateSystem, setPrimaryDateSystem] = useState<'gregorian' | 'nepali'>('gregorian');
  const [currentDualDate, setCurrentDualDate] = useState<DualDate>(DualDateConverter.getToday());

  // Update dual date when selected date changes
  useEffect(() => {
    setCurrentDualDate(DualDateConverter.createDualDate(selectedDate));
  }, [selectedDate]);

  // Fetch data
  const { data: leaves = [] } = useLeaves();
  const { data: holidays = [] } = useHolidays();

  // Transform data to calendar events with dual date support
  const transformToCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add leave events
    if (eventFilter === 'all' || eventFilter === 'leave') {
      leaves.forEach((leave: LeaveType) => {
        if (viewType === 'my') return; // Skip for now
        
        const startDual = DualDateConverter.createDualDate(dayjs(leave.startDate));
        const endDual = DualDateConverter.createDualDate(dayjs(leave.endDate));
        
        events.push({
          id: `leave-${leave.id}`,
          title: `${leave.user.firstName} ${leave.user.lastName} - Leave`,
          start: leave.startDate,
          end: leave.endDate,
          type: 'leave',
          status: leave.status,
          user: leave.user,
          description: leave.reason,
          color: getLeaveColor(leave.status),
          dualDate: {
            start: startDual,
            end: endDual
          }
        });
      });
    }

    // Add holiday events
    if (eventFilter === 'all' || eventFilter === 'holiday') {
      holidays.forEach((holiday: HolidayType) => {
        const holidayDual = DualDateConverter.createDualDate(dayjs(holiday.date));
        
        events.push({
          id: `holiday-${holiday.id}`,
          title: holiday.title,
          start: holiday.date,
          type: 'holiday',
          description: holiday.description,
          color: '#ff4757',
          dualDate: {
            start: holidayDual
          }
        });
      });
    }

    // Add Nepali festival events if showing dual dates
    if (showDualDates && (eventFilter === 'all' || eventFilter === 'holiday')) {
      // Add festivals for the current month
      const startOfMonth = selectedDate.startOf('month');
      const endOfMonth = selectedDate.endOf('month');
      
      for (let date = startOfMonth; date.isBefore(endOfMonth.add(1, 'day')); date = date.add(1, 'day')) {
        const dualDate = DualDateConverter.createDualDate(date);
        const nepaliEvents = DualDateConverter.getNepaliEvents(dualDate.nepali);
        
        nepaliEvents.forEach((eventName, index) => {
          events.push({
            id: `nepali-festival-${date.format('YYYY-MM-DD')}-${index}`,
            title: eventName,
            start: date.format('YYYY-MM-DD'),
            type: 'holiday',
            description: 'Traditional Nepali Festival',
            color: '#5f27cd',
            dualDate: {
              start: dualDate
            }
          });
        });
      }
    }

    return events;
  };

  const getLeaveColor = (status: string): string => {
    switch (status) {
      case 'approved': return '#00d2d3';
      case 'pending': return '#ff9ff3';
      case 'rejected': return '#ff6b6b';
      case 'approved_by_lead': return '#54a0ff';
      case 'approved_by_pm': return '#5f27cd';
      default: return '#c7ecee';
    }
  };

  const getEventIcon = (type: string, status?: string) => {
    switch (type) {
      case 'leave':
        return status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❌';
      case 'holiday':
        return '🎉';
      case 'worklog':
        return '💼';
      default:
        return '📅';
    }
  };

  const events = transformToCalendarEvents();

  // Get events for a specific date
  const getEventsForDate = (date: Dayjs): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = dayjs(event.start);
      const eventEnd = event.end ? dayjs(event.end) : eventStart;
      return (date as any).isSameOrAfter(eventStart, 'day') && (date as any).isSameOrBefore(eventEnd, 'day');
    });
  };

  // Enhanced date cell render with improved UI
  const dateCellRender = (value: Dayjs) => {
    const dayEvents = getEventsForDate(value);
    const dualDate = DualDateConverter.createDualDate(value);
    const isNepaliWeekend = DualDateConverter.isNepaliWeekend(value);
    const isToday = value.isSame(dayjs(), 'day');
    
    return (
      <div className={`improved-date-cell ${isToday ? 'today' : ''} ${isNepaliWeekend ? 'nepali-weekend' : ''}`}>
        {/* Improved dual date display */}
        <div className="date-header">
          {showDualDates ? (
            <div className="dual-date-container">
              <div className="primary-date">
                {primaryDateSystem === 'gregorian' 
                  ? value.format('DD') 
                  : dualDate.nepali.getDate().toString().padStart(2, '0')
                }
              </div>
              <div className="secondary-date">
                {primaryDateSystem === 'gregorian' 
                  ? dualDate.nepali.getDate().toString()
                  : value.format('DD')
                }
              </div>
            </div>
          ) : (
            <div className="single-date">
              {value.format('DD')}
            </div>
          )}
          
          {/* Today indicator */}
          {isToday && (
            <div className="today-indicator">
              <Badge status="processing" />
            </div>
          )}
          
          {/* Weekend indicator */}
          {isNepaliWeekend && (
            <div className="weekend-indicator">
              <Tag color="cyan" className="weekend-tag">Sat</Tag>
            </div>
          )}
        </div>

        {/* Improved events display */}
        <div className="events-container">
          {dayEvents.slice(0, compact ? 2 : 3).map((event) => (
            <div key={event.id} className={`event-item ${event.type}`}>
              <Tooltip 
                title={
                  <div className="event-tooltip">
                    <div className="event-title">
                      {getEventIcon(event.type, event.status)} {event.title}
                    </div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                    {event.status && (
                      <div className="event-status">
                        Status: <Tag color={event.color}>{event.status.replace(/_/g, ' ')}</Tag>
                      </div>
                    )}
                    {event.dualDate && showDualDates && (
                      <div className="dual-date-info">
                        <div>📅 {event.dualDate.start.gregorian.format('MMM DD, YYYY')}</div>
                        <div>🗓️ {event.dualDate.start.nepali.format('MMMM DD, YYYY', 'np')}</div>
                      </div>
                    )}
                  </div>
                }
                placement="top"
              >
                <div 
                  className="event-bar"
                  style={{ 
                    backgroundColor: event.color,
                    borderLeft: `3px solid ${event.color}`,
                  }}
                >
                  <span className="event-icon">{getEventIcon(event.type, event.status)}</span>
                  <span className="event-text">
                    {event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title}
                  </span>
                </div>
              </Tooltip>
            </div>
          ))}
          
          {/* More events indicator */}
          {dayEvents.length > (compact ? 2 : 3) && (
            <div className="more-events">
              <Tag color="blue" className="more-tag">
                +{dayEvents.length - (compact ? 2 : 3)} more
              </Tag>
            </div>
          )}
        </div>
      </div>
    );
  };

  const onSelect = (value: Dayjs) => {
    setSelectedDate(value);
    const dayEvents = getEventsForDate(value);
    setSelectedEvents(dayEvents);
    setDetailModalVisible(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const canViewAll = profile?.role?.permission?.includes('leave:read') || 
                    profile?.role?.permission?.includes('admin');

  // Custom header render with improved design
  const headerRender = ({ value, onChange }: any) => {
    const dualDate = DualDateConverter.createDualDate(value);
    const monthNames = DualDateConverter.getMonthNames();
    
    return (
      <div className="improved-calendar-header">
        <div className="header-content">
          <Button 
            type="text" 
            icon={<span>‹</span>} 
            onClick={() => onChange(value.subtract(1, 'month'))}
            className="nav-button prev"
          />
          
          <div className="month-year-info">
            <div className="primary-month-year">
              {primaryDateSystem === 'gregorian' 
                ? value.format('MMMM YYYY')
                : `${monthNames.nepaliEn[dualDate.nepali.getMonth()]} ${dualDate.nepali.getYear()}`
              }
            </div>
            {showDualDates && (
              <div className="secondary-month-year">
                {primaryDateSystem === 'gregorian' 
                  ? `${monthNames.nepaliEn[dualDate.nepali.getMonth()]} ${dualDate.nepali.getYear()}`
                  : value.format('MMMM YYYY')
                }
              </div>
            )}
          </div>
          
          <Button 
            type="text" 
            icon={<span>›</span>} 
            onClick={() => onChange(value.add(1, 'month'))}
            className="nav-button next"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="improved-dual-calendar">
      <Card 
        className="calendar-card"
        title={
          <div className="calendar-title">
            <div className="title-left">
              <CalendarOutlined className="title-icon" />
              <Title level={4} className="title-text">
                {showDualDates ? 'Dual Calendar System' : 'Work Calendar'}
              </Title>
            </div>
            
            <div className="title-controls">
              {showFilters && (
                <Space size="middle">
                  {canViewAll && (
                    <Select
                      value={viewType}
                      onChange={setViewType}
                      size="small"
                      className="filter-select"
                    >
                      <Option value="all">All Events</Option>
                      <Option value="my">My Events</Option>
                      <Option value="team">Team Events</Option>
                    </Select>
                  )}
                  
                  <Select
                    value={eventFilter}
                    onChange={setEventFilter}
                    size="small"
                    className="filter-select"
                  >
                    <Option value="all">All Types</Option>
                    <Option value="leave">Leave Only</Option>
                    <Option value="holiday">Holidays Only</Option>
                    <Option value="worklog">Worklog Only</Option>
                  </Select>
                </Space>
              )}
              
              <Divider type="vertical" />
              
              <Space size="small">
                <Tooltip title="Toggle Dual Date System">
                  <Switch
                    size="small"
                    checked={showDualDates}
                    onChange={setShowDualDates}
                    checkedChildren={<GlobalOutlined />}
                    unCheckedChildren={<CalendarOutlined />}
                    className="dual-toggle"
                  />
                </Tooltip>
                
                {showDualDates && (
                  <Select
                    value={primaryDateSystem}
                    onChange={setPrimaryDateSystem}
                    size="small"
                    className="date-system-select"
                  >
                    <Option value="gregorian">English Primary</Option>
                    <Option value="nepali">Nepali Primary</Option>
                  </Select>
                )}
              </Space>
            </div>
          </div>
        }
      >
        {/* Today's information */}
        {showDualDates && (
          <div className="today-info">
            <Avatar 
              icon={<CalendarOutlined />} 
              size="small" 
              className="today-avatar"
            />
            <Text className="today-text">
              Today: <strong>{DualDateConverter.formatDualDate(DualDateConverter.getToday(), true)}</strong>
            </Text>
          </div>
        )}

        <Calendar
          cellRender={dateCellRender}
          headerRender={showDualDates ? headerRender : undefined}
          onSelect={onSelect}
          value={selectedDate}
          className="improved-calendar"
        />

        {/* Enhanced Event Details Modal */}
        <Modal
          title={
            <div className="modal-title">
              <CalendarOutlined className="modal-icon" />
              <div>
                <div className="modal-date">
                  {selectedDate.format('dddd, MMMM D, YYYY')}
                </div>
                {showDualDates && (
                  <Text type="secondary" className="modal-nepali-date">
                    {currentDualDate.nepali.format('dddd, MMMM DD, YYYY', 'np')}
                  </Text>
                )}
              </div>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
          className="event-modal"
        >
          {showDualDates && (
            <Card size="small" className="date-info-card">
              <div className="date-info-grid">
                <div className="date-info-item">
                  <div className="date-info-label">📅 Gregorian Calendar</div>
                  <div className="date-info-value">
                    {currentDualDate.gregorian.format('dddd, MMMM DD, YYYY')}
                  </div>
                  <div className="date-info-meta">
                    Day {currentDualDate.gregorian.format('DDD')} of {currentDualDate.gregorian.year()}
                  </div>
                </div>
                <div className="date-info-item">
                  <div className="date-info-label">🗓️ Nepali Calendar</div>
                  <div className="date-info-value">
                    {currentDualDate.nepali.format('dddd, MMMM DD, YYYY', 'np')}
                  </div>
                  <div className="date-info-meta">
                    {DualDateConverter.isNepaliWeekend(currentDualDate.gregorian) ? 'Weekend (Saturday)' : 'Weekday'}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="events-list">
            {selectedEvents.length > 0 ? (
              selectedEvents.map(event => (
                <Card 
                  key={event.id} 
                  size="small"
                  className={`event-card ${event.type}`}
                  onClick={() => handleEventClick(event)}
                  hoverable
                  style={{ borderLeft: `4px solid ${event.color}` }}
                >
                  <div className="event-content">
                    <div className="event-header">
                      <div className="event-icon-title">
                        <span className="event-emoji">{getEventIcon(event.type, event.status)}</span>
                        <Title level={5} className="event-title">{event.title}</Title>
                      </div>
                      <div className="event-badges">
                        <Tag color={event.color} className="event-type-tag">
                          {event.type.toUpperCase()}
                        </Tag>
                        {event.status && (
                          <Tag className="event-status-tag">
                            {event.status.replace(/_/g, ' ').toUpperCase()}
                          </Tag>
                        )}
                      </div>
                    </div>
                    
                    {event.description && (
                      <Text type="secondary" className="event-description">
                        {event.description}
                      </Text>
                    )}
                    
                    {event.user && (
                      <div className="event-user">
                        <Avatar size="small" className="user-avatar">
                          {event.user.firstName[0]}{event.user.lastName[0]}
                        </Avatar>
                        <Text>{event.user.firstName} {event.user.lastName}</Text>
                      </div>
                    )}
                    
                    {event.dualDate && showDualDates && (
                      <div className="event-dual-dates">
                        <div className="dual-date-item">
                          <Text strong>📅 English: </Text>
                          <Text>{event.dualDate.start.gregorian.format('MMM DD, YYYY')}</Text>
                        </div>
                        <div className="dual-date-item">
                          <Text strong>🗓️ Nepali: </Text>
                          <Text>{event.dualDate.start.nepali.format('MMMM DD, YYYY', 'np')}</Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="no-events">
                <div className="no-events-icon">📅</div>
                <Text type="secondary" className="no-events-text">
                  No events scheduled for this date
                </Text>
                {showDualDates && (
                  <Text type="secondary" className="no-events-subtext">
                    Enjoy your free day!
                  </Text>
                )}
              </div>
            )}
          </div>
        </Modal>
      </Card>

      <style>{`
        .improved-dual-calendar {
          width: 100%;
        }
        
        .calendar-card {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .calendar-card .ant-card-head {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          padding: 16px 24px;
        }
        
        .calendar-card .ant-card-head-title {
          color: white;
          padding: 0;
        }
        
        .calendar-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .title-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .title-icon {
          color: white;
          font-size: 20px;
        }
        
        .title-text {
          color: white !important;
          margin: 0 !important;
          font-weight: 600;
        }
        
        .title-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .filter-select, .date-system-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .filter-select .ant-select-selector,
        .date-system-select .ant-select-selector {
          background: transparent !important;
          color: white !important;
          border: none !important;
        }
        
        .dual-toggle {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .today-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          margin: -24px -24px 24px -24px;
        }
        
        .today-avatar {
          background: #667eea;
        }
        
        .today-text {
          color: #495057;
          font-size: 14px;
        }
        
        .improved-calendar {
          border-radius: 8px;
        }
        
        .improved-calendar .ant-picker-calendar-header {
          padding: 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .improved-calendar-header {
          padding: 20px 0;
          background: #fafbfc;
          border-bottom: 1px solid #e9ecef;
          margin-bottom: 16px;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }
        
        .nav-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          background: white;
          border: 1px solid #d1d5db;
          transition: all 0.2s;
        }
        
        .nav-button:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
          transform: scale(1.05);
        }
        
        .month-year-info {
          text-align: center;
          min-width: 250px;
        }
        
        .primary-month-year {
          font-size: 24px;
          font-weight: bold;
          color: #1a202c;
          margin-bottom: 4px;
        }
        
        .secondary-month-year {
          font-size: 16px;
          color: #718096;
        }
        
        .improved-date-cell {
          position: relative;
          min-height: 100px;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
          background: white;
          border: 1px solid transparent;
        }
        
        .improved-date-cell:hover {
          background: #f8f9ff;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
        
        .improved-date-cell.today {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .improved-date-cell.today .primary-date,
        .improved-date-cell.today .secondary-date,
        .improved-date-cell.today .single-date {
          color: white !important;
        }
        
        .improved-date-cell.nepali-weekend {
          background: #fff5f5;
          border-color: #fed7d7;
        }
        
        .date-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          position: relative;
        }
        
        .dual-date-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .primary-date {
          font-size: 20px;
          font-weight: bold;
          color: #2d3748;
          line-height: 1;
        }
        
        .secondary-date {
          font-size: 12px;
          color: #718096;
          font-weight: 500;
        }
        
        .single-date {
          font-size: 20px;
          font-weight: bold;
          color: #2d3748;
        }
        
        .today-indicator {
          position: absolute;
          top: -4px;
          right: -4px;
        }
        
        .weekend-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
        }
        
        .weekend-tag {
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 4px;
          line-height: 1;
        }
        
        .events-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: 60px;
          overflow: hidden;
        }
        
        .event-item {
          width: 100%;
        }
        
        .event-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0.9;
        }
        
        .event-bar:hover {
          opacity: 1;
          transform: translateX(2px);
        }
        
        .event-icon {
          font-size: 10px;
          flex-shrink: 0;
        }
        
        .event-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        
        .more-events {
          margin-top: 2px;
        }
        
        .more-tag {
          font-size: 9px;
          padding: 1px 4px;
          line-height: 1.2;
        }
        
        .event-tooltip {
          max-width: 300px;
        }
        
        .event-tooltip .event-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .event-tooltip .event-description {
          font-size: 12px;
          margin-bottom: 8px;
          color: #666;
        }
        
        .event-tooltip .event-status {
          margin-bottom: 8px;
        }
        
        .event-tooltip .dual-date-info {
          font-size: 11px;
          color: #888;
        }
        
        .event-tooltip .dual-date-info > div {
          margin-bottom: 2px;
        }
        
        .event-modal .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .event-modal .modal-icon {
          font-size: 20px;
          color: #667eea;
        }
        
        .event-modal .modal-date {
          font-size: 18px;
          font-weight: bold;
          color: #1a202c;
        }
        
        .event-modal .modal-nepali-date {
          font-size: 14px;
        }
        
        .date-info-card {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border: none;
          margin-bottom: 24px;
          border-radius: 8px;
        }
        
        .date-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .date-info-item {
          text-align: center;
        }
        
        .date-info-label {
          font-size: 14px;
          font-weight: bold;
          color: #4a5568;
          margin-bottom: 8px;
        }
        
        .date-info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 4px;
        }
        
        .date-info-meta {
          font-size: 12px;
          color: #718096;
        }
        
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .event-card {
          transition: all 0.2s;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        .event-content {
          padding: 4px 0;
        }
        
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .event-icon-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .event-emoji {
          font-size: 16px;
        }
        
        .event-title {
          margin: 0 !important;
          color: #1a202c;
        }
        
        .event-badges {
          display: flex;
          gap: 6px;
        }
        
        .event-type-tag {
          font-size: 10px;
          font-weight: bold;
          border-radius: 4px;
        }
        
        .event-status-tag {
          font-size: 10px;
          background: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }
        
        .event-description {
          display: block;
          margin-bottom: 8px;
          color: #718096;
        }
        
        .event-user {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .user-avatar {
          background: #667eea;
          font-size: 10px;
        }
        
        .event-dual-dates {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
        }
        
        .dual-date-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        
        .no-events {
          text-align: center;
          padding: 48px 24px;
          color: #718096;
        }
        
        .no-events-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .no-events-text {
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .no-events-subtext {
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .improved-date-cell {
            min-height: 80px;
            padding: 4px;
          }
          
          .primary-date {
            font-size: 16px;
          }
          
          .secondary-date {
            font-size: 10px;
          }
          
          .event-bar {
            padding: 1px 4px;
            font-size: 9px;
          }
          
          .date-info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ImprovedDualCalendar;
