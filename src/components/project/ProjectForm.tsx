import { useCreateProject } from "@/hooks/project/useCreateProject";
import { useEditProject } from "@/hooks/project/useEditProject";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { Button, Col, DatePicker, Divider, Form, Row, Select } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import moment from "moment";
import { ProjectType } from "@/types/project";
import TextArea from "antd/es/input/TextArea";
import { useClient } from "@/hooks/client/useClient";

interface ProjectFormProps {
  editProjectData?: ProjectType;
  handleCancel: () => void;
}

const ProjectForm = ({ editProjectData, handleCancel }: ProjectFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateProject();
  const { data: clients } = useClient();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditProject();
  const { data: users, isPending: isPendingUser } = useUser({
    status: "active",
    limit: 1000,
    page: 1,
    keywords: "",
  });

  // Get the current project lead and manager value from the form
  const projectLead = Form.useWatch("projectLead", form);
  const projectManager = Form.useWatch("projectManager", form);

  const onFinish = (values: any) => {
    // Ensure projectLead and projectManager are included in the users array
    const userIds = [values.projectLead, values.projectManager].filter(Boolean);
    const updatedValues = {
      ...values,
      users: values.users
        ? [...new Set([...values.users, ...userIds])]
        : userIds,
    };
    if (editProjectData?.id) {
      mutateEdit(
        { id: editProjectData.id, payload: updatedValues },
        { onSuccess: () => handleCancel() }
      );
    } else {
      mutate(updatedValues, { onSuccess: () => handleCancel() });
    }
  };

  // Filter out the project lead and manager from available users for the "Invite Users" field
  const filteredUsers = isPendingUser
    ? []
    : users?.results
        ?.filter((user: UserType) => user.id !== projectLead && user.id !== projectManager)
        ?.map((user: UserType) => ({
          value: user.id,
          label: user.name,
        })) || [];

  // Filter users with role 'manager' for Project Manager field
  const managerOptions = isPendingUser
    ? []
    : users?.results
        ?.filter((user: UserType) => user.role?.name?.toLowerCase() === "projectmanager")
        ?.map((user: UserType) => ({
          value: user.id,
          label: user.name,
        })) || [];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...editProjectData,
        startingDate: moment(editProjectData?.startingDate),
        endingDate: moment(editProjectData?.endingDate),
        users: editProjectData?.users?.map((user: any) => user.id),
        projectLead: editProjectData?.projectLead?.id,
        projectManager: editProjectData?.projectManager?.id,
        customer: editProjectData?.customer?.id,
      }}
      onFinish={onFinish}
    >
      <Row gutter={18}>
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
            rules={[
              { required: true, message: "Please select a project lead!" },
            ]}
          />
        </Col>
        <Col span={12}>
          <FormSelectWrapper
            id="projectManager"
            name="projectManager"
            label="Project Manager"
            placeholder="Select project manager"
            options={managerOptions}
            rules={[
              { required: true, message: "Please select a project manager!" },
            ]}
          />
        </Col>
        <Col span={12}>
          <FormSelectWrapper
            id="users"
            name="users"
            label="Invite Users"
            placeholder="Select users"
            options={filteredUsers}
            mode="multiple"
          />
        </Col>

        {/* Rest of the form fields remain unchanged */}
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
        <Col span={12}>
          <FormSelectWrapper
            id="Client"
            label="Client"
            name="customer"
            options={clients?.map((client: any) => ({
              value: client.id,
              label: client.name,
            }))}
            rules={[{ required: true, message: "Please select the client!" }]}
          />
        </Col>

        <Col span={24}>
          <Form.Item
            id="Description"
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
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