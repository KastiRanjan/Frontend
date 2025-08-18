import { useEffect, useState } from "react";
import { usePermission } from "@/hooks/permission/usePermission";
import { useRolePermissionById } from "@/hooks/permission/useRolePermissionById";
import { useUpdateRolePermissions } from "@/hooks/role/useUpdateRolePermissions";
import { Spin, Tree, message } from "antd";

const PAGE_SIZE = 100; // adjust as needed

const RolePermissionForm = ({ id }) => {
  const { data: allPermissions, isLoading: loadingPermissions } = usePermission({ page: 1, limit: PAGE_SIZE });
  const { data: rolePermissions, isLoading: loadingRolePerms } = useRolePermissionById({ id });
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
  const updateRolePermissions = useUpdateRolePermissions();

  useEffect(() => {
    if (rolePermissions) setCheckedKeys(rolePermissions);
  }, [rolePermissions]);

  if (loadingPermissions || loadingRolePerms) return <Spin />;

  // Transform permissions for AntD Tree
  const treeData = (allPermissions?.results || []).reduce((acc, perm) => {
    const group = acc.find(g => g.title === perm.resource);
    const node = { title: perm.description, key: perm.id };
    if (group) {
      group.children.push(node);
    } else {
      acc.push({ title: perm.resource, key: perm.resource, children: [node] });
    }
    return acc;
  }, []);

  const handleCheck = (checked) => setCheckedKeys(checked);

  const handleSubmit = async () => {
    try {
      await updateRolePermissions.mutateAsync({ id, permissions: checkedKeys });
      message.success("Permissions updated!");
    } catch {
      message.error("Failed to update permissions.");
    }
  };

  return (
    <div>
      <Tree
        checkable
        treeData={treeData}
        checkedKeys={checkedKeys}
        onCheck={handleCheck}
      />
      <button type="button" onClick={handleSubmit} style={{ marginTop: 16 }}>
        Save Permissions
      </button>
    </div>
  );
};

export default RolePermissionForm;