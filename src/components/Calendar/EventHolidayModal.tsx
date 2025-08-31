import React from "react";
import {
  Modal,
  Card,
  Tag,
  Descriptions,
  Typography,
  Divider,
  Space,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface EventHolidayModalProps {
  open: boolean;
  onCancel: () => void;
  selectedDate: string;
  events?: any[];
  holidays?: any[];
  worklogs?: any[];
}

const EventHolidayModal: React.FC<EventHolidayModalProps> = ({
  open,
  onCancel,
  selectedDate,
  events = [],
  holidays = [],
  worklogs = [],
}) => {
  const formatDate = (date: string) => dayjs(date).format('MMMM DD, YYYY (dddd)');
  const formatTime = (time: string) => dayjs(`2000-01-01 ${time}`).format('h:mm A');
  
  const selectedDateHolidays = holidays.filter((holiday: any) =>
    dayjs(holiday.date).isSame(dayjs(selectedDate), 'day')
  );

  const selectedDateEvents = events.filter((event: any) =>
    dayjs(event.date).isSame(dayjs(selectedDate), 'day')
  );

  const selectedDateWorklogs = worklogs.filter((worklog: any) =>
    dayjs(worklog.startTime).isSame(dayjs(selectedDate), 'day')
  );

  const totalWorkHours = selectedDateWorklogs.reduce((total: number, worklog: any) => {
    const start = dayjs(worklog.startTime);
    const end = dayjs(worklog.endTime);
    return total + end.diff(start, 'hour', true);
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          <span>Day Details - {formatDate(selectedDate)}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <div className="space-y-6">
        {/* Holidays Section */}
        {selectedDateHolidays.length > 0 && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <InfoCircleOutlined className="text-red-500" />
                <span>Holidays</span>
              </div>
            }
            className="border-red-200"
          >
            <div className="space-y-3">
              {selectedDateHolidays.map((holiday: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <Title level={5} className="m-0 text-red-700">
                        {holiday.title}
                      </Title>
                      {holiday.description && (
                        <Text type="secondary" className="mt-1 block">
                          {holiday.description}
                        </Text>
                      )}
                    </div>
                    <Tag color="red">Holiday</Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Events Section */}
        {selectedDateEvents.length > 0 && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-blue-500" />
                <span>Events</span>
              </div>
            }
            className="border-blue-200"
          >
            <div className="space-y-3">
              {selectedDateEvents.map((event: any, index: number) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Title level={5} className="m-0 text-blue-700">
                        {event.title}
                      </Title>
                      {event.description && (
                        <Text type="secondary" className="mt-1 block">
                          {event.description}
                        </Text>
                      )}
                      {event.startTime && event.endTime && (
                        <div className="flex items-center gap-1 mt-2">
                          <ClockCircleOutlined className="text-blue-500" />
                          <Text className="text-sm">
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </Text>
                        </div>
                      )}
                    </div>
                    <Tag color="blue">Event</Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Work Logs Section */}
        {selectedDateWorklogs.length > 0 && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-green-500" />
                <span>Work Logs</span>
                <Tag color="green" className="ml-2">
                  Total: {totalWorkHours.toFixed(1)}h
                </Tag>
              </div>
            }
            className="border-green-200"
          >
            <div className="space-y-3">
              {selectedDateWorklogs.map((worklog: any, index: number) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-green-600" />
                      <Text strong>{worklog.user?.firstName} {worklog.user?.lastName}</Text>
                    </div>
                    <Tag color={getStatusColor(worklog.status)}>
                      {worklog.status}
                    </Tag>
                  </div>
                  
                  <Descriptions size="small" column={2} className="mb-3">
                    <Descriptions.Item label="Time">
                      {dayjs(worklog.startTime).format('HH:mm')} - {dayjs(worklog.endTime).format('HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Duration">
                      {dayjs(worklog.endTime)
                        .diff(dayjs(worklog.startTime), 'hour', true)
                        .toFixed(1)}h
                    </Descriptions.Item>
                    {worklog.project && (
                      <Descriptions.Item label="Project" span={2}>
                        {worklog.project.name}
                      </Descriptions.Item>
                    )}
                    {worklog.task && (
                      <Descriptions.Item label="Task" span={2}>
                        {worklog.task.name}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  
                  {worklog.description && (
                    <div>
                      <Text strong className="block mb-1">Description:</Text>
                      <Text type="secondary" className="text-sm">
                        {worklog.description}
                      </Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {selectedDateHolidays.length === 0 && 
         selectedDateEvents.length === 0 && 
         selectedDateWorklogs.length === 0 && (
          <Card className="text-center py-8">
            <CalendarOutlined className="text-4xl text-gray-400 mb-4" />
            <Title level={4} type="secondary">
              No events, holidays, or work logs
            </Title>
            <Text type="secondary">
              This day doesn't have any scheduled events, holidays, or work logs.
            </Text>
          </Card>
        )}

        <Divider />
        
        {/* Summary */}
        <div className="flex justify-between text-sm text-gray-600">
          <Space>
            <span>Holidays: {selectedDateHolidays.length}</span>
            <span>Events: {selectedDateEvents.length}</span>
            <span>Work Logs: {selectedDateWorklogs.length}</span>
          </Space>
          {totalWorkHours > 0 && (
            <span>Total Work: {totalWorkHours.toFixed(1)} hours</span>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EventHolidayModal;
