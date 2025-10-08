import React, { useMemo, useState } from "react";
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
  Radio,
} from "antd";
import {
  CalendarOutlined,
} from "@ant-design/icons";
import moment from 'moment';
import dayjs from 'dayjs';
import { useCreateLeave } from "../../hooks/leave/useLeave";
import { useActiveLeaveTypes } from "../../hooks/useLeaveTypes";
import { useHolidays } from '../../hooks/holiday/useHoliday';
import { useApprovers } from "../../hooks/leave/useApprovers";
import { getLeaveCalendarView, fetchUserLeaves } from '../../service/leave.service';
import { useQuery } from '@tanstack/react-query';

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
  const [dateSelectionType, setDateSelectionType] = useState<'range' | 'custom'>('range');
  const createLeaveMutation = useCreateLeave();
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes, error: leaveTypesError } = useActiveLeaveTypes();
  const { data: holidays = [] } = useHolidays();
  const { data: approvers = [], isLoading: isLoadingApprovers, error: approversError } = useApprovers();
  
  // Fetch user's existing leaves to check for conflicts
  const { data: existingLeaves = [] } = useQuery({
    queryKey: ['user-leaves', 'approved'],
    queryFn: () => fetchUserLeaves('approved'),
    enabled: open, // Only fetch when modal is open
  });

  // Ensure leaveTypes is always an array
  const validLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : [];

  // Memoize disabled dates for better performance
  const disabledDates = useMemo(() => {
    const disabledDateStrings = new Set<string>();
    
    // Add holidays to disabled dates
    if (Array.isArray(holidays)) {
      holidays.forEach((holiday: any) => {
        if (holiday.date) {
          disabledDateStrings.add(holiday.date);
        }
      });
    }
    
    // Add existing approved leave dates to disabled dates
    if (Array.isArray(existingLeaves)) {
      existingLeaves.forEach((leave: any) => {
        if (leave.status === 'approved') {
          // Handle both custom dates and date ranges for existing leaves
          if (leave.isCustomDates && Array.isArray(leave.customDates)) {
            // For existing leaves with custom dates
            leave.customDates.forEach((dateStr: string) => {
              disabledDateStrings.add(dateStr);
            });
          } else if (leave.startDate && leave.endDate) {
            // For existing leaves with date ranges
            const start = moment(leave.startDate);
            const end = moment(leave.endDate);
            const current = start.clone();
            
            while (current.isSameOrBefore(end)) {
              disabledDateStrings.add(current.format('YYYY-MM-DD'));
              current.add(1, 'day');
            }
          }
        }
      });
    }
    
    return disabledDateStrings;
  }, [holidays, existingLeaves]);

  const handleSubmit = async (values: any) => {
    try {
      let payload: any = {
        type: values.type,
        reason: values.reason || "",
        requestedManagerId: values.requestedManagerId,
      };

      // Use the state variable instead of form values for date selection type
      if (dateSelectionType === 'custom' && values.customDates) {
        // Handle custom dates
        if (!values.customDates || values.customDates.length === 0) {
          message.error("Please select at least one date");
          return;
        }

        console.log('Original form values.customDates:', values.customDates);
        
        // Debug each date object
        values.customDates.forEach((date: any, index: number) => {
          console.log(`Date ${index}:`, date);
          console.log(`Date ${index} isDayjs:`, date && date.$isDayjsObject);
          console.log(`Date ${index} isValid:`, date && date.isValid && date.isValid());
          console.log(`Date ${index} formatted:`, date && date.format ? date.format("YYYY-MM-DD") : 'No format method');
        });

        const customDates = values.customDates
          .map((date: any) => {
            // Handle Day.js objects (from Ant Design DatePicker)
            if (date && date.$isDayjsObject && date.isValid && date.isValid()) {
              return date.format("YYYY-MM-DD");
            } 
            // Handle Moment.js objects
            else if (moment.isMoment(date) && date.isValid()) {
              return date.format("YYYY-MM-DD");
            } 
            // Handle other date formats
            else if (date) {
              // Try to create a valid moment from the date
              const momentDate = moment(date);
              if (momentDate.isValid()) {
                return momentDate.format("YYYY-MM-DD");
              } else {
                console.error('Invalid date object:', date);
                return null;
              }
            }
            return null;
          })
          .filter((date: string | null) => date !== null) // Remove invalid dates
          .filter((date: string, index: number, array: string[]) => 
            array.indexOf(date) === index // Remove duplicates
          )
          .sort();

        console.log('Processing custom dates:', customDates);
        console.log('Disabled dates set:', Array.from(disabledDates));

        payload.isCustomDates = true;
        payload.customDates = customDates;
        payload.startDate = customDates[0];
        payload.endDate = customDates[customDates.length - 1];

        // Enhanced conflict checking for custom dates
        for (const dateStr of customDates) {
          if (disabledDates.has(dateStr)) {
            // Check if it's a holiday
            const holidayMatch = holidays.find((h: any) => h.date === dateStr);
            if (holidayMatch) {
              message.error(`Cannot request leave on holiday: ${holidayMatch.title} (${moment(dateStr).format('MMM DD, YYYY')})`);
              return;
            }
            
            // Check if it's an existing approved leave
            const existingLeaveMatch = existingLeaves.find((leave: any) => {
              if (leave.status !== 'approved') return false;
              
              if (leave.isCustomDates && Array.isArray(leave.customDates)) {
                return leave.customDates.includes(dateStr);
              } else if (leave.startDate && leave.endDate) {
                const leaveStart = moment(leave.startDate);
                const leaveEnd = moment(leave.endDate);
                const checkDate = moment(dateStr);
                return checkDate.isBetween(leaveStart, leaveEnd, 'day', '[]');
              }
              return false;
            });
            
            if (existingLeaveMatch) {
              message.error(`Cannot request leave on ${moment(dateStr).format('MMM DD, YYYY')} - overlaps with existing approved leave from ${moment(existingLeaveMatch.startDate).format('MMM DD, YYYY')} to ${moment(existingLeaveMatch.endDate).format('MMM DD, YYYY')}`);
              return;
            }
            
            // Generic overlap message if we can't determine the specific conflict
            message.error(`Cannot request leave on ${moment(dateStr).format('MMM DD, YYYY')} - date is not available`);
            return;
          }
        }

      } else if (dateSelectionType === 'range' && values.dateRange) {
        // Handle date range
        const [startDate, endDate] = values.dateRange || [];
        
        if (!startDate || !endDate) {
          message.error("Please select both start and end dates");
          return;
        }

        payload.startDate = startDate.format("YYYY-MM-DD");
        payload.endDate = endDate.format("YYYY-MM-DD");
        payload.isCustomDates = false;

        // Generate date range for validation
        const selectedDays: string[] = [];
        const current = moment(startDate);
        while (current.isSameOrBefore(endDate)) {
          selectedDays.push(current.format('YYYY-MM-DD'));
          current.add(1, 'day');
        }

        // Enhanced conflict checking for date range
        for (const dateStr of selectedDays) {
          if (disabledDates.has(dateStr)) {
            // Check if it's a holiday
            const holidayMatch = holidays.find((h: any) => h.date === dateStr);
            if (holidayMatch) {
              message.error(`Cannot request leave on holiday: ${holidayMatch.title} (${moment(dateStr).format('MMM DD, YYYY')})`);
              return;
            }
            
            // Check if it's an existing approved leave
            const existingLeaveMatch = existingLeaves.find((leave: any) => {
              if (leave.status !== 'approved') return false;
              
              if (leave.isCustomDates && Array.isArray(leave.customDates)) {
                return leave.customDates.includes(dateStr);
              } else if (leave.startDate && leave.endDate) {
                const leaveStart = moment(leave.startDate);
                const leaveEnd = moment(leave.endDate);
                const checkDate = moment(dateStr);
                return checkDate.isBetween(leaveStart, leaveEnd, 'day', '[]');
              }
              return false;
            });
            
            if (existingLeaveMatch) {
              message.error(`Cannot request leave on ${moment(dateStr).format('MMM DD, YYYY')} - overlaps with existing approved leave from ${moment(existingLeaveMatch.startDate).format('MMM DD, YYYY')} to ${moment(existingLeaveMatch.endDate).format('MMM DD, YYYY')}`);
              return;
            }
            
            // Generic overlap message if we can't determine the specific conflict
            message.error(`Cannot request leave on ${moment(dateStr).format('MMM DD, YYYY')} - date is not available`);
            return;
          }
        }
      } else {
        // Neither custom dates nor date range provided
        message.error("Please select either a date range or custom dates");
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
      
      // Backend automatically sends notification to the requested approver
      // No need to manually send notification from frontend
      
      form.resetFields();
      setDateSelectionType('range'); // Reset to default
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit leave request";
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDateSelectionType('range'); // Reset to default
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
          name="dateSelectionType"
          label="Date Selection Type"
          initialValue="range"
        >
          <Radio.Group
            onChange={(e) => {
              setDateSelectionType(e.target.value);
              // Clear date fields when switching types
              form.setFieldsValue({ 
                dateRange: undefined, 
                customDates: undefined 
              });
            }}
            value={dateSelectionType}
          >
            <Radio value="range">Date Range</Radio>
            <Radio value="custom">Custom Dates</Radio>
          </Radio.Group>
        </Form.Item>

        {dateSelectionType === 'range' ? (
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
                  
                  // Check if any selected date is a holiday or already taken leave
                  const start = moment(value[0]);
                  const end = moment(value[1]);
                  const current = start.clone();
                  
                  while (current.isSameOrBefore(end)) {
                    const dateStr = current.format('YYYY-MM-DD');
                    if (disabledDates.has(dateStr)) {
                      const holidayMatch = holidays.find((h: any) => h.date === dateStr);
                      if (holidayMatch) {
                        return Promise.reject(new Error(`Cannot select holiday date: ${holidayMatch.title} (${dateStr})`));
                      } else {
                        return Promise.reject(new Error(`Cannot select date with existing approved leave: ${dateStr}`));
                      }
                    }
                    current.add(1, 'day');
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
                if (current && current.isBefore(new Date(), 'day')) {
                  return true;
                }
                
                // Disable holidays and existing leave dates
                if (current) {
                  const dateStr = current.format('YYYY-MM-DD');
                  return disabledDates.has(dateStr);
                }
                
                return false;
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="customDates"
            label="Custom Dates"
            rules={[
              { required: true, message: "Please select at least one date" },
              {
                validator: (_, value) => {
                  if (!value || !Array.isArray(value) || value.length === 0) {
                    return Promise.reject(new Error("Please select at least one date"));
                  }
                  
                  // Check if any selected date is in the past
                  const pastDate = value.find((date: any) => moment(date).isBefore(new Date(), 'day'));
                  if (pastDate) {
                    return Promise.reject(new Error("Cannot select past dates"));
                  }
                  
                  // Check if any selected date is a holiday or already taken leave
                  for (const date of value) {
                    const dateStr = moment(date).format('YYYY-MM-DD');
                    if (disabledDates.has(dateStr)) {
                      const holidayMatch = holidays.find((h: any) => h.date === dateStr);
                      if (holidayMatch) {
                        return Promise.reject(new Error(`Cannot select holiday date: ${holidayMatch.title} (${dateStr})`));
                      } else {
                        return Promise.reject(new Error(`Cannot select date with existing approved leave: ${dateStr}`));
                      }
                    }
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
          >
            <DatePicker
              multiple
              placeholder="Select multiple dates"
              size="large"
              className="w-full"
              format="YYYY-MM-DD"
              maxTagCount="responsive"
              disabledDate={(current) => {
                if (!current) return false;
                
                // Disable past dates
                if (current.isBefore(new Date(), 'day')) {
                  return true;
                }
                
                // Disable holidays and existing leave dates
                const dateStr = (current as any).format('YYYY-MM-DD');
                if (disabledDates.has(dateStr)) {
                  return true;
                }
                
                return false;
              }}
            />
          </Form.Item>
        )}

        <Form.Item
          name="requestedManagerId"
          label="Select Approver"
          rules={[{ required: true, message: "Please select an approver" }]}
        >
          <Select
            placeholder="Select approver"
            size="large"
            className="w-full"
            loading={isLoadingApprovers}
            notFoundContent={approversError ? "Error loading approvers" : "No approvers available"}
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) => {
              const label = option?.label;
              if (typeof label === 'string') {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
            options={approvers.map((approver: any) => ({
              value: approver.id,
              label: approver.name,
              data: approver,
            }))}
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
            disabled={isLoadingLeaveTypes || validLeaveTypes.length === 0 || isLoadingApprovers}
          >
            {createLeaveMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default LeaveRequestModal;
