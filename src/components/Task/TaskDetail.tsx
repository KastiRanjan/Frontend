import { Card, Descriptions, Tag, List, Typography} from 'antd';

const { Title, Text } = Typography;

const TaskDetail = ({ data }) => {
    console.log('Task Detail:', data);

    if (!data) {
        return <Text type="secondary">No task data available</Text>;
    }

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'blue';
            case 'in_progress': return 'green';
            case 'done': return 'red';
            default: return 'default';
        }
    };

    // Priority color mapping
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'green';
            case 'medium': return 'orange';
            case 'high': return 'red';
            default: return 'default';
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Main Task Card */}
            <Card
                title={<Title level={2}>{data.name || 'Unnamed Task'}</Title>}
                bordered={false}
                style={{ marginBottom: 24 }}
            >
                <Text>{data.description || 'No description provided'}</Text>

                {/* Task Information */}
                <Descriptions
                    title="Task Information"
                    bordered
                    column={1}
                    style={{ marginTop: 24 }}
                >
                    <Descriptions.Item label="Task Code">{data.tcode}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(data.status)}>{data.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Priority">
                        <Tag color={getPriorityColor(data.priority)}>{data.priority}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">{data.taskType}</Descriptions.Item>
                    <Descriptions.Item label="Due Date">
                        {data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'Not set'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                        {new Date(data.createdAt).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated">
                        {new Date(data.updatedAt).toLocaleString()}
                    </Descriptions.Item>
                </Descriptions>

                {/* Project Details */}
                {data.project && (
                    <Descriptions
                        title="Project Details"
                        bordered
                        column={1}
                        style={{ marginTop: 24 }}
                    >
                        <Descriptions.Item label="Project Name">{data.project.name}</Descriptions.Item>
                        <Descriptions.Item label="Description">{data.project.description}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={getStatusColor(data.project.status)}>{data.project.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Nature of Work">{data.project.natureOfWork}</Descriptions.Item>
                        <Descriptions.Item label="Fiscal Year">{data.project.fiscalYear}</Descriptions.Item>
                        <Descriptions.Item label="Start Date">
                            {new Date(data.project.startingDate).toLocaleDateString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="End Date">
                            {new Date(data.project.endingDate).toLocaleDateString()}
                        </Descriptions.Item>
                    </Descriptions>
                )}

                {/* Group Details */}
                {data.group && (
                    <Descriptions
                        title="Group Details"
                        bordered
                        column={1}
                        style={{ marginTop: 24 }}
                    >
                        <Descriptions.Item label="Group Name">{data.group.name}</Descriptions.Item>
                        <Descriptions.Item label="Description">{data.group.description}</Descriptions.Item>
                    </Descriptions>
                )}
            </Card>

            {/* Assignees Section */}
            <Card title="Assignees" style={{ marginBottom: 24 }}>
                {data.assignees.length > 0 ? (
                    <List
                        dataSource={data.assignees}
                        renderItem={(item) => (
                            <List.Item>
                                <Text>{item}</Text>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text type="secondary">No assignees yet</Text>
                )}
            </Card>

            {/* Subtasks Section */}
            <Card title="Subtasks">
                {data.subTasks.length > 0 ? (
                    <List
                        dataSource={data.subTasks}
                        renderItem={(item) => (
                            <List.Item>
                                <Text>{item.name}</Text>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text type="secondary">No subtasks available</Text>
                )}
            </Card>
        </div>
    );
};

export default TaskDetail;