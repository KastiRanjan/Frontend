import React from 'react';
import { Table, Spin, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetchProjectsByCustomer } from '@/service/clientReport.service';
import { fetchProject } from '@/service/project.service';

interface ClientProjectsProps {
  clientId: string;
}

const ClientProjects: React.FC<ClientProjectsProps> = ({ clientId }) => {
  const { data: baseProjects, isLoading: isBaseLoading } = useQuery({
    queryKey: ['client-projects', clientId],
    queryFn: () => fetchProjectsByCustomer(clientId),
    enabled: !!clientId,
  });

  const { data: fullProjects, isLoading: isFullLoading } = useQuery({
    queryKey: ['client-projects-full', clientId, baseProjects],
    queryFn: async () => {
      if (!baseProjects) return [];
      const promises = baseProjects.map((p: any) => fetchProject({ id: p.id }));
      return Promise.all(promises);
    },
    enabled: !!baseProjects && baseProjects.length > 0,
  });

  if (isBaseLoading || (baseProjects?.length && isFullLoading)) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>;
  }

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Payment Status',
      key: 'payment',
      render: (_: any, record: any) => {
        if (record.isPaymentDone) return <Tag color="green">Done</Tag>;
        if (record.isPaymentTemporarilyEnabled) return <Tag color="orange">Temporarily Enabled</Tag>;
        return <Tag color="red">Pending</Tag>;
      }
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={fullProjects || []} 
      rowKey="id" 
      pagination={false}
    />
  );
};

export default ClientProjects;
