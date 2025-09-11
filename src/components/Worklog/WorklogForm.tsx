import { useProjectById } from "@/hooks/project/useProjectById";
import {  useTasks } from "@/hooks/task/useTask";
import { useCreateWorklog } from "@/hooks/worklog/useCreateWorklog";
import { TaskTemplateType } from "@/types/taskTemplate";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Row, Select, message, Card, Modal } from "antd";
import { useParams } from "react-router-dom";
import moment from "moment";

const WorklogForm = () => {
  const { id } = useParams();
  const { data: task } = useTasks({ status: "active" });
  const { data: project } = useProjectById({ id });
  const { mutate: createWorklog } = useCreateWorklog();

  // Function to check for overlapping time entries
  const checkForOverlappingEntries = (entries: any[]): { hasOverlap: boolean, overlapDetails: string[] } => {
    const overlapDetails: string[] = [];
    
    // Group entries by date
    const entriesByDate = entries.reduce((acc: { [key: string]: any[] }, entry: any) => {
      if (!entry.date || !entry.startTime || !entry.endTime) return acc;
      
      const dateKey = moment(entry.date).format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push({
        ...entry,
        dateKey,
      });
      
      return acc;
    }, {});
    
    // Check for overlaps within each date group
    Object.keys(entriesByDate).forEach(dateKey => {
      const dateEntries = entriesByDate[dateKey];
      
      if (dateEntries.length > 1) {
        // Compare each entry with all others for the same date
        for (let i = 0; i < dateEntries.length; i++) {
          const entry1 = dateEntries[i];
          const start1 = moment(entry1.startTime);
          const end1 = moment(entry1.endTime);
          
          for (let j = i + 1; j < dateEntries.length; j++) {
            const entry2 = dateEntries[j];
            const start2 = moment(entry2.startTime);
            const end2 = moment(entry2.endTime);
            
            // Check if the time periods overlap
            if (
              (start1.isBefore(end2) && end1.isAfter(start2)) || 
              (start2.isBefore(end1) && end2.isAfter(start1)) ||
              (start1.isSame(start2) || end1.isSame(end2))
            ) {
              overlapDetails.push(
                `Overlap on ${dateKey}: ${start1.format('HH:mm')} - ${end1.format('HH:mm')} overlaps with ${start2.format('HH:mm')} - ${end2.format('HH:mm')}`
              );
            }
          }
        }
      }
    });
    
    return {
      hasOverlap: overlapDetails.length > 0,
      overlapDetails
    };
  };

  const handleFinish = (values: any) => {
    console.log(values.timeEntries);
    
    // Check for overlapping time entries
    const { hasOverlap, overlapDetails } = checkForOverlappingEntries(values.timeEntries);
    
    if (hasOverlap) {
      // Display modal warning with details of overlaps
      Modal.confirm({
        title: 'Warning: Overlapping Worklogs Detected',
        content: (
          <div>
            <p>The following worklogs overlap in time:</p>
            <ul>
              {overlapDetails.map((detail, index) => (
                <li key={index} style={{ color: 'red' }}>{detail}</li>
              ))}
            </ul>
            <p>Overlapping worklogs may cause time tracking issues. Do you want to proceed anyway?</p>
          </div>
        ),
        okText: 'Proceed Anyway',
        okButtonProps: { danger: true },
        cancelText: 'Go Back and Fix',
        onOk() {
          // User chose to proceed despite overlaps
          createWorklog(values.timeEntries, {
            onSuccess: () => {
              message.success("Worklog created successfully");
            },
            onError: (error: any) => {
              const errorMessage =
                error?.response?.data?.message ||
                "Failed to create worklog";
              message.error(errorMessage);
            },
          });
        },
      });
    } else {
      // No overlaps, proceed normally
      createWorklog(values.timeEntries, {
        onSuccess: () => {
          message.success("Worklog created successfully");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            "Failed to create worklog";
          message.error(errorMessage);
        },
      });
    }
  };

  return (
    <>
      <Form 
        onFinish={handleFinish} 
        layout="vertical"
        initialValues={{
          timeEntries: [{}], // Start with one empty entry
        }}
      >
        {/* Fixed header for the form */}
        <Row className="bg-gray-100 p-2 mb-2 font-semibold rounded">
          <Col span={4}>Task</Col>
          <Col span={4}>Approver</Col>
          <Col span={4}>Date</Col>
          <Col span={3}>Start Time</Col>
          <Col span={3}>End Time</Col>
          <Col span={5}>Description</Col>
          <Col span={1}></Col>
        </Row>

        <Form.List name="timeEntries">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Card 
                  key={field.key} 
                  style={{ 
                    marginBottom: "12px", 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)", 
                    borderRadius: "6px" 
                  }}
                  bodyStyle={{ padding: "12px" }}
                >
                  <Row gutter={12} align="middle">
                    <Col span={4}>
                      <Form.Item
                        name={[field.name, "taskId"]}
                        rules={[
                          {
                            required: true,
                            message: "Required!",
                          },
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <Select
                          showSearch
                          placeholder="Select task"
                          optionFilterProp="label"
                          filterOption={(input, option: any) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={task?.map((task: TaskTemplateType) => ({
                            label: task.name,
                            value: task.id,
                          }))}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={4}>
                      <Form.Item
                        name={[field.name, "userId"]}
                        rules={[
                          {
                            required: true,
                            message: "Required!",
                          },
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <Select
                          showSearch
                          placeholder="Select approver"
                          optionFilterProp="label"
                          filterOption={(input, option: any) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={project?.users?.map((user: any) => ({
                            label: user.name,
                            value: user.id,
                          }))}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    {/* Date field - shown for all entries */}
                    <Col span={4}>
                      <Form.Item
                        name={[field.name, "date"]}
                        rules={[
                          {
                            required: true,
                            message: "Required!",
                          },
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <DatePicker 
                          format="YYYY-MM-DD" 
                          placeholder="Select date"
                          style={{ width: '100%' }}
                          defaultValue={moment()}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={3}>
                      <Form.Item
                        name={[field.name, "startTime"]}
                        rules={[
                          {
                            required: true,
                            message: "Required!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const endTime = getFieldValue([
                                "timeEntries",
                                field.name,
                                "endTime",
                              ]);
                              if (
                                !value ||
                                !endTime ||
                                moment(value).isBefore(moment(endTime))
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Start time must be before end time!")
                              );
                            },
                          }),
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <DatePicker 
                          showTime 
                          format="HH:mm" 
                          placeholder="Start time"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={3}>
                      <Form.Item
                        name={[field.name, "endTime"]}
                        rules={[
                          {
                            required: true,
                            message: "Required!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const startTime = getFieldValue([
                                "timeEntries",
                                field.name,
                                "startTime",
                              ]);
                              if (
                                !value ||
                                !startTime ||
                                moment(value).isAfter(moment(startTime))
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("End time must be after start time!")
                              );
                            },
                          }),
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <DatePicker 
                          showTime 
                          format="HH:mm" 
                          placeholder="End time"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={5}>
                      <Form.Item
                        name={[field.name, "description"]}
                        rules={[
                          {
                            required: true,
                            message: "Required!",
                          },
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <Input.TextArea 
                          placeholder="Enter worklog description" 
                          rows={2}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={1} className="flex items-center justify-center">
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircleOutlined />} 
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
              
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  block
                  style={{ marginBottom: 16 }}
                >
                  Add New Worklog Entry
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div className="flex justify-end">
          <Button type="primary" htmlType="submit" size="large">
            Submit All Entries
          </Button>
        </div>
      </Form>
    </>
  );
};

export default WorklogForm;
