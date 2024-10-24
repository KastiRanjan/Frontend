import { Button, DatePicker, Form } from "antd"
import FormInputWrapper from "../FormInputWrapper"
import FormSelectWrapper from "../FormSelectWrapper"
import { useCreateTask } from "@/hooks/task/useCreateTask";
import { useParams } from "react-router-dom";




const TaskForm = ({users, tasks}:any) => {
    const { mutate, isPending } = useCreateTask();

    console.log(tasks)
    const { id } = useParams();
    const onFinish = (values: any) => {
    values.projectId= id
    mutate(values);
      };
    return (
      <Form layout="vertical" onFinish={onFinish}>
      <FormInputWrapper
        id="name"
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please input the task name!" }]}
        />

        <FormInputWrapper
        id="description"
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please input the task description!" }]}
        />  

        <FormSelectWrapper
        id = "parentTaskId"
        name = "parentTaskId"
        label = "Parent"
        options = {tasks?.map((task)=>({
            value: task.id, 
            label: task.name
        }))|| []}
        />

        <Form.Item
        name="dueDate"
        label="Due Date"
        rules={[{ required: true, message: "Please input the due date!" }]}
        >  
        <DatePicker showTime format="YYYY-MM-DD" /> 
        </Form.Item>


        <FormSelectWrapper
        id = "assineeId"
        name = "assineeId"
        label = "Assignee"
        mode="multiple"
        options = {users?.map((user)=>({
            value: user.id, 
            label: user.name
        }))|| []}
        />

    <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isPending}
          loading={isPending}
        >
          Save
        </Button>
      </Form.Item>
    </Form>
    )
}

export default TaskForm