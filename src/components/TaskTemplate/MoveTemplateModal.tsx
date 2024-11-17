import { useProject } from "@/hooks/project/useProject";
import { useAddTaskProject } from "@/hooks/task/useAddTaskProject";
import { ProjectType } from "@/types/project";
import { Button, Form, List, message, Modal, Radio } from "antd";

const MoveTemplateModal = ({ handleCancel, isModalOpen, selectedRow }: any) => {
  const { data: project, isPending } = useProject({ status: "active" });

  const { mutate } = useAddTaskProject();
  const handleFinish = async (values: any) => {
    const payload = {
      ...values,
      tasks: selectedRow,
    };
    await mutate(payload, { onSuccess: () => { handleCancel(), message.success("Task added successfully") } });
  };

  return (
    <Modal
      title="Add Task to following project"
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

export default MoveTemplateModal;
