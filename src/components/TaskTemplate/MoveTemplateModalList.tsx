import { useProject } from "@/hooks/project/useProject";
import { useAddTaskProjectIndividual } from "@/hooks/task/useAddTaskProjectIndividual";
import { ProjectType } from "@/types/project";
import { Button, Form, List, message, Modal, Radio } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const MoveTemplateModalList = ({ handleCancel, isModalOpen, selectedRow, groupId }: any) => {
  const queryClient = useQueryClient();
  const { data: project, isPending, refetch } = useProject({ status: "active" });

  const { mutate } = useAddTaskProjectIndividual();

  // Refetch projects when modal opens to ensure we have the latest data
  useEffect(() => {
    if (isModalOpen) {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      refetch();
    }
  }, [isModalOpen, queryClient, refetch]);

  const handleFinish = async (values: any) => {
    let payload = {
      ...values,
      tasklist: selectedRow,
    };
    payload.tasks = [groupId];
    await mutate(payload, { onSuccess: () => { handleCancel(), message.success("Task added successfully") } });
  };

  return (
    <Modal
      title="Template"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
    >
      <Form onFinish={handleFinish}>
        <Form.Item name="project">
          <Radio.Group>
            <List
              loading={isPending}
              dataSource={project}
              renderItem={(item: ProjectType) => (
                <List.Item>
                  <Radio value={item.id}>{item.name}</Radio>
                </List.Item>
              )}
            />
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MoveTemplateModalList;
