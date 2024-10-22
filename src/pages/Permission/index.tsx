import PageTitle from "@/components/PageTitle";
import { PermissionForm } from "@/components/Permission/PermissionForm";
import PerimssionTable from "@/components/Permission/PermissionTable";
import { Button } from "antd";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import message from "./message";

const Perimssion = () => {
  const [createPermission, setCreatePermission] = useState(false);
  return (
    <>
      <PageTitle title="Permissions" />
      {/* <Button
        size="large"
        type="primary"
        onClick={() => setCreatePermission(true)}
        className="mr-2"
      >
        <FormattedMessage {...message.addLabel} />
      </Button> */}

      <PerimssionTable />

      <PermissionForm
        visible={createPermission}
        onCancel={() => setCreatePermission(false)}
      />
    </>
  );
};

export default Perimssion;
