import axios from "axios";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export interface Department {
  id: string;
  name: string;
  shortName: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentDto {
  name: string;
  shortName: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  shortName?: string;
}

export const fetchDepartments = async (): Promise<Department[]> => {
  const response = await axios.get(`${backendURI}/department`);
  return response.data;
};

export const getDepartment = async (id: string): Promise<Department> => {
  const response = await axios.get(`${backendURI}/department/${id}`);
  return response.data;
};

export const createDepartment = async (data: CreateDepartmentDto): Promise<Department> => {
  const response = await axios.post(`${backendURI}/department`, data);
  return response.data;
};

export const updateDepartment = async (id: string, data: UpdateDepartmentDto): Promise<Department> => {
  const response = await axios.patch(`${backendURI}/department/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await axios.delete(`${backendURI}/department/${id}`);
};  