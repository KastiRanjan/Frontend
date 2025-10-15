
import { Card, Col, Row, Progress, Button, Alert } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { ProjectType } from "@/types/project";
import { TaskType } from "@/types/task";
import { useSession } from "@/context/SessionContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeProject } from "@/service/project.service";
import { message, Modal } from "antd";

interface ProjectSummaryProps {
    project: ProjectType;
}

const ProjectSummary = ({ project }: ProjectSummaryProps) => {
    const { profile } = useSession();
    const queryClient = useQueryClient();
    
    const tasks: TaskType[] = project?.tasks || [];
    // Only main tasks (no subtasks)
    const mainTasks: TaskType[] = tasks.filter((task) => !task.project);

    const total = mainTasks.length;
    const completed = mainTasks.filter((t: TaskType) => t.status === "done" || t.status === "second_verified" || t.status === "first_verified").length;
    const inProgress = mainTasks.filter((t: TaskType) => t.status === "in_progress").length;
    const open = mainTasks.filter((t: TaskType) => t.status === "open").length;
    const other = total - completed - inProgress - open;

    const percentCompleted = total ? ((completed / total) * 100).toFixed(1) : "0";
    const percentInProgress = total ? ((inProgress / total) * 100).toFixed(1) : "0";
    const percentOpen = total ? ((open / total) * 100).toFixed(1) : "0";
    const percentOther = total ? ((other / total) * 100).toFixed(1) : "0";

    const allTasksCompleted = total > 0 && completed === total;
    const isProjectLead = project?.projectLead?.id === profile?.id;
    const isProjectManager = project?.projectManager?.id === profile?.id;
    const canCompleteProject = (isProjectLead || isProjectManager) && project?.status === 'active';

    const completeMutation = useMutation({
        mutationFn: () => completeProject(project?.id?.toString()),
        onSuccess: () => {
            message.success('Project marked as completed successfully');
            queryClient.invalidateQueries({ queryKey: ['project', project?.id?.toString()] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to complete project');
        }
    });

    const handleCompleteProject = () => {
        Modal.confirm({
            title: 'Complete Project',
            content: 'Are you sure you want to mark this project as completed? All tasks must be finished before completion.',
            okText: 'Yes, Complete',
            cancelText: 'Cancel',
            onOk: () => completeMutation.mutate()
        });
    };

    return (
        <Row gutter={[16, 16]}>
            <Col span={24}>
                <Card 
                    title="Project Task Progress"
                    extra={
                        canCompleteProject && allTasksCompleted && (
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleCompleteProject}
                                loading={completeMutation.isPending}
                            >
                                Mark as Completed
                            </Button>
                        )
                    }
                >
                    {canCompleteProject && allTasksCompleted && (
                        <Alert
                            message="Ready for Completion"
                            description="All tasks are completed. You can now mark this project as completed."
                            type="success"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    
                    {canCompleteProject && !allTasksCompleted && (
                        <Alert
                            message="Cannot Complete Yet"
                            description={`${total - completed} task(s) still pending. All tasks must be completed before project completion.`}
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <div style={{ marginBottom: 16 }}>
                        <Progress percent={Number(percentCompleted)} status="active" strokeColor="#52c41a" />
                        <div><b>{percentCompleted}%</b> Completed</div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <span style={{ color: '#1890ff' }}>{percentInProgress}% In Progress</span> | <span style={{ color: '#faad14' }}>{percentOpen}% Open</span> | <span style={{ color: '#d9d9d9' }}>{percentOther}% Other</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#888' }}>
                        <b>{total}</b> main tasks: {completed} completed, {inProgress} in progress, {open} open, {other} other
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default ProjectSummary;