import { Button, Col, DatePicker, Form, Modal, Row, Select } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import { Project } from "@/pages/Role/type";
import { useEffect } from "react";
import { useEditRole } from "@/hooks/role/useEditRole";
import { useCreateRole } from "@/hooks/role/useCreateRole";
import { useUser } from "@/hooks/user/useUser";
import { UserType } from "@/hooks/user/type";
import moment from "moment";
const { Option } = Select;

interface RoleFormProps {
  visible: boolean;
  onCancel: () => void;
  editRoleData?: Project;
  isformEdit?: boolean;
}

const RoleForm = ({
  visible,
  onCancel,
  editRoleData,
  isformEdit,
}: RoleFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateProject();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditRole();
  const { data: users, isPending: isPendingUser } = useUser();

  useEffect(() => {
    if (isformEdit && editRoleData) {
      // Format starting and ending dates
      const {
        startingDate,
        endingDate,
        users,
        ...rest
  } = editRoleData;
      const selectedUsers = users.map(user => user.id);

      form.setFieldsValue({
        ...rest,
        startingDate: moment(startingDate), // Convert to moment object
        endingDate: moment(endingDate), // Convert to moment object
        users: selectedUsers || [],
      });
    } else {
      form.resetFields();
    }
  }, [editRoleData, form, isformEdit]);

  const onFinish = (values: any) => {
    const { id } = editRoleData || {}; // Destructure id for cleaner code
    isformEdit ? mutateEdit({ id, payload: values }) : mutate(values);
    onCancel();
  };
  return (
    <Modal
      title="Add New Role"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{}}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col>
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
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select the status!" }]}
            >
              <Select placeholder="Select status">
                <Option value="active">Active</Option>
                <Option value="suspended">Suspended</Option>
                <Option value="archived">Archived</Option>
                <Option value="signed_off">Signed Off</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Nature of Work"
              name="natureOfWork"
              rules={[
                {
                  required: true,
                  message: "Please select the nature of work!",
                },
              ]}
            >
              <Select placeholder="Select nature of work">
                <Option value="external_audit">External Audit</Option>
                <Option value="tax_compliance">Tax Compliance</Option>
                <Option value="accounts_review">Accounts Review</Option>
                <Option value="legal_services">Legal Services</Option>
                <Option value="financial_projection">
                  Financial Projection
                </Option>
                <Option value="valuation">Valuation</Option>
                <Option value="internal_audit">Internal Audit</Option>
                <Option value="others">Others</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Fiscal Year"
              name="fiscalYear"
              rules={[
                { required: true, message: "Please select the fiscal year!" },
              ]}
            >
              <Select placeholder="Select fiscal year">
                {[...Array(5).keys()].map((_, index) => {
                  const year = new Date().getFullYear() + index;
                  return (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              label="Starting Date"
              name="startingDate"
              rules={[
                { required: true, message: "Please select the starting date!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              label="Ending Date"
              name="endingDate"
              rules={[
                { required: true, message: "Please select the ending date!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="Assign Users" name="users">
              <Select mode="multiple" placeholder="Select users">
                {isPendingUser
                  ? null
                  : users?.results?.map((user: UserType) => (
                      <Option key={user.id} value={user.id}>
                        {user.name}
                      </Option>
                    ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%" }}
            disabled={isPending || isPendingEdit}
            loading={isPending || isPendingEdit}
          >
            {isformEdit ? "Update Role" : "Add Role"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleForm;
