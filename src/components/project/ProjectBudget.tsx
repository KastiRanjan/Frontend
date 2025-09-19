import { WorklogType } from '@/types/worklog';
import { TaskType } from '@/types/task';
import { UserType } from '@/types/user';
import { Card, Table, Statistic, Row, Col, Button, Tooltip, Modal, Space, Typography, Progress, Empty, Spin, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import { DollarOutlined, FieldTimeOutlined, InfoCircleOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const backendURI = import.meta.env.VITE_BACKEND_URI;

interface ProjectBudgetProps {
  project: any;
  loading?: boolean;
}

// Helper functions for calculations
const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  return durationMs / (1000 * 60 * 60); // Convert to hours
};

const sumBudgetedHours = (tasks: TaskType[]): number => {
  return tasks
    .filter(task => task.taskType === 'story') // Only consider main tasks, not subtasks
    .reduce((sum, task) => sum + (task.budgetedHours || 0), 0);
};

const sumActualHours = (worklogs: WorklogType[]): number => {
  return worklogs.reduce((sum, worklog) => {
    return sum + calculateDuration(worklog.startTime, worklog.endTime);
  }, 0);
};

// Format currency in NPR
const formatNPR = (amount: number): string => {
  return new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Calculate per-user contributions
const calculateUserContributions = (worklogs: WorklogType[]): { user: UserType, hours: number }[] => {
  const userContributions = new Map<string, { user: UserType, hours: number }>();
  
  worklogs.forEach(worklog => {
    if (!worklog.user) return;
    
    const userId = worklog.user.id?.toString() || '';
    if (!userId) return;
    
    const hours = calculateDuration(worklog.startTime, worklog.endTime);
    
    if (userContributions.has(userId)) {
      const current = userContributions.get(userId)!;
      userContributions.set(userId, {
        ...current,
        hours: current.hours + hours
      });
    } else {
      userContributions.set(userId, {
        user: worklog.user,
        hours
      });
    }
  });
  
  return Array.from(userContributions.values())
    .sort((a, b) => b.hours - a.hours); // Sort by hours in descending order
};

  // Calculate per-task contributions with user breakdown
  const calculateTaskContributions = (worklogs: WorklogType[]): { task: TaskType, hours: number, userBreakdown: { user: UserType, hours: number }[] }[] => {
    const taskContributions = new Map<string, { task: TaskType, hours: number, userBreakdown: { user: UserType, hours: number }[] }>();

    worklogs.forEach(worklog => {
      if (!worklog.task || !worklog.user) return;

      const taskId = worklog.task.id?.toString() || '';
      if (!taskId) return;

      const hours = calculateDuration(worklog.startTime, worklog.endTime);
      const userId = worklog.user.id?.toString() || '';

      if (taskContributions.has(taskId)) {
        const current = taskContributions.get(taskId)!;
        current.hours += hours;
        // Update user breakdown
        const userEntry = current.userBreakdown.find(u => u.user.id === worklog.user.id);
        if (userEntry) {
          userEntry.hours += hours;
        } else {
          current.userBreakdown.push({ user: worklog.user, hours });
        }
      } else {
        taskContributions.set(taskId, {
          task: worklog.task,
          hours,
          userBreakdown: [{ user: worklog.user, hours }]
        });
      }
    });

    return Array.from(taskContributions.values())
      .sort((a, b) => b.hours - a.hours); // Sort by hours in descending order
  };

const ProjectBudget: React.FC<ProjectBudgetProps> = ({ project }) => {
  const [worklogs, setWorklogs] = useState<WorklogType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [detailsModalType, setDetailsModalType] = useState<'user' | 'task'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [projectUsers, setProjectUsers] = useState<UserType[]>([]);
  const [userRates, setUserRates] = useState<{[userId: string]: number}>({});
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  
  // Extract budget-related information
  useEffect(() => {
    if (project) {
      // Get all tasks from project
      setTasks(project.tasks || []);
      
      // Set project users
      setProjectUsers(project.users || []);
      
      // Initialize user rates
      const initialRates: {[userId: string]: number} = {};
      if (project.users && project.users.length > 0) {
        project.users.forEach((user: UserType) => {
          if (user.id) {
            initialRates[user.id] = user.hourlyRate || 500; // Default to 500 NPR if not set
          }
        });
      }
      setUserRates(initialRates);
      
      // Fetch worklogs for all tasks in the project
      const fetchWorklogs = async () => {
        setIsLoading(true);
        try {
          // Collect worklogs from all tasks
          const allWorklogs: WorklogType[] = [];
          
          if (project.tasks && project.tasks.length > 0) {
            const taskIds = project.tasks.map((task: TaskType) => task.id);
            
            // Fetch worklogs for each task
            for (const taskId of taskIds) {
              try {
                const response = await axios.get(`${backendURI}/worklogs/task/${taskId}`);
                if (response.data && Array.isArray(response.data)) {
                  allWorklogs.push(...response.data);
                }
              } catch (error) {
                console.error(`Error fetching worklogs for task ${taskId}:`, error);
              }
            }
          }
          
          setWorklogs(allWorklogs);
        } catch (error) {
          console.error('Error fetching worklogs:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchWorklogs();
    }
  }, [project]);
  
  // Calculate budget metrics
  const budgetedHours = sumBudgetedHours(tasks);
  const actualHours = sumActualHours(worklogs);
  const hourProgress = budgetedHours > 0 ? (actualHours / budgetedHours) * 100 : 0;
  
  // Calculate user contributions
  const userContributions = calculateUserContributions(worklogs);
  
  // Calculate task contributions
  const taskContributions = calculateTaskContributions(worklogs);
  
  // Calculate costs using user-specific rates
  const calculateUserCost = (userId: string | number | undefined, hours: number): number => {
    if (!userId) return 0;
    const rate = userRates[userId.toString()] || 500; // Default rate if not found
    return hours * rate;
  };
  
  const calculateTotalEstimatedCost = (): number => {
    let totalCost = 0;
    
    // If no tasks with budgeted hours or no users, return 0
    if (!tasks || tasks.length === 0 || !projectUsers || projectUsers.length === 0) {
      return 0;
    }
    
    // For estimated cost, we'll distribute budgeted hours evenly among project users
    const userCount = projectUsers.length;
    if (userCount === 0) return 0;
    
    const hoursPerUser = budgetedHours / userCount;
    
    // Calculate cost based on each user's rate
    projectUsers.forEach(user => {
      if (user.id) {
        const rate = userRates[user.id.toString()] || 500;
        totalCost += hoursPerUser * rate;
      }
    });
    
    return totalCost;
  };
  
  const calculateTotalActualCost = (): number => {
    return userContributions.reduce((sum, { user, hours }) => {
      return sum + calculateUserCost(user.id, hours);
    }, 0);
  };
  
  const estimatedCost = calculateTotalEstimatedCost();
  const actualCost = calculateTotalActualCost();
  
  // Show details modal
  const showDetailsModal = (type: 'user' | 'task') => {
    setDetailsModalType(type);
    setIsDetailsModalVisible(true);
  };
  
  // Handle temporary rate changes
  const handleRateChange = (userId: string, rate: number) => {
    setUserRates(prev => ({
      ...prev,
      [userId]: rate
    }));
  };
  
  // Show rate adjustment modal
  const showRateModal = () => {
    setIsRateModalVisible(true);
  };
  
  // Reset temporary rates
  const resetRates = () => {
    const initialRates: {[userId: string]: number} = {};
    if (projectUsers && projectUsers.length > 0) {
      projectUsers.forEach(user => {
        if (user.id) {
          initialRates[user.id.toString()] = user.hourlyRate || 500;
        }
      });
    }
    setUserRates(initialRates);
  };
  
  // Generate user contribution columns for table
  const userColumns = [
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'userName',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => hours.toFixed(2),
      sorter: (a: { hours: number }, b: { hours: number }) => a.hours - b.hours,
      defaultSortOrder: 'descend' as 'descend',
    },
    {
      title: 'Rate',
      key: 'rate',
      render: (_: any, record: { user: UserType }) => {
        const userId = record.user.id?.toString() || '';
        const rate = userRates[userId] || 500;
        return formatNPR(rate);
      },
    },
    {
      title: 'Cost',
      key: 'cost',
      render: (_: any, record: { user: UserType, hours: number }) => {
        const cost = calculateUserCost(record.user.id, record.hours);
        return formatNPR(cost);
      },
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_: any, record: { hours: number }) => {
        const percentage = actualHours > 0 ? (record.hours / actualHours) * 100 : 0;
        return (
          <div>
            <Progress percent={parseFloat(percentage.toFixed(1))} size="small" />
          </div>
        );
      },
    },
  ];
  
  // Generate task contribution columns for table
  const taskColumns = [
    {
      title: 'Task',
      dataIndex: ['task', 'name'],
      key: 'taskName',
      render: (text: string, record: { task: TaskType, hours: number }) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.task.tcode}</div>
        </div>
      ),
    },
    {
      title: 'Budgeted',
      key: 'budgeted',
      render: (_: any, record: { task: TaskType }) => {
        return record.task.budgetedHours ? record.task.budgetedHours.toFixed(2) : '0.00';
      },
    },
    {
      title: 'Actual',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => hours.toFixed(2),
      sorter: (a: { hours: number }, b: { hours: number }) => a.hours - b.hours,
      defaultSortOrder: 'descend' as 'descend',
    },
    {
      title: 'Variance',
      key: 'variance',
      render: (_: any, record: { task: TaskType, hours: number }) => {
        const budgeted = record.task.budgetedHours || 0;
        const variance = budgeted - record.hours;
        const color = variance >= 0 ? 'green' : 'red';
        return <span style={{ color }}>{variance.toFixed(2)}</span>;
      },
    },
    {
      title: 'Completion',
      key: 'completion',
      render: (_: any, record: { task: TaskType, hours: number }) => {
        const budgeted = record.task.budgetedHours || 0;
        if (budgeted === 0) return <Progress percent={0} size="small" />;
        
        const percentage = Math.min(100, (record.hours / budgeted) * 100);
        const status = percentage > 100 ? 'exception' : 'normal';
        
        return (
          <Progress 
            percent={parseFloat(percentage.toFixed(1))} 
            size="small" 
            status={status as any}
          />
        );
      },
    },
  ];
  
  return (
    <div>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px' }}>Loading budget data...</div>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Budgeted Hours" 
                  value={budgetedHours} 
                  precision={2}
                  suffix="hours"
                  prefix={<FieldTimeOutlined />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Actual Hours" 
                  value={actualHours} 
                  precision={2}
                  suffix="hours"
                  prefix={<FieldTimeOutlined />} 
                  valueStyle={{ color: actualHours > budgetedHours ? '#cf1322' : '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Estimated Cost" 
                  value={estimatedCost} 
                  formatter={(value) => formatNPR(value as number)}
                  prefix={<DollarOutlined />} 
                />
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={showRateModal}
                  style={{ padding: 0, marginTop: 8 }}
                >
                  Adjust Rates
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Actual Cost" 
                  value={actualCost} 
                  formatter={(value) => formatNPR(value as number)}
                  prefix={<DollarOutlined />} 
                  valueStyle={{ color: actualCost > estimatedCost ? '#cf1322' : '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="Budget Progress">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Progress 
                      percent={parseFloat(hourProgress.toFixed(1))}
                      status={hourProgress > 100 ? 'exception' : 'normal'}
                      strokeWidth={20}
                    />
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                      {actualHours.toFixed(2)} of {budgetedHours.toFixed(2)} hours used 
                      ({hourProgress.toFixed(1)}%)
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card title="User Contributions">
                <Table 
                  dataSource={userContributions as any[]}
                  columns={userColumns}
                  rowKey={(_) => `user-${Math.random()}`}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Task Details">
                <Table 
                  dataSource={taskContributions as any[]}
                  columns={[
                    {
                      title: 'Task',
                      dataIndex: ['task', 'name'],
                      key: 'taskName',
                      render: (text: string, record: { task: TaskType, hours: number }) => (
                        <div>
                          <div>{text}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{record.task.tcode}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Budgeted',
                      key: 'budgeted',
                      render: (_: any, record: { task: TaskType }) => {
                        return record.task.budgetedHours ? record.task.budgetedHours.toFixed(2) : '0.00';
                      },
                    },
                    {
                      title: 'Actual',
                      dataIndex: 'hours',
                      key: 'hours',
                      render: (hours: number) => hours.toFixed(2),
                      sorter: (a: { hours: number }, b: { hours: number }) => a.hours - b.hours,
                      defaultSortOrder: 'descend' as 'descend',
                    },
                    {
                      title: 'Variance',
                      key: 'variance',
                      render: (_: any, record: { task: TaskType, hours: number }) => {
                        const budgeted = record.task.budgetedHours || 0;
                        const variance = budgeted - record.hours;
                        const color = variance >= 0 ? 'green' : 'red';
                        return <span style={{ color }}>{variance.toFixed(2)}</span>;
                      },
                    },
                    {
                      title: 'Completion',
                      key: 'completion',
                      render: (_: any, record: { task: TaskType, hours: number }) => {
                        const budgeted = record.task.budgetedHours || 0;
                        if (budgeted === 0) return <Progress percent={0} size="small" />;
                        const percentage = Math.min(100, (record.hours / budgeted) * 100);
                        const status = percentage > 100 ? 'exception' : 'normal';
                        return (
                          <Progress 
                            percent={parseFloat(percentage.toFixed(1))} 
                            size="small" 
                            status={status as any}
                          />
                        );
                      },
                    },
                    {
                      title: 'User Breakdown',
                      key: 'userBreakdown',
                      render: (_: any, record: { userBreakdown: { user: UserType, hours: number }[] }) => (
                        <div>
                          {record.userBreakdown.map((u, idx) => (
                            <div key={u.user.id || idx}>
                              <UserOutlined /> {u.user.name}: {u.hours.toFixed(2)} hrs
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                  rowKey={(_) => `task-${Math.random()}`}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Modal for rate adjustment */}
          <Modal
            title="Adjust Hourly Rates"
            open={isRateModalVisible}
            onCancel={() => setIsRateModalVisible(false)}
            footer={[
              <Button key="reset" onClick={resetRates}>
                Reset to Default
              </Button>,
              <Button key="cancel" onClick={() => setIsRateModalVisible(false)}>
                Close
              </Button>
            ]}
          >
            <p>Adjust hourly rates to see how they affect the project budget. These changes are temporary and will not be saved.</p>
            <Table
              dataSource={projectUsers.map(user => ({
                ...user,
                key: user.id
              }))}
              pagination={false}
              columns={[
                {
                  title: 'User',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Role',
                  dataIndex: ['role', 'name'],
                  key: 'role',
                },
                {
                  title: 'Hourly Rate (NPR)',
                  key: 'rate',
                  render: (_, record) => {
                    const userId = record.id?.toString() || '';
                    return (
                      <InputNumber
                        min={0}
                        defaultValue={userRates[userId] || 500}
                        onChange={(value) => handleRateChange(userId, value || 0)}
                        addonAfter="NPR/hr"
                        style={{ width: '100%' }}
                      />
                    );
                  },
                },
              ]}
            />
          </Modal>
        </>
      )}
    </div>
  );
};

export default ProjectBudget;