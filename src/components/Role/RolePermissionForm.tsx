import { useModifiedPermission } from "@/hooks/permission/useMoodifiedPermission";
import { useRolePermissionById } from "@/hooks/permission/useRolePermissionById";
import { Role } from "@/pages/Role/type";
import { Form, Tree, TreeProps } from "antd";
import { useEffect, useState } from "react";

interface RoleFormProps {
  editRoleData?: Role;
  id?: string;
}

const RolePermissionForm = ({ editRoleData, id }: RoleFormProps) => {
  const [form] = Form.useForm();
  const { data: rolePermissions } = useRolePermissionById({ id });
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(["b319e9ca-783b-4d90-bb1d-8140ec57209c"]);
  // const [, setSelectedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (id && editRoleData) {
      form.setFieldsValue(editRoleData);
    } else {
      form.resetFields();
    }
  }, [editRoleData, form, id]);

  useEffect(() => {
    if (rolePermissions) {
      setCheckedKeys(rolePermissions);
    }
  }, [rolePermissions]);

  const { data: permission, isPending: isPendingPermission } =
    useModifiedPermission({
      page: 1,
      limit: 100,
    });

  const onFinish = () => { };


  const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue as React.Key[]);
  };

  // const onSelect: TreeProps['onSelect'] = (selectedKeysValue, info) => {
  //   console.log('onSelect', info);
  //   setSelectedKeys(selectedKeysValue);
  // };

  return (
    <Form form={form} layout="vertical" initialValues={{}} onFinish={onFinish}>
      <Tree
        disabled={isPendingPermission}
        selectable={false}
        defaultExpandAll
        checkable
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        treeData={permission || []}
      />
    </Form>
  );
};

export default RolePermissionForm;
