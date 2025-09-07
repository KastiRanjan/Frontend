export interface BillingType {
  id: number;
  name: string;
  registration_number?: string;
  pan_number?: string;
  vat_number?: string;
  address?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  bank_account_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  status: "active" | "suspended" | "archived";
  createdAt?: string;
  updatedAt?: string;
}
