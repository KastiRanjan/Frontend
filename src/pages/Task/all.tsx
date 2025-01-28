import AllTaskTable from "@/components/Task/AllTaskTable";
import TaskForm from "@/components/Task/TaskForm";
import { Button, Modal, Tabs } from "antd";
import { useState } from "react";

const AllTask = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Task</Button>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: `TODO`,
            key: "1",
            children: <AllTaskTable status={"open"} />,
          },
          {
            label: `DOING`,
            key: "2",
            children: <AllTaskTable status={"in_progress"} />,
          },
          {
            label: `COMPLETED`,
            key: "3",
            children: <AllTaskTable status={"done"} />,
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
