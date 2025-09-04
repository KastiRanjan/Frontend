
import axios from "axios";
import { CreateWorkhourDto, UpdateWorkhourDto } from "../types/workhour";

axios.defaults.withCredentials = true;
const backendURI = import.meta.env.VITE_BACKEND_URI;

export const fetchWorkhours = async () => {
	const response = await axios.get(`${backendURI}/workhour`);
	return response.data;
};

export const createWorkhour = async (payload: CreateWorkhourDto) => {
	const response = await axios.post(`${backendURI}/workhour`, payload);
	return response.data;
};

export const updateWorkhour = async (id: string, payload: UpdateWorkhourDto) => {
	const response = await axios.patch(`${backendURI}/workhour/${id}`, payload);
	return response.data;
};

export const deleteWorkhour = async (id: string) => {
	const response = await axios.delete(`${backendURI}/workhour/${id}`);
	return response.data;
};

export const resolveWorkhour = async (userId: string) => {
	const response = await axios.get(`${backendURI}/workhour/resolve/${userId}`);
	return response.data;
};
