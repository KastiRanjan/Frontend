import { Task } from "@/pages/Project/type"
import { Button, DatePicker, Form, Modal } from "antd"
import FormInputWrapper from "../FormInputWrapper"
import moment from "moment"
import { useCreateWorklog } from "@/hooks/worklog/useCreateWorklog"


const WorklogForm = ({openWorklogForm, setOpenWorklogForm, selectedTask}:{openWorklogForm:boolean, setOpenWorklogForm:(value:boolean) => void, selectedTask:Task}) => {
    
    const { mutate, isPending } = useCreateWorklog();

    const handleFinish = (record) => {
    const worklog = {...record, taskId: selectedTask.id,startTime: moment(record.startTime), endTime: moment(record.endTime)};
    mutate(worklog);

    }
    return (
        <>
        <Modal
            open={openWorklogForm}
            footer={null}
            closable={true}
            onCancel={() => setOpenWorklogForm(false)}
            centered
        >
            <Form onFinish={handleFinish}>
            <Form.Item>
                <h3>{selectedTask?.name}</h3>
            </Form.Item>
            <FormInputWrapper
                id="Description"
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please input the worklog message!" }]}
            />
            <Form.Item 
            id="startTime"
            name="startTime"
            label="Start Time">
            <DatePicker showTime />
            </Form.Item>
            <Form.Item 
            id="endTime"
            name="endTime"
            label="End Time">
            <DatePicker showTime />
            </Form.Item>
               

               <Button type="primary" htmlType="submit">Submit</Button>
                

            </Form>
        </Modal>

        
        
        </>

    )
}


export default WorklogForm