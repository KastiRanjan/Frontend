import { useState } from 'react';
import { Card, Button, Row, Col, Spin, message, Typography, Space, Tag, Alert } from 'antd';
import { UserAddOutlined, SyncOutlined, CheckOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const { Title, Text } = Typography;

const backendURI = import.meta.env.VITE_BACKEND_URI;

// API Functions
const fetchRoles = async () => {
  const response = await axios.get(`${backendURI}/roles?limit=100&page=1`);
  return response.data.results;
};

const fetchPermissions = async () => {
  const response = await axios.get(`${backendURI}/permissions?limit=1000&page=1`);
  return response.data.results;
};

const syncPermissions = async () => {
  const response = await axios.post(`${backendURI}/permissions/sync`);
  return response.data;
};

const updateRolePermissions = async ({ roleId, permissions }: { roleId: string, permissions: string[] }) => {
  const response = await axios.put(`${backendURI}/roles/${roleId}/permissions`, { permissions });
  return response.data;
};

interface Permission {
  id: string; // Changed from number to string to match backend UUID
  name: string;
  resource: string;
  description: string;
  method: string;
  path: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions?: Permission[];
}

const PermissionAssignmentManager = () => {
  const [assignedRoles, setAssignedRoles] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions
  });

  const syncPermissionsMutation = useMutation({
    mutationFn: syncPermissions,
    onSuccess: () => {
      message.success('Permissions synced successfully!');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    onError: () => {
      message.error('Failed to sync permissions');
    }
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: updateRolePermissions,
    onSuccess: (_, variables) => {
      setAssignedRoles(prev => new Set([...prev, variables.roleId]));
      message.success('Permissions assigned successfully!');
    },
    onError: () => {
      message.error('Failed to assign permissions');
    }
  });

  // Permission mapping based on role requirements
  const getRolePermissions = (roleName: string): string[] => {
    const basePermissions = [
      // Auth and profile permissions - everyone needs these
      ...permissions.filter((p: Permission) => 
        p.path.includes('/auth/profile') || 
        p.path.includes('/auth/token-info') ||
        p.path.includes('/logout') ||
        p.resource === 'dashboard'
      ).map((p: Permission) => p.id)
    ];

    switch (roleName.toLowerCase()) {
      case 'administrator':
      case 'admin':
        // Administrators get all permissions
        return permissions.map((p: Permission) => p.id);

      case 'projectmanager':
      case 'project manager':
        return [
          ...basePermissions,
          // User management (view only)
          ...permissions.filter((p: Permission) => 
            p.resource === 'user' && p.method === 'GET'
          ).map((p: Permission) => p.id),
          // Full project management
          ...permissions.filter((p: Permission) => 
            p.resource === 'projects'
          ).map((p: Permission) => p.id),
          // Task management
          ...permissions.filter((p: Permission) => 
            p.resource === 'tasks'
          ).map((p: Permission) => p.id),
          // Worklog management
          ...permissions.filter((p: Permission) => 
            p.resource === 'worklogs'
          ).map((p: Permission) => p.id),
          // Leave approval permissions
          ...permissions.filter((p: Permission) => 
            p.resource === 'leave' && 
            (p.path.includes('/approve/pm') || p.method === 'GET')
          ).map((p: Permission) => p.id),
          // Work hour and calendar view
          ...permissions.filter((p: Permission) => 
            (p.resource === 'workhour' && p.method === 'GET') ||
            (p.resource === 'calendar' && p.method === 'GET') ||
            (p.resource === 'holiday' && p.method === 'GET')
          ).map((p: Permission) => p.id),
          // Client management
          ...permissions.filter((p: Permission) => 
            p.resource === 'client'
          ).map((p: Permission) => p.id),
        ];

      case 'auditsenior':
      case 'audit senior':
        return [
          ...basePermissions,
          // User profile view
          ...permissions.filter((p: Permission) => 
            p.resource === 'user' && p.method === 'GET' && p.path.includes('/:id')
          ).map((p: Permission) => p.id),
          // Project view
          ...permissions.filter((p: Permission) => 
            p.resource === 'projects' && p.method === 'GET'
          ).map((p: Permission) => p.id),
          // Task view
          ...permissions.filter((p: Permission) => 
            p.resource === 'tasks' && p.method === 'GET'
          ).map((p: Permission) => p.id),
          // Worklog management
          ...permissions.filter((p: Permission) => 
            p.resource === 'worklogs'
          ).map((p: Permission) => p.id),
          // Leave management
          ...permissions.filter((p: Permission) => 
            p.resource === 'leave' && 
            (p.method === 'GET' || p.method === 'POST' || p.method === 'PATCH')
          ).map((p: Permission) => p.id),
          // Work hour view and calendar
          ...permissions.filter((p: Permission) => 
            (p.resource === 'workhour' && p.method === 'GET') ||
            (p.resource === 'calendar') ||
            (p.resource === 'holiday' && p.method === 'GET')
          ).map((p: Permission) => p.id),
          // Client view
          ...permissions.filter((p: Permission) => 
            p.resource === 'client' && (p.method === 'GET' || p.method === 'POST' || p.method === 'PATCH')
          ).map((p: Permission) => p.id),
        ];

      case 'auditjunior':
      case 'audit junior':
        return [
          ...basePermissions,
          // Basic user profile view
          ...permissions.filter((p: Permission) => 
            p.resource === 'user' && p.method === 'GET' && p.path.includes('/:id')
          ).map((p: Permission) => p.id),
          // Project view only
          ...permissions.filter((p: Permission) => 
            p.resource === 'projects' && p.method === 'GET'
          ).map((p: Permission) => p.id),
          // Task view only
          ...permissions.filter((p: Permission) => 
            p.resource === 'tasks' && p.method === 'GET'
          ).map((p: Permission) => p.id),
          // Own worklog management
          ...permissions.filter((p: Permission) => 
            p.resource === 'worklogs' && 
            (p.path.includes('/user') || p.method === 'POST' || p.method === 'PATCH')
          ).map((p: Permission) => p.id),
          // Leave application
          ...permissions.filter((p: Permission) => 
            p.resource === 'leave' && 
            (p.method === 'GET' || p.method === 'POST' || p.method === 'PATCH')
          ).map((p: Permission) => p.id),
          // Calendar and work hour view only
          ...permissions.filter((p: Permission) => 
            (p.resource === 'workhour' && p.method === 'GET') ||
            (p.resource === 'calendar' && p.method === 'GET') ||
            (p.resource === 'holiday' && p.method === 'GET')
          ).map((p: Permission) => p.id),
        ];

      default:
        return basePermissions;
    }
  };

  const handleSyncPermissions = () => {
    syncPermissionsMutation.mutate();
  };

  const handleAssignPermissions = (role: Role) => {
    const requiredPermissions = getRolePermissions(role.name);
    assignPermissionsMutation.mutate({
      roleId: role.id,
      permissions: requiredPermissions
    });
  };

  const handleAssignAllRoles = async () => {
    for (const role of roles) {
      const requiredPermissions = getRolePermissions(role.name);
      try {
        await updateRolePermissions({ roleId: role.id, permissions: requiredPermissions });
        setAssignedRoles(prev => new Set([...prev, role.id]));
      } catch (error) {
        console.error(`Failed to assign permissions to ${role.name}`);
      }
    }
    message.success('Permissions assigned to all roles!');
  };

  if (rolesLoading || permissionsLoading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Permission Assignment Manager</Title>
        <Text type="secondary">
          Configure role-based permissions for work hour calendar, leave, holiday, and other features.
        </Text>

        <Alert
          message="Permission Assignment Guide"
          description={
            <div>
              <p><strong>Administrator:</strong> Full access to all features and management capabilities</p>
              <p><strong>Project Manager:</strong> Project management, team oversight, leave approvals</p>
              <p><strong>Audit Senior:</strong> Full project visibility, leave management, calendar access</p>
              <p><strong>Audit Junior:</strong> View-only access, own worklog/leave management, calendar viewing</p>
            </div>
          }
          type="info"
          showIcon
          style={{ margin: '24px 0' }}
        />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={handleSyncPermissions}
                loading={syncPermissionsMutation.isPending}
                size="large"
              >
                Sync Permissions from Config
              </Button>
            </Col>
            <Col>
              <Button
                type="default"
                icon={<UserAddOutlined />}
                onClick={handleAssignAllRoles}
                loading={assignPermissionsMutation.isPending}
                size="large"
              >
                Assign All Role Permissions
              </Button>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {roles.map((role: Role) => {
              const requiredPermissions = getRolePermissions(role.name);
              const isAssigned = assignedRoles.has(role.id);
              
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={role.id}>
                  <Card
                    title={role.displayName || role.name}
                    size="small"
                    extra={
                      isAssigned ? (
                        <Tag color="green" icon={<CheckOutlined />}>
                          Assigned
                        </Tag>
                      ) : (
                        <Tag color="orange">Pending</Tag>
                      )
                    }
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleAssignPermissions(role)}
                        loading={assignPermissionsMutation.isPending}
                        disabled={isAssigned}
                      >
                        Assign Permissions
                      </Button>
                    ]}
                  >
                    <Text strong>Permissions: </Text>
                    <Text>{requiredPermissions.length}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Role: {role.name}
                    </Text>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Card title="Permission Statistics" style={{ marginTop: '24px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3}>{roles.length}</Title>
                  <Text>Total Roles</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3}>{permissions.length}</Title>
                  <Text>Total Permissions</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3}>{assignedRoles.size}</Title>
                  <Text>Assigned Roles</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3}>
                    {new Set(permissions.map((p: Permission) => p.resource)).size}
                  </Title>
                  <Text>Resources</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default PermissionAssignmentManager;
