import { useCreateProject } from "@/hooks/project/useCreateProject";
import { useEditProject } from "@/hooks/project/useEditProject";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { Project } from "@/pages/Project/type";
import { Button, Col, DatePicker, Divider, Form, Row, Select } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import moment from "moment";

interface ProjectFormProps {
  editProjectData?: Project;
  handleCancel: () => void;
}

const ProjectForm = ({ editProjectData, handleCancel }: ProjectFormProps) => {
  console.log(editProjectData);
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateProject();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditProject();
  const { data: users, isPending: isPendingUser } = useUser();

  const onFinish = (values: any) => {
    editProjectData?.id ? mutateEdit({ id: editProjectData.id, payload: values }, { onSuccess: () => handleCancel() }
    ) : mutate(values, { onSuccess: () => handleCancel() });
  };

  return (
    <Form form={form} layout="vertical" initialValues={
      {
        ...editProjectData,
        startingDate: moment(editProjectData?.startingDate),
        endingDate: moment(editProjectData?.endingDate),
        users: editProjectData?.users?.map((user: any) => user.id),
        projectLead: editProjectData?.projectLead?.id
      }} onFinish={onFinish}>
      <Row gutter={36}>
        <Divider />
        <Col span={24}>
          <FormInputWrapper
            id="Project Name"
            label="Project Name"
            name="name"
            rules={[
              { required: true, message: "Please input the project name!" },
            ]}
          />

        </Col>
        <Col span={12}>
          <Form.Item
            label="Fiscal Year"
            name="fiscalYear"
            rules={[
              { required: true, message: "Please select the fiscal year!" },
            ]}
          >
            <Select
              className="h-[48px] w-full"
              options={[...Array(5).keys()].map((_, index) => {
                const year = new Date().getFullYear() + index;
                return {
                  value: year,
                  label: year.toString(),
                };
              })}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <FormSelectWrapper
            id="projectLead"
            name="projectLead"
            label="Project Lead"
            placeholder="Select users"
            options={
              isPendingUser
                ? []
                : users?.results?.map((user: UserType) => ({
                  value: user.id,
                  label: user.name,
                }))
            }
          />
        </Col>
        <Col span={12}>
          <FormSelectWrapper
            id="users"
            name="users"
            label="Assign Users"
            placeholder="Select users"
            options={
              isPendingUser
                ? []
                : users?.results?.map((user: UserType) => ({
                  value: user.id,
                  label: user.name,
                }))
            }
            mode="multiple"
          />

        </Col>

        <Col span={12}>
          <FormSelectWrapper
            id="Nature of Work"
            label="Nature of Work"
            name="natureOfWork"
            options={[
              { value: "external_audit", label: "External Audit" },
              { value: "tax_compliance", label: "Tax Compliance" },
              { value: "accounts_review", label: "Accounts Review" },
              { value: "legal_services", label: "Legal Services" },
              { value: "financial_projection", label: "Financial Projection" },
              { value: "valuation", label: "Valuation" },
              { value: "internal_audit", label: "Internal Audit" },
              { value: "others", label: "Others" },
            ]}
            rules={[
              {
                required: true,
                message: "Please select the nature of work!",
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <FormInputWrapper
            id="Description"
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          />
        </Col>
        <Col span={12}>
          <Form.Item
            label="Starting Date"
            name="startingDate"
            rules={[
              { required: true, message: "Please select the starting date!" },
            ]}
          >
            <DatePicker className="py-3 w-full" format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Ending Date"
            name="endingDate"
            rules={[
              { required: true, message: "Please select the ending date!" },
            ]}
          >
            <DatePicker className="py-3 w-full" format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <FormSelectWrapper
            id="Status"
            label="Status"
            name="status"
            options={[
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "archived", label: "Archived" },
              { value: "signed_off", label: "Signed Off" },
            ]}
            rules={[{ required: true, message: "Please select the status!" }]}
          />
        </Col>


      </Row>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isPending || isPendingEdit}
          loading={isPending || isPendingEdit}
        >
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectForm;
