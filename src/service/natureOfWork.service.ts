import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface NatureOfWorkGroup {
  id: string;
  name: string;
  description?: string;
  rank?: number;
  natureOfWorks?: NatureOfWork[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NatureOfWork {
  id: string;
  name: string;
  shortName: string;
  groupId?: string | null;
  group?: NatureOfWorkGroup | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AffectedProject {
  id: string;
  name: string;
  status: "active" | "suspended" | "archived" | "completed" | "signed_off";
  natureOfWork?: NatureOfWork;
  natureOfWorkGroup?: NatureOfWorkGroup | null;
}

export enum NatureOfWorkMigrationStrategy {
  TRANSFER = "transfer",
  FALLBACK = "fallback",
  DUPLICATE = "duplicate",
}

export interface MigrateNatureOfWorkPayload {
  sourceNatureOfWorkId: string;
  strategy: NatureOfWorkMigrationStrategy;
  targetNatureOfWorkId?: string;
  newName?: string;
  newShortName?: string;
  newGroupId?: string;
  projectIdsToMigrate?: string[];
}

const handleApiError = (error: any) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) {
    throw new Error(message.join(", "));
  }
  throw new Error(message || error?.message || "Request failed");
};

export const fetchNatureOfWorks = async (includeInactive = false) => {
  const response = await axios.get(`${backendURI}/nature-of-work`, {
    params: { includeInactive },
  });
  return response.data;
};

export const fetchNatureOfWorkById = async (id: string) => {
  const response = await axios.get(`${backendURI}/nature-of-work/${id}`);
  return response.data;
};

export const createNatureOfWork = async (payload: Pick<NatureOfWork, "name" | "shortName" | "groupId" | "isActive">) => {
  try {
    const response = await axios.post(`${backendURI}/nature-of-work`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateNatureOfWork = async (
  id: string,
  payload: Partial<Pick<NatureOfWork, "name" | "shortName" | "groupId" | "isActive">>,
) => {
  try {
    const response = await axios.patch(`${backendURI}/nature-of-work/${id}`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteNatureOfWork = async (id: string) => {
  try {
    const response = await axios.delete(`${backendURI}/nature-of-work/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchNatureOfWorkGroups = async () => {
  const response = await axios.get(`${backendURI}/nature-of-work/group/all`);
  return response.data;
};

export const createNatureOfWorkGroup = async (payload: Pick<NatureOfWorkGroup, "name" | "description" | "rank">) => {
  try {
    const response = await axios.post(`${backendURI}/nature-of-work/group`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateNatureOfWorkGroup = async (
  id: string,
  payload: Partial<Pick<NatureOfWorkGroup, "name" | "description" | "rank">>,
) => {
  try {
    const response = await axios.patch(`${backendURI}/nature-of-work/group/${id}`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteNatureOfWorkGroup = async (id: string) => {
  try {
    const response = await axios.delete(`${backendURI}/nature-of-work/group/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAffectedProjects = async (natureOfWorkId: string) => {
  const response = await axios.get(`${backendURI}/nature-of-work/${natureOfWorkId}/affected-projects`);
  return response.data as AffectedProject[];
};

export const fetchActiveAffectedProjects = async (natureOfWorkId: string) => {
  const response = await axios.get(`${backendURI}/nature-of-work/${natureOfWorkId}/active-affected-projects`);
  return response.data as AffectedProject[];
};

export const migrateNatureOfWork = async (payload: MigrateNatureOfWorkPayload) => {
  try {
    const response = await axios.post(`${backendURI}/nature-of-work/migrate`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
