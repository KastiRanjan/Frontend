import { useModifiedPermission } from "@/hooks/permission/useMoodifiedPermission";
import { useRolePermissionById } from "@/hooks/permission/useRolePermissionById";
import { useCreateRole } from "@/hooks/role/useCreateRole";
import { useRoleById } from "@/hooks/role/useRoleById";
import { Role } from "@/pages/Role/type";
import { Button, Form, Tree } from "antd";
import { useEffect } from "react";

interface RoleFormProps {
  editRoleData?: Role;
  id?: number;
}

const RolePermissionForm = ({ editRoleData, id }: RoleFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateRole();
  const { data: role } = useRolePermissionById({ id });

  console.log(role);

  useEffect(() => {
    if (id && editRoleData) {
      form.setFieldsValue(editRoleData);
    } else {
      form.resetFields();
    }
  }, [editRoleData, form, id]);

  const { data: permission, isPending: isPendingPermission } =
    useModifiedPermission({
      page: 1,
      limit: 100,
    });

  const onFinish = (values: any) => {};
  const onCheck = (values: any) => {
    console.log(values);
  };

  return (
    <Form form={form} layout="vertical" initialValues={{}} onFinish={onFinish}>
      <Tree
        disabled={isPendingPermission}
        selectable={false}
        defaultExpandAll
        checkable
        onCheck={onCheck}
        checkedKeys={[]}
        treeData={permission || []}
      />
    </Form>
  );
};

export default RolePermissionForm;
