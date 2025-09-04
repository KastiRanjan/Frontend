import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Tag,
  Divider,
  Alert,
} from "antd";
import {
  CalendarOutlined,
} from "@ant-design/icons";
import moment from 'moment';
import { useCreateLeave } from "../../hooks/leave/useLeave";
import { useActiveLeaveTypes } from "../../hooks/useLeaveTypes";
import { useHolidays } from '../../hooks/holiday/useHoliday';
import { getLeaveCalendarView } from '../../service/leave.service';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface LeaveRequestModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const createLeaveMutation = useCreateLeave();
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes, error: leaveTypesError } = useActiveLeaveTypes();
  const { data: holidays = [] } = useHolidays();

  // Ensure leaveTypes is always an array
  const validLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : [];

  const handleSubmit = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange;
      
      if (!startDate || !endDate) {
        message.error("Please select both start and end dates");
        return;
      }

      const payload = {
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        type: values.type,
        reason: values.reason || "",
      };

      // Client-side: check for holiday overlap
      const selectedDays: string[] = [];
      
      // Ensure we have proper moment objects
      let start, end;
      try {
        start = moment(startDate);
        end = moment(endDate);
      } catch (error) {
        console.error('Error creating moment objects:', error);
        message.error("Invalid date selection");
        return;
      }
      
      if (!start.isValid() || !end.isValid()) {
        console.error('Invalid dates:', { startDate, endDate, start: start.isValid(), end: end.isValid() });
        message.error("Invalid date selection");
        return;
      }
      
      // Generate date range safely
      const current = start.clone();
      while (current.isSameOrBefore(end)) {
        selectedDays.push(current.format('YYYY-MM-DD'));
        current.add(1, 'day');
      }

      const holidayDates = (holidays || []).map((h: any) => h.date);
      const conflictHoliday = selectedDays.find(d => holidayDates.includes(d));
      if (conflictHoliday) {
        message.error(`Cannot request leave on holiday: ${conflictHoliday}`);
        return;
      }

      // Client-side: check for already approved leaves overlapping via calendar endpoint (approved leaves only)
      const calendarLeaves = await getLeaveCalendarView(payload.startDate, payload.endDate);
      if (Array.isArray(calendarLeaves) && calendarLeaves.length > 0) {
        message.error('Selected dates overlap with an already approved leave');
        return;
      }

      await createLeaveMutation.mutateAsync(payload);
      message.success("Leave request submitted successfully");
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit leave request";
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          <span>Request Leave</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="leave-request-modal"
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {leaveTypesError && (
          <Alert
            message="Error loading leave types"
            description="Please refresh the page or contact support if the issue persists."
            type="error"
            className="mb-4"
            showIcon
          />
        )}

        {!isLoadingLeaveTypes && validLeaveTypes.length === 0 && !leaveTypesError && (
          <Alert
            message="No leave types available"
            description="Please contact your administrator to set up leave types."
            type="warning"
            className="mb-4"
            showIcon
          />
        )}

        <Form.Item
          name="type"
          label="Leave Type"
          rules={[{ required: true, message: "Please select leave type" }]}
        >
          <Select
            placeholder="Select leave type"
            size="large"
            className="w-full"
            loading={isLoadingLeaveTypes}
            notFoundContent={leaveTypesError ? "Error loading leave types" : "No leave types available"}
          >
            {validLeaveTypes.map((type: any) => (
              <Select.Option
                key={type.id}
                value={type.name}
                disabled={!type.isActive}
              >
                <div className="flex justify-between items-center">
                  <span>{type.name}</span>
                  {type.maxDaysPerYear && (
                    <Tag color="blue" className="ml-2">
                      Max: {type.maxDaysPerYear} days/year
                    </Tag>
                  )}
                  {!type.isActive && (
                    <Tag color="red" className="ml-2">
                      Inactive
                    </Tag>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Date Range"
          rules={[
            { required: true, message: "Please select date range" },
            {
              validator: (_, value) => {
                if (!value || !value[0] || !value[1]) {
                  return Promise.reject(new Error("Please select both start and end dates"));
                }
                if (value[0].isBefore(new Date(), 'day')) {
                  return Promise.reject(new Error("Start date cannot be in the past"));
                }
                if (value[1].isBefore(value[0])) {
                  return Promise.reject(new Error("End date must be after start date"));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <RangePicker
            size="large"
            className="w-full"
            format="YYYY-MM-DD"
            placeholder={["Start Date", "End Date"]}
            disabledDate={(current) => current && current.isBefore(new Date(), 'day')}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason (Optional)"
        >
          <TextArea
            rows={4}
            placeholder="Please provide reason for leave request..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Divider />

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel} size="large" disabled={createLeaveMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLeaveMutation.isPending}
            size="large"
            icon={<CalendarOutlined />}
            disabled={isLoadingLeaveTypes || validLeaveTypes.length === 0}
          >
            {createLeaveMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default LeaveRequestModal;
