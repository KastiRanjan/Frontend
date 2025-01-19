import { useTaskGroup } from "@/hooks/taskGroup/useTaskGroup";
import { useDeleteTaskGroup } from "@/hooks/taskGroup/useTaskGroupDelete";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Checkbox, Col, Input, Modal, Row, Space } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoveTemplateModal from "../TaskTemplate/MoveTemplateModal";
import { TaskGroupType } from "@/types/taskGroup";

interface TaskGroupListProps {
  showModal: (group?: TaskGroupType) => void;
}


const TaskGroupList = ({ showModal }: TaskGroupListProps) => {
  const [modal, contextHolder] = Modal.useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedRows, setCheckedRows] = useState<string[]>([]);
  const navigate = useNavigate();
  const { data: taskGroup, isPending } = useTaskGroup();
  const { mutate: deleteTaskGroup } = useDeleteTaskGroup();
  const handleCheckboxChange = (id: string) => {
    if (checkedRows.includes(id)) {
      setCheckedRows(checkedRows.filter((rowId) => rowId !== id));
    } else {
      setCheckedRows([...checkedRows, id]);
    }
  };
  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this task group?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteTaskGroup({ id });
      },
    })
  };

  return (
    <>
      {contextHolder}

      {checkedRows.length > 0 && <Button type="primary" onClick={() => setIsModalOpen(true)} >Add To</Button>}
      <Row gutter={[8, 8]}>
        <Col span={6}>
          <Card
            className="h-full flex justify-center items-center cursor-pointer"
            bordered={false}
            style={{ border: "2px dotted #ccc" }}
            onClick={() => showModal()}
          >
            <PlusCircleOutlined key='plus' /> Add Template
          </Card>
        </Col>
        {taskGroup?.map((group: TaskGroupType) => (
          <Col span={6} key={group.id}>
            <Card
              loading={isPending}
              title={group.name}
              extra={<Checkbox onClick={(e) => e.stopPropagation()} onChange={() => handleCheckboxChange(group.id)} />}
              actions={[
                <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); showModal(group); }} />,
                <DeleteOutlined key="delete" onClick={(e) => { e.stopPropagation(); handleDelete(group.id); }} />,
              ]}
              onClick={() => navigate(`/task-template/${group.id}`)}
            >
              <Card.Meta
                avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />}
                description={
                  <>
                    <p>This is the description</p>
                    <p>This is the description</p>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {isModalOpen && (
        <MoveTemplateModal
          selectedRow={checkedRows}
          handleCancel={() => setIsModalOpen(false)}
          isModalOpen={isModalOpen}
        />
      )}
    </>
  );
};

export default TaskGroupList;
