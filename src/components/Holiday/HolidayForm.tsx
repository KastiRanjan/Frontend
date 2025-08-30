import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Typography
} from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCreateHoliday, useUpdateHoliday } from '../../hooks/holiday/useHoliday';
import { CreateHolidayDto, UpdateHolidayDto, HolidayType } from '../../types/holiday';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface HolidayFormProps {
  holiday?: HolidayType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({ 
  holiday, 
  onSuccess,
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday();

  useEffect(() => {
    if (holiday) {
      setIsEditing(true);
      form.setFieldsValue({
        ...holiday,
        date: holiday.date ? dayjs(holiday.date) : undefined
      });
    } else {
      setIsEditing(false);
      form.resetFields();
    }
  }, [holiday, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: CreateHolidayDto | UpdateHolidayDto = {
        date: values.date.format('YYYY-MM-DD'),
        title: values.title,
        type: values.type,
        description: values.description,
        bsDate: values.bsDate
      };

      if (isEditing && holiday) {
        await updateHoliday.mutateAsync({ 
          id: holiday.id, 
          payload: payload as UpdateHolidayDto 
        });
        message.success('Holiday updated successfully');
      } else {
        await createHoliday.mutateAsync(payload as CreateHolidayDto);
        message.success('Holiday created successfully');
        form.resetFields();
      }

      onSuccess?.();
    } catch (error) {
      message.error(`Failed to ${isEditing ? 'update' : 'create'} holiday`);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setIsEditing(false);
    onCancel?.();
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: '8px' }} />
          <Title level={4} style={{ margin: 0 }}>
            {isEditing ? 'Edit Holiday' : 'Add New Holiday'}
          </Title>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'public'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select the holiday date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Select date"
              />
            </Form.Item>
          </div>

          <div style={{ flex: '2', minWidth: '300px' }}>
            <Form.Item
              name="title"
              label="Holiday Title"
              rules={[
                { required: true, message: 'Please enter the holiday title' },
                { max: 100, message: 'Title must be less than 100 characters' }
              ]}
            >
              <Input placeholder="Enter holiday title" />
            </Form.Item>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select the holiday type' }]}
            >
              <Select placeholder="Select type">
                <Option value="public">Public Holiday</Option>
                <Option value="company">Company Holiday</Option>
                <Option value="festival">Festival</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2', minWidth: '300px' }}>
            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea 
                rows={3} 
                placeholder="Enter holiday description (optional)"
                maxLength={500}
              />
            </Form.Item>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <Form.Item
              name="bsDate"
              label="BS Date (Optional)"
            >
              <Input placeholder="e.g., 2080-09-17" />
            </Form.Item>
          </div>
        </div>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={createHoliday.isPending || updateHoliday.isPending}
            >
              {isEditing ? 'Update Holiday' : 'Add Holiday'}
            </Button>
            <Button onClick={handleReset}>
              {isEditing ? 'Cancel' : 'Reset'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default HolidayForm;
