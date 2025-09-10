import { BillingType } from "@/types/billing";
import { Card, Descriptions, Tag } from "antd";

interface BillingDetailProps {
  billing: BillingType;
}

const BillingDetail = ({ billing }: BillingDetailProps) => {
  return (
    <Card title={billing.name} className="mb-4">
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Registration Number">
          {billing.registration_number || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="PAN Number">
          {billing.pan_number || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="VAT Number">
          {billing.vat_number || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag 
            color={
              billing.status === "active" 
                ? "green" 
                : billing.status === "suspended" 
                ? "orange" 
                : "red"
            }
          >
            {billing.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Country" span={1}>
          {billing.country || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="State/Province" span={1}>
          {billing.state || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="District" span={1}>
          {billing.district || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Local Jurisdiction" span={1}>
          {billing.localJurisdiction || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Local Address" span={2}>
          {billing.address || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {billing.email || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {billing.phone || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Bank Account Name">
          {billing.bank_account_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Bank Name">
          {billing.bank_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Bank Account Number" span={2}>
          {billing.bank_account_number || "N/A"}
        </Descriptions.Item>
        {billing.logo_url && (
          <Descriptions.Item label="Logo" span={2}>
            <img 
              src={billing.logo_url} 
              alt={`${billing.name} logo`} 
              style={{ maxWidth: "200px", maxHeight: "100px" }} 
            />
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Created At">
          {new Date(billing.createdAt || "").toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {new Date(billing.updatedAt || "").toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default BillingDetail;
