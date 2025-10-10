import React, { useEffect } from "react";
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
import dayjs from 'dayjs';
import { useUpdateLeave } from "../../hooks/leave/useLeave";
import { useActiveLeaveTypes } from "../../hooks/useLeaveTypes";
import { LeaveType } from "../../types/leave";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface EditLeaveModalProps {
  open: boolean;
  leave: LeaveType | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

const EditLeaveModal: React.FC<EditLeaveModalProps> = ({
  open,
  leave,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const updateLeaveMutation = useUpdateLeave();
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes, error: leaveTypesError } = useActiveLeaveTypes();

  // Ensure leaveTypes is always an array
  const validLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : [];

  // Populate form when leave data changes
  useEffect(() => {
    if (leave && open) {
      form.setFieldsValue({
        type: leave.leaveType?.name || leave.type,
        dateRange: leave.startDate && leave.endDate ? [
          dayjs(leave.startDate),
          dayjs(leave.endDate)
        ] : undefined,
        reason: leave.reason || "",
      });
    }
  }, [leave, open, form]);

  const handleSubmit = async (values: any) => {
    if (!leave) return;

    try {
      const [startDate, endDate] = values.dateRange || [];
      
      if (!startDate || !endDate) {
        message.error("Please select both start and end dates");
        return;
      }

      const payload = {
        type: values.type,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        reason: values.reason || "",
      };

      await updateLeaveMutation.mutateAsync({
        id: leave.id,
        payload
      });
      
      message.success("Leave request updated successfully");
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update leave request";
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
          <span>Edit Leave Request</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="edit-leave-modal"
      maskClosable={false}
      destroyOnClose={true}
    >
      <Alert
        message="Important"
        description="You can only edit leave requests that are pending or approved by manager but not yet fully approved by admin."
        type="info"
        showIcon
        className="mb-4"
      />

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
            disabledDate={(current) => {
              // Disable past dates
              return current && current.isBefore(new Date(), 'day');
            }}
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
          <Button onClick={handleCancel} size="large" disabled={updateLeaveMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateLeaveMutation.isPending}
            size="large"
            icon={<CalendarOutlined />}
            disabled={isLoadingLeaveTypes || validLeaveTypes.length === 0}
          >
            {updateLeaveMutation.isPending ? "Updating..." : "Update Request"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditLeaveModal;
