import { Button, Col, DatePicker, Form, Row } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import { Project } from "@/pages/Project/type";
import { useEffect } from "react";
import { useEditProject } from "@/hooks/project/useEditProject";
import { useCreateProject } from "@/hooks/project/useCreateProject";
import { useUser } from "@/hooks/user/useUser";
import { UserType } from "@/hooks/user/type";
import moment from "moment";
import FormSelectWrapper from "../FormSelectWrapper";

interface ProjectFormProps {
  editProjectData?: Project;
  id?: number;
}

const ProjectForm = ({ editProjectData, id }: ProjectFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateProject();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditProject();
  const { data: users, isPending: isPendingUser } = useUser();

  useEffect(() => {
    if (id && editProjectData) {
      const { startingDate, endingDate, users, ...rest } = editProjectData;
      const selectedUsers = users.map((user) => user.id);

      form.setFieldsValue({
        ...rest,
        startingDate: moment(startingDate),
        endingDate: moment(endingDate),
        users: selectedUsers || [],
      });
    } else {
      form.resetFields();
    }
  }, [editProjectData, form, id]);

  const onFinish = (values: any) => {
    id ? mutateEdit({ id, payload: values }) : mutate(values);
  };

  return (
    <Form form={form} layout="vertical" initialValues={{}} onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={6}>
          <FormInputWrapper
            id="Project Name"
            label="Project Name"
            name="name"
            rules={[
              { required: true, message: "Please input the project name!" },
            ]}
          />

          <FormInputWrapper
            id="Description"
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          />
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
        <Col span={6}>
          <FormSelectWrapper
            id="Fiscal Year"
            label="Fiscal Year"
            name="fiscalYear"
            options={[...Array(5).keys()].map((_, index) => {
              const year = new Date().getFullYear() + index;
              return {
                value: year,
                label: year.toString(),
              };
            })}
            rules={[
              { required: true, message: "Please select the fiscal year!" },
            ]}
          />
          <Form.Item
            label="Starting Date"
            name="startingDate"
            rules={[
              { required: true, message: "Please select the starting date!" },
            ]}
          >
            <DatePicker className="py-3 w-full" format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            label="Ending Date"
            name="endingDate"
            rules={[
              { required: true, message: "Please select the ending date!" },
            ]}
          >
            <DatePicker className="py-3 w-full" format="YYYY-MM-DD" />
          </Form.Item>
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
      </Row>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isPending || isPendingEdit}
          loading={isPending || isPendingEdit}
        >
          {id? "Update Project" : "Add Project"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectForm;
