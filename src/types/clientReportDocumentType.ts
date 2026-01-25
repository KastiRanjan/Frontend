export interface ClientReportDocumentTypeType {
  id: string;
  name: string;
  description?: string;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    shortName?: string;
  };
  sortOrder: number;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientReportDocumentTypeWithCount extends ClientReportDocumentTypeType {
  reportCount: number;
}

export interface CreateClientReportDocumentTypePayload {
  name: string;
  description?: string;
  customerId?: string;
  sortOrder?: number;
  isActive?: boolean;
  isGlobal?: boolean;
}

export interface UpdateClientReportDocumentTypePayload {
  name?: string;
  description?: string;
  customerId?: string;
  sortOrder?: number;
  isActive?: boolean;
  isGlobal?: boolean;
}

export interface ClientReportDocumentTypeFilterPayload {
  customerId?: string;
  isActive?: boolean;
  includeGlobal?: boolean;
}
