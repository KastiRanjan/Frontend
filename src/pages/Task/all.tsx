import AllTaskTable from "@/components/Task/AllTaskTable";
import TaskForm from "@/components/Task/TaskForm";
import { Button, Modal, Tabs } from "antd";
import { useState } from "react";
import { useSession } from "@/context/SessionContext";

const AllTask = () => {
  const [open, setOpen] = useState(false);
  const { profile } = useSession();
  const userRole = profile?.role?.name?.toLowerCase();
  const userId = profile?.id;
  const hideAddTask = userRole === "auditsenior" || userRole === "auditjunior";
  return (
    <div>
      {!hideAddTask && <Button onClick={() => setOpen(true)}>Add Task</Button>}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: `TODO`,
            key: "1",
            children: <AllTaskTable status={"open"} userId={userId} />,
          },
          {
            label: `DOING`,
            key: "2",
            children: <AllTaskTable status={"in_progress"} userId={userId} />,
          },
          {
            label: `COMPLETED`,
            key: "3",
            children: <AllTaskTable status={"done"} userId={userId} />,
          },
        ]}
      />
      <Modal
        title="Add Task"
        open={open}
        width={800}
        onOk={() => console.log("ok")}
        onCancel={() => setOpen(false)}
      >
        <TaskForm />
      </Modal>
    </div>
  );
};

export default AllTask;
