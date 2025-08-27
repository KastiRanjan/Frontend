
import { UserType } from "./user";

export interface WorkhourType {
	id: number;
	user?: UserType;
	roleId?: number;
	userId?: number;
	workHours: number;
	startTime: string; // e.g. "09:00"
	endTime: string;   // e.g. "17:00"
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateWorkhourDto {
	userId?: number;
	roleId?: number;
	workHours: number;
	startTime: string;
	endTime: string;
}

export interface UpdateWorkhourDto {
	workHours?: number;
	startTime?: string;
	endTime?: string;
}
