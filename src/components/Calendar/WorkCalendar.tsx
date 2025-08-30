import React, { useState } from 'react';
import { Calendar, Badge, Card, Tooltip, Select, Button, Modal, Tag, Typography } from 'antd';
import { CalendarOutlined, FilterOutlined } from '@ant-design/icons';
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

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { Option } = Select;

interface WorkCalendarProps {
  showFilters?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

const WorkCalendar: React.FC<WorkCalendarProps> = ({
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

  // Fetch data
  const { data: leaves = [] } = useLeaves();
  const { data: holidays = [] } = useHolidays();

  // Transform data to calendar events
  const transformToCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add leave events
    if (eventFilter === 'all' || eventFilter === 'leave') {
      leaves.forEach((leave: LeaveType) => {
        // Filter based on viewType (simplified without profile id comparison for now)
        if (viewType === 'my') return; // Skip for now
        
        events.push({
          id: `leave-${leave.id}`,
          title: `${leave.user.firstName} ${leave.user.lastName} - Leave`,
          start: leave.startDate,
          end: leave.endDate,
          type: 'leave',
          status: leave.status,
          user: leave.user,
          description: leave.reason,
          color: getLeaveColor(leave.status)
        });
      });
    }

    // Add holiday events
    if (eventFilter === 'all' || eventFilter === 'holiday') {
      holidays.forEach((holiday: HolidayType) => {
        events.push({
          id: `holiday-${holiday.id}`,
          title: holiday.title,
          start: holiday.date,
          type: 'holiday',
          description: holiday.description,
          color: '#f50'
        });
      });
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

  const dateCellRender = (value: Dayjs) => {
    const dayEvents = getEventsForDate(value);
    
    return (
      <div className="events">
        {dayEvents.slice(0, compact ? 1 : 3).map(event => (
          <Badge
            key={event.id}
            status={getEventType(event.type) as any}
            text={
              <Tooltip title={`${event.title}${event.description ? ': ' + event.description : ''}`}>
                <Text 
                  className="event-text" 
                  ellipsis={{ tooltip: false }}
                  style={{ fontSize: compact ? '10px' : '12px' }}
                >
                  {compact ? event.title.substring(0, 10) + '...' : event.title}
                </Text>
              </Tooltip>
            }
          />
        ))}
        {dayEvents.length > (compact ? 1 : 3) && (
          <Text type="secondary" style={{ fontSize: '10px' }}>
            +{dayEvents.length - (compact ? 1 : 3)} more
          </Text>
        )}
      </div>
    );
  };

  const onSelect = (value: Dayjs) => {
    setSelectedDate(value);
    const dayEvents = getEventsForDate(value);
    if (dayEvents.length > 0) {
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

  return (
    <div>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: '8px' }} />
              <Title level={4} style={{ margin: 0 }}>Work Calendar</Title>
            </div>
            {showFilters && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              </div>
            )}
          </div>
        }
        className={compact ? 'calendar-compact' : ''}
      >
        <Calendar
          cellRender={dateCellRender}
          onSelect={onSelect}
          value={selectedDate}
          style={{ minHeight: compact ? '300px' : '500px' }}
        />

        {/* Event Details Modal */}
        <Modal
          title={`Events for ${selectedDate.format('MMMM D, YYYY')}`}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ]}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedEvents.map(event => (
              <Card 
                key={event.id} 
                size="small"
                style={{ cursor: 'pointer' }}
                onClick={() => handleEventClick(event)}
                hoverable
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Title level={5} style={{ marginBottom: '4px' }}>{event.title}</Title>
                    <Text type="secondary">{event.description}</Text>
                    {event.user && (
                      <div style={{ marginTop: '8px' }}>
                        <Text strong>User: </Text>
                        <Text>{event.user.firstName} {event.user.lastName}</Text>
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
            ))}
          </div>
        </Modal>
      </Card>

      <style>{`
        .calendar-compact .ant-picker-calendar {
          font-size: 12px;
        }
        
        .events {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .events .ant-badge-status {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12px;
          margin-bottom: 2px;
        }
        
        .event-text {
          display: inline-block;
          max-width: 100px;
        }
        
        .ant-picker-calendar .ant-picker-calendar-date {
          padding: 4px 8px;
        }
      `}</style>
    </div>
  );
};

export default WorkCalendar;
