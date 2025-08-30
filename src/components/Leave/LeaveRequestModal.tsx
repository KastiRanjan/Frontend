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
} from "antd";
import {
  CalendarOutlined,
} from "@ant-design/icons";
import { useCreateLeave } from "../../hooks/leave/useLeave";
import { useLeaveTypes } from "../../hooks/leaveType/useLeaveType";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface LeaveRequestModalProps {
  open: boolean;
  onCancel: () => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  open,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const createLeaveMutation = useCreateLeave();
  const { data: leaveTypes } = useLeaveTypes();

  const handleSubmit = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const payload = {
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        type: values.type,
        reason: values.reason,
      };

      await createLeaveMutation.mutateAsync(payload);
      message.success("Leave request submitted successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error("Failed to submit leave request");
    }
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
      onCancel={onCancel}
      footer={null}
      width={600}
      className="leave-request-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="type"
          label="Leave Type"
          rules={[{ required: true, message: "Please select leave type" }]}
        >
          <Select
            placeholder="Select leave type"
            size="large"
            className="w-full"
          >
            {leaveTypes?.map((type: any) => (
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
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Date Range"
          rules={[{ required: true, message: "Please select date range" }]}
        >
          <RangePicker
            size="large"
            className="w-full"
            format="YYYY-MM-DD"
            placeholder={["Start Date", "End Date"]}
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
          <Button onClick={onCancel} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLeaveMutation.isPending}
            size="large"
            icon={<CalendarOutlined />}
          >
            Submit Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default LeaveRequestModal;
