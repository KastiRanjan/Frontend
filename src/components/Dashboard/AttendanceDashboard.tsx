import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Typography, Statistic, Badge, List, Tooltip, Space, Tag, Empty, Spin, DatePicker } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useDashboardAttendance } from '../../hooks/dashboard/useDashboardAttendance';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

// Types for better type safety
interface User {
  name: string;
  email: string;
  roleName?: string;
  clockInTime?: string;
  clockOutTime?: string;
  hasClockOut?: boolean;
  minutesDiff?: number;
}

// Constants
const DEFAULT_END_TIME = '17:00';
const THRESHOLD_MINUTES = 15;
const MAX_LIST_HEIGHT = '200px';

// Helper function to format time difference
const formatTimeDifference = (minutes: number): string => {
  const absMinutes = Math.abs(minutes);
  if (absMinutes >= 60) {
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${absMinutes}m`;
};

// Helper function to calculate time difference
const calculateTimeDiff = (time: string, referenceTime: string): number => {
  const timeMoment = dayjs(time, 'HH:mm:ss');
  const referenceMoment = dayjs(referenceTime, 'HH:mm');
  return timeMoment.diff(referenceMoment, 'minutes');
};

const AttendanceDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const { data, isLoading } = useDashboardAttendance(selectedDate);
  const [showPendingDetails, setShowPendingDetails] = useState(false);
  const [showTotalDetails, setShowTotalDetails] = useState(false);
  const [showClockedInDetails, setShowClockedInDetails] = useState(false);
  const [showClockedOutDetails, setShowClockedOutDetails] = useState(false);

  // Memoized calculations for better performance
  const clockedOutUsers = useMemo(() => {
    return data?.usersWithAttendance?.filter((user: User) => user.hasClockOut) || [];
  }, [data?.usersWithAttendance]);

  const clockedInUsers = useMemo(() => {
    return data?.usersWithAttendance?.filter((user: User) => user.clockInTime) || [];
  }, [data?.usersWithAttendance]);

  const earlyClockOuts = useMemo(() => {
    return clockedOutUsers
      .filter((user: User) => {
        if (!user.clockOutTime) return false;
        const diffMinutes = calculateTimeDiff(user.clockOutTime, DEFAULT_END_TIME);
        return diffMinutes <= -THRESHOLD_MINUTES;
      })
      .map((user: User) => ({
        ...user,
        clockOutDiff: calculateTimeDiff(user.clockOutTime!, DEFAULT_END_TIME)
      }));
  }, [clockedOutUsers]);

  const lateClockOuts = useMemo(() => {
    return clockedOutUsers
      .filter((user: User) => {
        if (!user.clockOutTime) return false;
        const diffMinutes = calculateTimeDiff(user.clockOutTime, DEFAULT_END_TIME);
        return diffMinutes >= THRESHOLD_MINUTES;
      })
      .map((user: User) => ({
        ...user,
        clockOutDiff: calculateTimeDiff(user.clockOutTime!, DEFAULT_END_TIME)
      }));
  }, [clockedOutUsers]);

  // Render scrollable list component
  const renderScrollableList = (
    users: any[],
    type: 'notClocked' | 'early' | 'late' | 'earlyOut' | 'lateOut'
  ) => {
    if (!users.length) return null;

    const isClockOut = type === 'earlyOut' || type === 'lateOut';

    return (
      <div style={{ marginTop: 12, maxHeight: MAX_LIST_HEIGHT, overflow: 'auto' }}>
        <List
          size="small"
          dataSource={users}
          renderItem={(user: any) => {
            const timeDiff = isClockOut ? user.clockOutDiff : user.minutesDiff;

            return (
              <List.Item style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Tooltip
                  title={
                    <div>
                      <div><strong>Name:</strong> {user.name}</div>
                      <div><strong>Email:</strong> {user.email}</div>
                      {user.roleName && <div><strong>Role:</strong> {user.roleName}</div>}
                      {user.clockInTime && <div><strong>Clock In:</strong> {user.clockInTime}</div>}
                      {user.clockOutTime && <div><strong>Clock Out:</strong> {user.clockOutTime}</div>}
                      {timeDiff !== undefined && (
                        <div>
                          <strong>Difference:</strong> {formatTimeDifference(timeDiff)}{' '}
                          {timeDiff < 0 ? 'early' : 'late'}
                        </div>
                      )}
                    </div>
                  }
                  placement="topLeft"
                >
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <UserOutlined style={{ fontSize: 12 }} />
                      <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: user.name }}>
                        {user.name}
                      </Text>
                    </Space>
                    {(type === 'early' || type === 'earlyOut') && timeDiff !== undefined && (
                      <Tag color="green" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                        {formatTimeDifference(timeDiff)} early
                      </Tag>
                    )}
                    {(type === 'late' || type === 'lateOut') && timeDiff !== undefined && (
                      <Tag color="red" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                        {formatTimeDifference(timeDiff)} late
                      </Tag>
                    )}
                  </Space>
                </Tooltip>
              </List.Item>
            );
          }}
        />
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = (icon: React.ReactNode, message: string, color: string = '#8c8c8c') => (
    <div style={{ textAlign: 'center', marginTop: 24, color }}>
      {icon}
      <div style={{ marginTop: 8 }}>{message}</div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <Card style={{ marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading attendance data...</Text>
          </div>
        </div>
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card style={{ marginBottom: 16 }}>
        <Empty description="No attendance data available" />
      </Card>
    );
  }

  const { summary, usersWithoutClockIn, usersWithoutClockOut, earlyClockIns, lateClockIns, usersWithAttendance: allUsers } = data;

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ClockCircleOutlined /> Attendance Overview
        </Title>
        <Space>
          <CalendarOutlined style={{ fontSize: 16 }} />
          <DatePicker
            value={dayjs(selectedDate)}
            onChange={handleDateChange}
            format="YYYY-MM-DD"
            allowClear={false}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
            style={{ width: 200 }}
          />
        </Space>
      </div>

      {/* Summary Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setShowTotalDetails(!showTotalDetails)}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderColor: showTotalDetails ? '#1890ff' : undefined
            }}
          >
            <Statistic
              title={<Text type="secondary">Total Employees</Text>}
              value={summary.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>Click to view details</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => setShowClockedInDetails(!showClockedInDetails)}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderColor: showClockedInDetails ? '#52c41a' : undefined
            }}
          >
            <Statistic
              title={<Text type="secondary">Clocked In</Text>}
              value={summary.usersWithClockIn}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
              suffix={<Text type="secondary" style={{ fontSize: 16 }}>/ {summary.totalUsers}</Text>}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>Click to view details</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={() => setShowClockedOutDetails(!showClockedOutDetails)}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderColor: showClockedOutDetails ? '#13c2c2' : undefined
            }}
          >
            <Statistic
              title={<Text type="secondary">Clocked Out</Text>}
              value={clockedOutUsers.length}
              prefix={<LogoutOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2', fontSize: 28 }}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>Click to view details</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => setShowPendingDetails(!showPendingDetails)}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderColor: showPendingDetails ? '#faad14' : undefined
            }}
          >
            <Statistic
              title={<Text type="secondary">Pending Clock-Out</Text>}
              value={summary.usersWithoutClockOut}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 28 }}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>Click to view details</Text>
          </Card>
        </Col>
      </Row>

      {/* Total Employees Details (Toggleable) */}
      {showTotalDetails && allUsers.length > 0 && (
        <Card 
          style={{ 
            marginBottom: 24, 
            borderLeft: '4px solid #1890ff',
            backgroundColor: '#f0f5ff',
            transition: 'all 0.3s ease'
          }}
        >
          <Title level={5}>
            <UserOutlined /> All Employees ({allUsers.length})
          </Title>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <List
              size="small"
              dataSource={allUsers}
              renderItem={(user: User) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <UserOutlined />
                      <Text strong>{user.name}</Text>
                      {!user.clockInTime && <Tag color="red">Not Clocked In</Tag>}
                      {user.clockInTime && !user.clockOutTime && <Tag color="orange">Pending</Tag>}
                      {user.clockInTime && user.clockOutTime && <Tag color="green">Complete</Tag>}
                    </Space>
                    <Space split={<Text type="secondary">|</Text>} size="small" style={{ fontSize: 12, flexWrap: 'wrap' }}>
                      <Text type="secondary">{user.email}</Text>
                      {user.roleName && <Text type="secondary">Role: {user.roleName}</Text>}
                      {user.clockInTime && <Text type="secondary">In: {user.clockInTime}</Text>}
                      {user.clockOutTime && <Text type="secondary">Out: {user.clockOutTime}</Text>}
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </Card>
      )}

      {/* Clocked In Details (Toggleable) */}
      {showClockedInDetails && clockedInUsers.length > 0 && (
        <Card 
          style={{ 
            marginBottom: 24, 
            borderLeft: '4px solid #52c41a',
            backgroundColor: '#f6ffed',
            transition: 'all 0.3s ease'
          }}
        >
          <Title level={5}>
            <CheckCircleOutlined /> Clocked In Employees ({clockedInUsers.length})
          </Title>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <List
              size="small"
              dataSource={clockedInUsers}
              renderItem={(user: User) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <UserOutlined />
                      <Text strong>{user.name}</Text>
                      {!user.clockOutTime && <Tag color="orange">Pending Clock-Out</Tag>}
                      {user.clockOutTime && <Tag color="green">Complete</Tag>}
                    </Space>
                    <Space split={<Text type="secondary">|</Text>} size="small" style={{ fontSize: 12, flexWrap: 'wrap' }}>
                      <Text type="secondary">{user.email}</Text>
                      {user.roleName && <Text type="secondary">Role: {user.roleName}</Text>}
                      <Text type="secondary">In: {user.clockInTime}</Text>
                      {user.clockOutTime && <Text type="secondary">Out: {user.clockOutTime}</Text>}
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </Card>
      )}

      {/* Clocked Out Details (Toggleable) */}
      {showClockedOutDetails && clockedOutUsers.length > 0 && (
        <Card 
          style={{ 
            marginBottom: 24, 
            borderLeft: '4px solid #13c2c2',
            backgroundColor: '#e6fffb',
            transition: 'all 0.3s ease'
          }}
        >
          <Title level={5}>
            <LogoutOutlined /> Clocked Out Employees ({clockedOutUsers.length})
          </Title>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <List
              size="small"
              dataSource={clockedOutUsers}
              renderItem={(user: User) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <UserOutlined />
                      <Text strong>{user.name}</Text>
                      <Tag color="green">Complete</Tag>
                    </Space>
                    <Space split={<Text type="secondary">|</Text>} size="small" style={{ fontSize: 12, flexWrap: 'wrap' }}>
                      <Text type="secondary">{user.email}</Text>
                      {user.roleName && <Text type="secondary">Role: {user.roleName}</Text>}
                      <Text type="secondary">In: {user.clockInTime}</Text>
                      <Text type="secondary">Out: {user.clockOutTime}</Text>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </Card>
      )}

      {/* Pending Clock-Out Details (Toggleable) */}
      {showPendingDetails && usersWithoutClockOut.length > 0 && (
        <Card 
          style={{ 
            marginBottom: 24, 
            borderLeft: '4px solid #faad14',
            backgroundColor: '#fffbf0',
            transition: 'all 0.3s ease'
          }}
        >
          <Title level={5}>
            <WarningOutlined /> Pending Clock-Out Details ({usersWithoutClockOut.length})
          </Title>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <List
              size="small"
              dataSource={usersWithoutClockOut}
              renderItem={(user: User) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <UserOutlined />
                      <Text strong>{user.name}</Text>
                    </Space>
                    <Space split={<Text type="secondary">|</Text>} size="small" style={{ fontSize: 12, flexWrap: 'wrap' }}>
                      <Text type="secondary">{user.email}</Text>
                      {user.roleName && <Text type="secondary">Role: {user.roleName}</Text>}
                      <Text type="secondary">Clock In: {user.clockInTime}</Text>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </Card>
      )}

      {/* Detailed Cards Row - All 5 in same row */}
      <Row gutter={[16, 16]}>
        {/* Not Clocked In Card */}
        <Col xs={24} sm={12} md={12} lg={8} xl={{ flex: '1 1 20%' }}>
          <Card
            style={{
              borderLeft: '4px solid #ff4d4f',
              minHeight: '280px',
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Badge
                count={summary.usersWithoutClockIn}
                style={{ backgroundColor: '#ff4d4f' }}
                overflowCount={999}
              />
              <Title level={5} style={{ margin: '0 0 0 12px', fontSize: 14 }}>
                Not Clocked In
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Haven't clocked in
            </Text>
            {usersWithoutClockIn.length > 0 ? (
              renderScrollableList(usersWithoutClockIn, 'notClocked')
            ) : (
              renderEmptyState(
                <CheckCircleOutlined style={{ fontSize: 24 }} />,
                'All clocked in!',
                '#52c41a'
              )
            )}
          </Card>
        </Col>

        {/* Early Clock-In Card */}
        <Col xs={24} sm={12} md={12} lg={8} xl={{ flex: '1 1 20%' }}>
          <Card
            style={{
              borderLeft: '4px solid #52c41a',
              minHeight: '280px',
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Badge
                count={summary.earlyClockIns}
                style={{ backgroundColor: '#52c41a' }}
                overflowCount={999}
              />
              <Title level={5} style={{ margin: '0 0 0 12px', fontSize: 14 }}>
                <ThunderboltOutlined /> Early In
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {THRESHOLD_MINUTES}+ min early
            </Text>
            {earlyClockIns.length > 0 ? (
              renderScrollableList(earlyClockIns, 'early')
            ) : (
              renderEmptyState(
                <ClockCircleOutlined style={{ fontSize: 24 }} />,
                'No early clock-ins',
                '#8c8c8c'
              )
            )}
          </Card>
        </Col>

        {/* Late Clock-In Card */}
        <Col xs={24} sm={12} md={12} lg={8} xl={{ flex: '1 1 20%' }}>
          <Card
            style={{
              borderLeft: '4px solid #ff7a45',
              minHeight: '280px',
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Badge
                count={summary.lateClockIns}
                style={{ backgroundColor: '#ff7a45' }}
                overflowCount={999}
              />
              <Title level={5} style={{ margin: '0 0 0 12px', fontSize: 14 }}>
                <WarningOutlined /> Late In
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {THRESHOLD_MINUTES}+ min late
            </Text>
            {lateClockIns.length > 0 ? (
              renderScrollableList(lateClockIns, 'late')
            ) : (
              renderEmptyState(
                <CheckCircleOutlined style={{ fontSize: 24 }} />,
                'No late clock-ins!',
                '#52c41a'
              )
            )}
          </Card>
        </Col>

        {/* Early Clock-Out Card */}
        <Col xs={24} sm={12} md={12} lg={8} xl={{ flex: '1 1 20%' }}>
          <Card
            style={{
              borderLeft: '4px solid #722ed1',
              minHeight: '280px',
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Badge
                count={earlyClockOuts.length}
                style={{ backgroundColor: '#722ed1' }}
                overflowCount={999}
              />
              <Title level={5} style={{ margin: '0 0 0 12px', fontSize: 14 }}>
                <LogoutOutlined /> Early Out
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {THRESHOLD_MINUTES}+ min early
            </Text>
            {earlyClockOuts.length > 0 ? (
              renderScrollableList(earlyClockOuts, 'earlyOut')
            ) : (
              renderEmptyState(
                <ClockCircleOutlined style={{ fontSize: 24 }} />,
                'No early clock-outs',
                '#8c8c8c'
              )
            )}
          </Card>
        </Col>

        {/* Late Clock-Out Card */}
        <Col xs={24} sm={12} md={12} lg={8} xl={{ flex: '1 1 20%' }}>
          <Card
            style={{
              borderLeft: '4px solid #eb2f96',
              minHeight: '280px',
            }}
            hoverable
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Badge
                count={lateClockOuts.length}
                style={{ backgroundColor: '#eb2f96' }}
                overflowCount={999}
              />
              <Title level={5} style={{ margin: '0 0 0 12px', fontSize: 14 }}>
                <ClockCircleOutlined /> Late Out
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Overtime {THRESHOLD_MINUTES}+ min
            </Text>
            {lateClockOuts.length > 0 ? (
              renderScrollableList(lateClockOuts, 'lateOut')
            ) : (
              renderEmptyState(
                <CheckCircleOutlined style={{ fontSize: 24 }} />,
                'No overtime!',
                '#52c41a'
              )
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AttendanceDashboard;