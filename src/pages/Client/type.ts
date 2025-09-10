export interface TaskGroup {
  id: number;
  name: string;
  description: string;
  tasktemplate: TaskTemplate[];
}

export interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  taskgroup: TaskGroup;
}

export interface Client {
  id: string;
  name: string;
  shortName?: string;
  panNo: string;
  registeredDate: string;
  status: 'active' | 'suspended' | 'archive';
  country: string;
  state: string;
  district: string;
  localJurisdiction: string;
  wardNo?: string;
  locality: string;
  legalStatus: string;
  businessSizeEnum?: string;
  businessSize?: {
    id: string;
    name: string;
  };
  industryNatureEnum?: string;
  industryNature?: {
    id: string;
    name: string;
  };
  telephoneNo?: string;
  mobileNo?: string;
  email?: string;
  website?: string;
  webPortal?: string;
  loginUser?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalCredential {
  id: string;
  portalName: string;
  loginUser: string;
  password: string;
  description?: string;
  status: 'active' | 'inactive';
  customer: Client;
  createdAt: string;
  updatedAt: string;
}
