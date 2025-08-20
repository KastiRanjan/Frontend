import { useEffect, useState } from "react";
import { Card, List, Avatar, Spin, Typography } from "antd";
import { getProjectTimeline } from "@/service/project.service";

interface TimelineEntry {
  id: number;
  action: string;
  user?: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  details: string;
  createdAt: string;
}

interface ProjectTimelineProps {
  projectId: number;
}

const actionLabels: Record<string, string> = {
  project_created: "Project Created",
  task_added: "Task Added",
  task_assigned: "Task Assigned",
  task_unassigned: "Task Unassigned",
  worklog_added: "Worklog Added",
};

const ProjectTimeline = ({ projectId }: ProjectTimelineProps) => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProjectTimeline(projectId)
      .then((data) => setTimeline(data))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <Card title="Project Timeline">
      {loading ? (
        <Spin />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={timeline}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.user ? (
                    <Avatar src={item.user.avatar || undefined}>
                      {item.user.name[0]}
                    </Avatar>
                  ) : (
                    <Avatar icon={"user"} />
                  )
                }
                title={
                  <>
                    <b>{actionLabels[item.action] || item.action}</b>
                    {item.user && (
                      <span style={{ marginLeft: 8, color: '#888' }}>
                        by {item.user.name}
                      </span>
                    )}
                  </>
                }
                description={
                  <>
                    <Typography.Text>{item.details}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default ProjectTimeline;
