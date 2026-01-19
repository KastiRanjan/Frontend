export enum ClientUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}

export interface CustomerBasic {
  id: string;
  name: string;
  shortName?: string;
}

export interface ClientUserType {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  customers: CustomerBasic[];
  selectedCustomerId?: string;
  status: ClientUserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientLoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    customers: CustomerBasic[];
    status: string;
  };
  customers: CustomerBasic[];
  needsCustomerSelection: boolean;
}

export interface CreateClientUserPayload {
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
  customerIds: string[];
}

export interface UpdateClientUserPayload {
  name?: string;
  phoneNumber?: string;
  status?: ClientUserStatus;
  customerIds?: string[];
}

export interface ClientLoginPayload {
  email: string;
  password: string;
  customerId?: string;
}

export interface SelectCustomerPayload {
  customerId: string;
}

export interface ClientForgotPasswordPayload {
  email: string;
}

export interface ClientResetPasswordPayload {
  token: string;
  password: string;
}

export interface ClientChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
