import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  TimePicker,
  Button,
  Select,
  message,
  Alert,
  Card,
  Descriptions,
  Tag,
  Divider,
} from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { useCreateWorklog } from "../../hooks/worklog/useCreateWorklog";
import { useWorkhourByUser } from "../../hooks/workhour/useWorkhourByUser";
import { useHolidays } from "../../hooks/holiday/useHoliday";
import { useLeaveCalendarViewByRange } from "../../hooks/leave/useLeave";

dayjs.extend(isBetween);

const { TextArea } = Input;

interface WorklogCreateModalProps {
  open: boolean;
  onCancel: () => void;
  selectedDate: string;
  projectId?: string;
  taskId?: string;
  userId: string;
}

interface ValidationResult {
  isValid: boolean;
  needsVerification: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

const WorklogCreateModal: React.FC<WorklogCreateModalProps> = ({
  open,
  onCancel,
  selectedDate,
  projectId,
  taskId,
  userId,
}) => {
  const [form] = Form.useForm();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  
  const createWorklogMutation = useCreateWorklog();
  const { data: workhour } = useWorkhourByUser(userId);
  const { data: holidays } = useHolidays();
  const { data: leaveData } = useLeaveCalendarViewByRange(
    selectedDate, 
    selectedDate,
    projectId
  );

  const validateWorklogTime = (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs): ValidationResult => {
    const selectedDateObj = dayjs(selectedDate);
    
    // Check if it's a holiday
    const isHoliday = holidays?.some((holiday: any) => 
      dayjs(holiday.date).isSame(selectedDateObj, 'day')
    );
    
    if (isHoliday) {
      return {
        isValid: false,
        needsVerification: false,
        message: "Cannot create worklog on holidays",
        type: 'error'
      };
    }

    // Check if user is on leave
    const isOnLeave = leaveData?.some((leave: any) => 
      selectedDateObj.isBetween(dayjs(leave.startDate), dayjs(leave.endDate), 'day', '[]')
    );
    
    if (isOnLeave) {
      return {
        isValid: false,
        needsVerification: false,
        message: "Cannot create worklog on leave days",
        type: 'error'
      };
    }

    // Check work hours
    if (workhour) {
      const workStartTime = dayjs(`${selectedDate} ${workhour.startTime}`);
      const workEndTime = dayjs(`${selectedDate} ${workhour.endTime}`);
      
      const logStartTime = dayjs(`${selectedDate} ${startTime.format('HH:mm')}`);
      const logEndTime = dayjs(`${selectedDate} ${endTime.format('HH:mm')}`);
      
      const isOutsideWorkHours = 
        logStartTime.isBefore(workStartTime) || 
        logEndTime.isAfter(workEndTime);
      
      if (isOutsideWorkHours) {
        return {
          isValid: true,
          needsVerification: true,
          message: `Work time (${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}) is outside defined work hours (${workhour.startTime} - ${workhour.endTime}). This will require verification.`,
          type: 'warning'
        };
      }
    }

    return {
      isValid: true,
      needsVerification: false,
      message: "Work time is within defined hours",
      type: 'info'
    };
  };

  const handleTimeChange = () => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    
    if (startTime && endTime) {
      const validation = validateWorklogTime(startTime, endTime);
      setValidationResult(validation);
      setRequiresVerification(validation.needsVerification);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        projectId: projectId || values.projectId,
        taskId: taskId || values.taskId,
        date: selectedDate,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        description: values.description,
        status: requiresVerification ? 'pending' : 'approved',
      };

      await createWorklogMutation.mutateAsync(payload);
      
      if (requiresVerification) {
        message.info("Worklog submitted and is pending verification");
      } else {
        message.success("Worklog created successfully");
      }
      
      form.resetFields();
      setValidationResult(null);
      setRequiresVerification(false);
      onCancel();
    } catch (error) {
      message.error("Failed to create worklog");
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <StopOutlined />;
      case 'warning': return <ExclamationCircleOutlined />;
      default: return <CheckCircleOutlined />;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-blue-500" />
          <span>Create Worklog - {dayjs(selectedDate).format('MMM DD, YYYY')}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <div className="space-y-4">
        {/* Work Hour Information */}
        {workhour && (
          <Card size="small" className="bg-blue-50">
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="Work Hours">
                <Tag color="blue">
                  {workhour.startTime} - {workhour.endTime}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Hours">
                <Tag color="green">{workhour.workHours}h</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Validation Alert */}
        {validationResult && (
          <Alert
            message={validationResult.message}
            type={validationResult.type}
            icon={getAlertIcon(validationResult.type)}
            showIcon
            className="mb-4"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker
                size="large"
                format="HH:mm"
                className="w-full"
                onChange={handleTimeChange}
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="End Time"
              rules={[
                { required: true, message: "Please select end time" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('startTime');
                    if (!value || !startTime) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(startTime)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('End time must be after start time'));
                  },
                }),
              ]}
            >
              <TimePicker
                size="large"
                format="HH:mm"
                className="w-full"
                onChange={handleTimeChange}
              />
            </Form.Item>
          </div>

          {!projectId && (
            <Form.Item
              name="projectId"
              label="Project"
              rules={[{ required: true, message: "Please select project" }]}
            >
              <Select size="large" placeholder="Select project">
                {/* Projects will be loaded dynamically */}
              </Select>
            </Form.Item>
          )}

          {!taskId && (
            <Form.Item
              name="taskId"
              label="Task"
              rules={[{ required: true, message: "Please select task" }]}
            >
              <Select size="large" placeholder="Select task">
                {/* Tasks will be loaded dynamically */}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label="Work Description"
            rules={[
              { required: true, message: "Please enter work description" },
              { min: 10, message: "Description must be at least 10 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the work done during this time..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          {requiresVerification && (
            <Alert
              message="Verification Required"
              description="This worklog will be submitted with 'pending' status and requires admin verification due to work hours outside the defined schedule."
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          <Divider />

          <div className="flex justify-end gap-2">
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createWorklogMutation.isPending}
              size="large"
              disabled={validationResult?.isValid === false}
              icon={<ClockCircleOutlined />}
            >
              {requiresVerification ? 'Submit for Verification' : 'Create Worklog'}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default WorklogCreateModal;
