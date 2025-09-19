import { useFetchTaskGroups } from "@/hooks/taskGroup/useFetchTaskGroups";
import { useFetchTaskSuper } from "@/hooks/taskSuper/useFetchTaskSuper";
import { Button, Empty, Modal, Spin, Typography } from "antd";
import { useState, useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import TaskGroupForm from "../TaskGroup/TaskGroupForm";
import { TaskGroupsTable } from "../TaskGroup";
import { hasPermission } from "@/utils/utils";
import { permissionConfig } from "@/utils/permission-config";
import { useQueryClient } from "@tanstack/react-query";
import { TaskGroupType } from "@/types/taskSuper";

const { Title } = Typography;

const TaskSuperDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isTaskGroupModalOpen, setIsTaskGroupModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: taskSuper, isPending: isTaskSuperLoading } = useFetchTaskSuper(id as string);
  const { data: taskGroups, isPending: isTaskGroupsLoading } = useFetchTaskGroups({
    taskSuperId: id as string,
  });

  // Log the task groups to see if they contain templates
  useEffect(() => {
    if (taskGroups) {
      console.log("Task groups loaded in TaskSuperDetails:", taskGroups);
      // Check for templates
      taskGroups.forEach((group: TaskGroupType, index: number) => {
        console.log(`Task group ${index + 1} (${group.name}):`, {
          id: group.id,
          hasTasktemplateProperty: 'tasktemplate' in group,
          hasTaskTemplatesProperty: 'taskTemplates' in group,
          tasktemplateIsArray: group.tasktemplate && Array.isArray(group.tasktemplate),
          taskTemplatesIsArray: group.taskTemplates && Array.isArray(group.taskTemplates),
          tasktemplateLength: group.tasktemplate ? group.tasktemplate.length : 0,
          taskTemplatesLength: group.taskTemplates ? group.taskTemplates.length : 0,
          allProps: Object.keys(group),
          rawGroup: group
        });
      });
    }
  }, [taskGroups]);

  const handleGoBack = () => {
    navigate("/task-template");
  };

  const openTaskGroupModal = () => {
    setIsTaskGroupModalOpen(true);
  };

  const closeTaskGroupModal = () => {
    setIsTaskGroupModalOpen(false);
    // Invalidate task groups query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["taskGroups", id] });
  };

  if (isTaskSuperLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!taskSuper) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Empty description="Category not found" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleGoBack} 
          className="mr-2"
        />
        <Title level={3} className="m-0">
          {taskSuper.name}
        </Title>
      </div>
      <div className="flex justify-between items-center mb-4">
        {hasPermission(permissionConfig.CREATE_TASK_GROUP) && (
          <Button type="primary" onClick={openTaskGroupModal}>
            Add Task Group
          </Button>
        )}
      </div>

      {isTaskGroupsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spin />
        </div>
      ) : taskGroups && taskGroups.length > 0 ? (
        <TaskGroupsTable 
          taskSuperId={id as string}
          data={taskGroups}
        />
      ) : (
        <Empty description="No Task Groups found" />
      )}

      <Modal
        title="Add Task Group"
        open={isTaskGroupModalOpen}
        onCancel={closeTaskGroupModal}
        footer={null}
        width={600}
      >
        <TaskGroupForm 
          handleCancel={closeTaskGroupModal} 
          fixedTaskSuperId={id} 
        />
      </Modal>
    </div>
  );
};

export default TaskSuperDetails;