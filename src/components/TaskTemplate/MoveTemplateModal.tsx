import { useProject } from "@/hooks/project/useProject";
import { useAddTaskProject } from "@/hooks/task/useAddTaskProject";
import { Project } from "@/pages/Project/type";
import { Button, Form, List, Modal, Radio } from "antd";

const MoveTemplateModal = ({ handleCancel, isModalOpen, selectedRow }: any) => {
  const { data: project, isPending } = useProject();

  const { mutate } = useAddTaskProject();
  const handleFinish = async (values: any) => {
    const payload = {
      ...values,
      tasks: selectedRow,
    };
    await mutate(payload);
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
              renderItem={(item: Project) => (
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
