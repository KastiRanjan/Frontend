
import { Card, Col, Row, Progress } from "antd";
import { ProjectType } from "@/types/project";
import { TaskType } from "@/types/task";

interface ProjectSummaryProps {
    project: ProjectType;
}

const ProjectSummary = ({ project }: ProjectSummaryProps) => {
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

        return (
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Project Task Progress">
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