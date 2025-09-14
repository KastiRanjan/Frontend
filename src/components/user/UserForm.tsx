import { useCreateUser } from "@/hooks/user/userCreateuser";
import { useUpdateUser } from "@/hooks/user/useUpdateUser";
import { Button, Form, message } from "antd";
import UserAuthDetail from "./UserAuthDetail";
import { UserType } from "@/types/user";
import { useEffect } from "react";

const UserForm = ({ initialValues, handleCancel }: { initialValues?: UserType, handleCancel?: any }) => {
  const [form] = Form.useForm();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isEditing = !!initialValues?.id;
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isEditing && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        username: initialValues.username,
        email: initialValues.email,
        status: initialValues.status,
        roleId: initialValues.role?.id,
      });
    } else {
      // Reset form when not editing
      form.resetFields();
    }
  }, [initialValues, form, isEditing]);

  const handleFinish = (values: any) => {
    const mutation = isEditing ? updateUser : createUser;
    const successMessage = isEditing ? "User updated successfully" : "User created successfully";

    let payload = values;
    if (isEditing) {
      // For updates, send name, status, and role (backend now supports role updates)
      payload = {
        name: values.name,
        status: values.status,
        role: String(values.roleId), // Ensure role is string for update
      };
    } else {
      // For creation, send roleId as string as expected by backend
      payload = {
        ...values,
        roleId: String(values.roleId), // Ensure roleId is string
      };
    }

    mutation(
      isEditing ? { id: initialValues.id, payload } : payload,
      {
        onSuccess: () => {
          message.success(successMessage);
          handleCancel(); // Close modal and refresh parent component
        },
        onError: (error: any) => {
          console.error("User mutation error:", error);
          
          if (error.response?.data?.message) {
            const errorMsg = error.response.data.message;
            if (errorMsg.includes("should not exist")) {
              message.error("Some fields cannot be updated. Please check the field requirements.");
            } else {
              message.error(errorMsg);
            }
          } else {
            const errorMessage = `Failed to ${isEditing ? "update" : "create"} user. Please try again.`;
            message.error(errorMessage);
          }
        },
      }
    );
  };
  
  // Pass form to UserAuthDetail for access to form methods
  const userDetailProps = {
    ...initialValues,
    form
  };
  
  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <UserAuthDetail initialValues={userDetailProps} />
        <Button type="primary" htmlType="submit" loading={isPending} disabled={isPending}>
          {isEditing ? "Update" : "Save"}
        </Button>
      </Form>
    </div>
  );
};

export default UserForm;
