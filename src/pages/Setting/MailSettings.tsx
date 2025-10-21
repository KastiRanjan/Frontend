import { useState, useEffect } from 'react';
import { Card, Form, Switch, InputNumber, Select, Button, message, Spin, Typography, Input } from 'antd';
import { SaveOutlined, MailOutlined } from '@ant-design/icons';
import { getMailSettings, updateMailSettings } from '../../service/mailSettings.service';
import { fetchRole } from '../../service/role.service';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface MailSettingsFormData {
  enabled: boolean;
  clockInRemindersEnabled: boolean;
  clockOutRemindersEnabled: boolean;
  gracePeriodMinutes: number;
  cronSchedule: string;
  excludedRoles: string[];
}

interface Role {
  id: string;
  name: string;
  displayName?: string;
}

const MailSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<MailSettingsFormData | null>(null);

  useEffect(() => {
    loadSettings();
    loadRoles();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getMailSettings();
      setSettings(response);
      form.setFieldsValue(response);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load mail settings');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetchRole({ limit: 100, page: 1 });
      console.log('Raw roles response:', response);
      
      // Handle different response structures
      let rolesData = [];
      if (response.results) {
        rolesData = response.results; // Paginated response
      } else if (response.data) {
        rolesData = response.data;
      } else if (Array.isArray(response)) {
        rolesData = response;
      }
      
      setRoles(rolesData);
      console.log('Loaded roles:', rolesData);
    } catch (error) {
      console.error('Failed to load roles:', error);
      message.error('Failed to load roles');
    }
  };

  const handleSave = async (values: MailSettingsFormData) => {
    try {
      setSaving(true);
      await updateMailSettings(values);
      message.success('Mail settings updated successfully');
      setSettings(values);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update mail settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Title level={3}>
            <MailOutlined className="mr-2" />
            Mail Settings - Attendance Reminders
          </Title>
          <Paragraph className="text-gray-600">
            Configure automated email reminders for attendance clock-in and clock-out.
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={settings || undefined}
        >
          <Card className="mb-4 bg-blue-50">
            <Form.Item
              name="enabled"
              label="Master Control"
              valuePropName="checked"
              extra="Enable or disable all attendance email reminders"
            >
              <Switch
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
            </Form.Item>
          </Card>

          <Card className="mb-4">
            <Title level={5}>Clock-In Reminders</Title>
            <Form.Item
              name="clockInRemindersEnabled"
              label="Send reminders for late clock-ins"
              valuePropName="checked"
              extra="Users will receive an email if they haven't clocked in after the grace period"
            >
              <Switch
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
            </Form.Item>
          </Card>

          <Card className="mb-4">
            <Title level={5}>Clock-Out Reminders</Title>
            <Form.Item
              name="clockOutRemindersEnabled"
              label="Send reminders for late clock-outs"
              valuePropName="checked"
              extra="Users will receive an email if they haven't clocked out after the grace period"
            >
              <Switch
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
            </Form.Item>
          </Card>

          <Card className="mb-4">
            <Title level={5}>Cron Schedule</Title>
            <Form.Item
              name="cronSchedule"
              label="Cron expression for checking reminders"
              rules={[
                { required: true, message: 'Please enter cron schedule' },
              ]}
              extra="Example: */15 * * * * (every 15 minutes). Changes require server restart."
            >
              <Input
                placeholder="*/15 * * * *"
                style={{ width: '300px' }}
              />
            </Form.Item>
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800 mb-1">
                <strong>⚠️ Important:</strong>
              </p>
              <ul className="text-xs text-yellow-700 ml-4 space-y-1">
                <li><strong>Server restart required</strong> for cron schedule changes to take effect</li>
                <li>This is a NestJS limitation - cron jobs are registered at startup</li>
                <li>After changing, ask your system administrator to restart the backend server</li>
              </ul>
              <p className="text-sm text-yellow-800 mt-2 mb-1">
                <strong>Common Cron Patterns:</strong>
              </p>
              <ul className="text-xs text-yellow-700 ml-4 space-y-1">
                <li><code>* * * * *</code> - Every minute</li>
                <li><code>*/5 * * * *</code> - Every 5 minutes</li>
                <li><code>*/15 * * * *</code> - Every 15 minutes (recommended)</li>
                <li><code>*/30 * * * *</code> - Every 30 minutes</li>
                <li><code>0 * * * *</code> - Every hour</li>
                <li><code>0 9,17 * * *</code> - At 9 AM and 5 PM only</li>
              </ul>
            </div>
          </Card>

          <Card className="mb-4">
            <Title level={5}>Grace Period</Title>
            <Form.Item
              name="gracePeriodMinutes"
              label="Minutes after expected time"
              rules={[
                { required: true, message: 'Please enter grace period' },
                { type: 'number', min: 1, max: 480, message: 'Must be between 1 and 480 minutes' }
              ]}
              extra="Users receive reminders this many minutes after their scheduled clock-in/out time"
            >
              <InputNumber
                min={1}
                max={480}
                style={{ width: '200px' }}
                addonAfter="minutes"
              />
            </Form.Item>
          </Card>

          <Card className="mb-4">
            <Title level={5}>Excluded Roles</Title>
            <Form.Item
              name="excludedRoles"
              label="Users with these roles won't receive reminders"
              extra="Select roles that should be excluded from attendance reminder emails"
            >
              <Select
                mode="multiple"
                placeholder="Select roles to exclude"
                style={{ width: '100%' }}
                allowClear
                loading={roles.length === 0}
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                }
              >
                {roles.map((role) => (
                  <Option key={role.name} value={role.name}>
                    {role.displayName || role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <Paragraph className="mb-2">
              <strong>ℹ️ Important Notes:</strong>
            </Paragraph>
            <ul className="list-disc ml-6">
              <li>Cron schedule changes require server restart to take effect</li>
              <li>Other changes take effect within next cron job run</li>
              <li>Each user receives maximum 1 reminder email per day for clock-in and clock-out</li>
              <li>Reminders are only sent on working days (not on holidays or leaves)</li>
              <li>Excluded roles will never receive reminder emails regardless of other settings</li>
            </ul>
          </div>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              size="large"
            >
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MailSettings;
