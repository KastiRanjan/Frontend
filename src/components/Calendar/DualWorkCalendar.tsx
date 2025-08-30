import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Card, Tooltip, Select, Button, Modal, Tag, Typography, Switch, Space, Divider } from 'antd';
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

interface DualWorkCalendarProps {
  showFilters?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

const DualWorkCalendar: React.FC<DualWorkCalendarProps> = ({
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
          color: '#f50',
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
            color: '#722ed1',
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
      case 'approved': return '#52c41a';
      case 'pending': return '#faad14';
      case 'rejected': return '#ff4d4f';
      case 'approved_by_lead': return '#1890ff';
      case 'approved_by_pm': return '#722ed1';
      default: return '#d9d9d9';
    }
  };

  const getEventType = (type: string): string => {
    switch (type) {
      case 'leave': return 'processing';
      case 'holiday': return 'error';
      case 'worklog': return 'success';
      default: return 'default';
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

  // Enhanced date cell render with dual date system
  const dateCellRender = (value: Dayjs) => {
    const dayEvents = getEventsForDate(value);
    const dualDate = DualDateConverter.createDualDate(value);
    const isNepaliWeekend = DualDateConverter.isNepaliWeekend(value);
    
    return (
      <div className="dual-date-cell">
        {/* Dual date display */}
        {showDualDates && (
          <div className="dual-date-display">
            <div className={`date-primary ${primaryDateSystem === 'gregorian' ? 'gregorian' : 'nepali'}`}>
              {primaryDateSystem === 'gregorian' 
                ? value.format('DD') 
                : dualDate.nepali.getDate().toString()
              }
            </div>
            <div className={`date-secondary ${primaryDateSystem === 'gregorian' ? 'nepali' : 'gregorian'}`}>
              {primaryDateSystem === 'gregorian' 
                ? dualDate.nepali.getDate().toString()
                : value.format('DD')
              }
            </div>
          </div>
        )}
        
        {/* Weekend indicator for Nepali calendar */}
        {isNepaliWeekend && (
          <div className="nepali-weekend-indicator">
            <Tag color="blue">Sat</Tag>
          </div>
        )}
        
        {/* Events */}
        <div className="events">
          {dayEvents.slice(0, compact ? 1 : 2).map(event => (
            <Badge
              key={event.id}
              status={getEventType(event.type) as any}
              text={
                <Tooltip title={
                  <div>
                    <div><strong>{event.title}</strong></div>
                    {event.description && <div>{event.description}</div>}
                    {event.dualDate && showDualDates && (
                      <div style={{ marginTop: '8px', fontSize: '11px' }}>
                        <div>English: {event.dualDate.start.gregorian.format('MMM DD, YYYY')}</div>
                        <div>Nepali: {event.dualDate.start.nepali.format('MMMM DD, YYYY', 'np')}</div>
                      </div>
                    )}
                  </div>
                }>
                  <Text 
                    className="event-text" 
                    ellipsis={{ tooltip: false }}
                    style={{ fontSize: compact ? '9px' : '11px' }}
                  >
                    {compact ? event.title.substring(0, 8) + '...' : 
                     event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                  </Text>
                </Tooltip>
              }
            />
          ))}
          {dayEvents.length > (compact ? 1 : 2) && (
            <Text type="secondary" style={{ fontSize: '9px' }}>
              +{dayEvents.length - (compact ? 1 : 2)}
            </Text>
          )}
        </div>
      </div>
    );
  };

  const onSelect = (value: Dayjs) => {
    setSelectedDate(value);
    const dayEvents = getEventsForDate(value);
    if (dayEvents.length > 0 || showDualDates) {
      setSelectedEvents(dayEvents);
      setDetailModalVisible(true);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const canViewAll = profile?.role?.permission?.includes('leave:read') || 
                    profile?.role?.permission?.includes('admin');

  // Header render with dual date info
  const headerRender = ({ value, onChange }: any) => {
    const dualDate = DualDateConverter.createDualDate(value);
    const monthNames = DualDateConverter.getMonthNames();
    
    return (
      <div className="dual-calendar-header">
        <div className="date-navigation">
          <Button onClick={() => onChange(value.subtract(1, 'month'))}>‹</Button>
          <div className="month-year-display">
            <div className="primary-date">
              {primaryDateSystem === 'gregorian' 
                ? value.format('MMMM YYYY')
                : `${monthNames.nepaliEn[dualDate.nepali.getMonth()]} ${dualDate.nepali.getYear()}`
              }
            </div>
            {showDualDates && (
              <div className="secondary-date">
                {primaryDateSystem === 'gregorian' 
                  ? `${monthNames.nepaliEn[dualDate.nepali.getMonth()]} ${dualDate.nepali.getYear()}`
                  : value.format('MMMM YYYY')
                }
              </div>
            )}
          </div>
          <Button onClick={() => onChange(value.add(1, 'month'))}>›</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="dual-work-calendar">
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: '8px' }} />
              <Title level={4} style={{ margin: 0 }}>
                {showDualDates ? 'Dual Calendar System' : 'Work Calendar'}
              </Title>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {showFilters && (
                <>
                  {canViewAll && (
                    <Select
                      value={viewType}
                      onChange={setViewType}
                      size="small"
                      style={{ width: 80 }}
                    >
                      <Option value="all">All</Option>
                      <Option value="my">My</Option>
                      <Option value="team">Team</Option>
                    </Select>
                  )}
                  <Select
                    value={eventFilter}
                    onChange={setEventFilter}
                    size="small"
                    style={{ width: 100 }}
                  >
                    <Option value="all">All Events</Option>
                    <Option value="leave">Leave</Option>
                    <Option value="holiday">Holiday</Option>
                    <Option value="worklog">Worklog</Option>
                  </Select>
                </>
              )}
              
              <Divider type="vertical" />
              
              {/* Dual Date System Controls */}
              <Space size="small">
                <Tooltip title="Show Dual Dates">
                  <Switch
                    size="small"
                    checked={showDualDates}
                    onChange={setShowDualDates}
                    checkedChildren={<GlobalOutlined />}
                    unCheckedChildren={<CalendarOutlined />}
                  />
                </Tooltip>
                
                {showDualDates && (
                  <Select
                    value={primaryDateSystem}
                    onChange={setPrimaryDateSystem}
                    size="small"
                    style={{ width: 90 }}
                  >
                    <Option value="gregorian">English</Option>
                    <Option value="nepali">Nepali</Option>
                  </Select>
                )}
              </Space>
            </div>
          </div>
        }
        className={`${compact ? 'calendar-compact' : ''} dual-calendar`}
      >
        {/* Today's dual date display */}
        {showDualDates && (
          <div className="today-dual-date" style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Text type="secondary">Today: </Text>
            <Text strong>
              {DualDateConverter.formatDualDate(DualDateConverter.getToday(), true)}
            </Text>
          </div>
        )}

        <Calendar
          cellRender={dateCellRender}
          headerRender={showDualDates ? headerRender : undefined}
          onSelect={onSelect}
          value={selectedDate}
          style={{ minHeight: compact ? '350px' : '600px' }}
        />

        {/* Enhanced Event Details Modal with Dual Date */}
        <Modal
          title={
            <div>
              <div>Events for {selectedDate.format('MMMM D, YYYY')}</div>
              {showDualDates && (
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  ({currentDualDate.nepali.format('MMMM DD, YYYY', 'np')})
                </Text>
              )}
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {showDualDates && (
            <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f8f9fa' }}>
              <Title level={5} style={{ marginBottom: '8px' }}>Date Information</Title>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <Text strong>Gregorian Calendar:</Text>
                  <div>{currentDualDate.gregorian.format('dddd, MMMM DD, YYYY')}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Day {currentDualDate.gregorian.format('DDD')} of {currentDualDate.gregorian.year()}
                  </div>
                </div>
                <div>
                  <Text strong>Nepali Calendar:</Text>
                  <div>{currentDualDate.nepali.format('dddd, MMMM DD, YYYY', 'np')}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {DualDateConverter.isNepaliWeekend(currentDualDate.gregorian) ? 'Weekend (Saturday)' : 'Weekday'}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedEvents.length > 0 ? (
              selectedEvents.map(event => (
                <Card 
                  key={event.id} 
                  size="small"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleEventClick(event)}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ marginBottom: '4px' }}>{event.title}</Title>
                      <Text type="secondary">{event.description}</Text>
                      {event.user && (
                        <div style={{ marginTop: '8px' }}>
                          <Text strong>User: </Text>
                          <Text>{event.user.firstName} {event.user.lastName}</Text>
                        </div>
                      )}
                      {event.dualDate && showDualDates && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                          <div><Text strong>English:</Text> {event.dualDate.start.gregorian.format('MMM DD, YYYY')}</div>
                          <div><Text strong>Nepali:</Text> {event.dualDate.start.nepali.format('MMMM DD, YYYY', 'np')}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Tag color={event.color}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Tag>
                      {event.status && (
                        <Tag style={{ marginTop: '4px' }}>
                          {event.status.replace(/_/g, ' ').toUpperCase()}
                        </Tag>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Text type="secondary">No events scheduled for this date</Text>
              </div>
            )}
          </div>
        </Modal>
      </Card>

      <style>{`
        .dual-work-calendar .dual-date-cell {
          position: relative;
          min-height: 80px;
        }
        
        .dual-date-display {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }
        
        .date-primary {
          font-size: 16px;
          font-weight: bold;
          color: #1890ff;
        }
        
        .date-secondary {
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        }
        
        .nepali-weekend-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
        }
        
        .events {
          margin-top: 4px;
        }
        
        .events .ant-badge-status {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 11px;
          margin-bottom: 2px;
          display: block;
        }
        
        .event-text {
          display: inline-block;
          max-width: 80px;
        }
        
        .dual-calendar-header {
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 16px;
        }
        
        .date-navigation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        
        .month-year-display {
          text-align: center;
          min-width: 200px;
        }
        
        .primary-date {
          font-size: 18px;
          font-weight: bold;
          color: #1890ff;
        }
        
        .secondary-date {
          font-size: 14px;
          color: #666;
          margin-top: 2px;
        }
        
        .today-dual-date {
          padding: 8px 16px;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
          border-radius: 6px;
        }
        
        .calendar-compact .dual-date-cell {
          min-height: 60px;
        }
        
        .calendar-compact .date-primary {
          font-size: 14px;
        }
        
        .calendar-compact .date-secondary {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
};

export default DualWorkCalendar;
