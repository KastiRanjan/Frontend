export enum ReportAccessStatus {
  PENDING = 'pending',
  ACCESSIBLE = 'accessible',
  REVOKED = 'revoked'
}

export interface ClientReportType {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  originalFileName: string;
  fileType?: string;
  fileSize?: number;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    shortName?: string;
  };
  projectId?: string;
  project?: {
    id: string;
    name: string;
  };
  documentTypeId?: string;
  documentType?: {
    id: string;
    name: string;
  };
  accessStatus: ReportAccessStatus;
  isVisible: boolean;
  accessGrantedAt?: string;
  accessGrantedBy?: string;
  accessNotes?: string;
  fiscalYear?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ClientReportWithDownloadInfo extends ClientReportType {
  canDownload: boolean;
  downloadMessage?: string;
}

export interface CreateClientReportPayload {
  title: string;
  description?: string;
  customerId: string;
  projectId?: string;
  documentTypeId?: string;
  fiscalYear?: number;
  isVisible?: boolean;
  file: File;
}

export interface UpdateClientReportPayload {
  title?: string;
  description?: string;
  accessStatus?: ReportAccessStatus;
  isVisible?: boolean;
  accessNotes?: string;
  projectId?: string;
  documentTypeId?: string;
  fiscalYear?: number;
}

export interface UpdateReportAccessPayload {
  accessStatus: ReportAccessStatus;
  accessNotes?: string;
}

export interface ClientReportFilterPayload {
  customerId?: string;
  projectId?: string;
  documentTypeId?: string;
  accessStatus?: ReportAccessStatus;
  fiscalYear?: number;
}

export interface ClientReportStats {
  total: number;
  accessible: number;
  pending: number;
}
