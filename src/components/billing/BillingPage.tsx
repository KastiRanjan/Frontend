import { useBilling } from "@/hooks/billing/useBilling";
import { BillingType } from "@/types/billing";
import { Button, Card, Modal, Spin, Tabs } from "antd";
import { useState } from "react";
import BillingForm from "./BillingForm";
import BillingTable from "./BillingTable";

const BillingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<BillingType | undefined>(
    undefined
  );
  const { data: activeBillings, isLoading: activeLoading, refetch: refetchActive } = useBilling("active");
  const { data: suspendedBillings, isLoading: suspendedLoading, refetch: refetchSuspended } = useBilling("suspended");
  const { data: archivedBillings, isLoading: archivedLoading, refetch: refetchArchived } = useBilling("archived");

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedBilling(undefined);
  };

  const showModal = (billing?: BillingType) => {
    setSelectedBilling(billing);
    setIsModalOpen(true);
  };

  const refreshAll = () => {
    refetchActive();
    refetchSuspended();
    refetchArchived();
  };

  const items = [
    {
      key: "1",
      label: "Active",
      children: activeLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <BillingTable 
          data={activeBillings || []} 
          showModal={showModal}
          onRefresh={refreshAll}
        />
      ),
    },
    {
      key: "2",
      label: "Suspended",
      children: suspendedLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <BillingTable 
          data={suspendedBillings || []} 
          showModal={showModal}
          onRefresh={refreshAll}
        />
      ),
    },
    {
      key: "3",
      label: "Archived",
      children: archivedLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <BillingTable 
          data={archivedBillings || []} 
          showModal={showModal}
          onRefresh={refreshAll}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Button type="primary" onClick={() => showModal()}>
          Add Billing Entity
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>

      {isModalOpen && (
        <Modal
          title={selectedBilling ? "Edit Billing Entity" : "Add Billing Entity"}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <BillingForm
            editBillingData={selectedBilling}
            handleCancel={handleCancel}
          />
        </Modal>
      )}
    </div>
  );
};

export default BillingPage;
