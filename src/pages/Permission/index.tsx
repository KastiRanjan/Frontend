import { useState } from "react";
import { PermissionForm } from "@/components/Permission/PermissionForm";
import PerimssionTable from "@/components/Permission/PermissionTable";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import message from "./message";
import { PermissionType } from "./types";

const Perimssion = () => {
  const [showPermissionForm, setShowPermissionForm] = useState<boolean>(false);
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [editPermissionData, setEditPermissionData] =
    useState<PermissionType>();
  const showEditModal = (record: PermissionType) => {
    console.log("Editing record:", record);
    setShowPermissionForm(true);
    setEditPermissionData(record);
    setIsFormEdit(true);
  };
  const handleClosePermissionForm = () => {
    setShowPermissionForm(false);
    setIsFormEdit(false);
  };
  return (
    <>
      <Button
        size="large"
        type="primary"
        onClick={() => setShowPermissionForm(true)}
        className="mr-2"
      >
        <PlusOutlined /> <FormattedMessage {...message.addLabel} />
      </Button>

      <PerimssionTable showEditModal={showEditModal} />

      <PermissionForm
        visible={showPermissionForm}
        onCancel={handleClosePermissionForm}
        editPermissionData={editPermissionData}
        isformEdit={isFormEdit}
      />
    </>
  );
};

export default Perimssion;
