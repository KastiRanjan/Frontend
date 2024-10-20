import { useState } from "react";
import { PermissionForm } from "@/components/Permission/PermissionForm";
import PerimssionTable from "@/components/Permission/PermissionTable";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import message from "./message";

const Perimssion = () => {
  const [createPermission, setCreatePermission] = useState(false);
  return (
    <>
      <Button
        size="large"
        type="primary"
        onClick={() => setCreatePermission(true)}
        className="mr-2"
      >
        <PlusOutlined /> <FormattedMessage {...message.addLabel} />
      </Button>

      <PerimssionTable />

      <PermissionForm
        visible={createPermission}
        onCancel={() => setCreatePermission(false)}
      />
    </>
  );
};

export default Perimssion;
