
import { UserType } from "./user";

export interface WorkhourType {
	id: string;
	user?: UserType;
	roleId?: string;
	userId?: string;
	workHours: number;
	startTime?: string; // e.g. "09:00"
	endTime?: string;   // e.g. "17:00"
	validFrom?: string; // Date string in ISO format
	validTo?: string;   // Date string in ISO format
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateWorkhourDto {
	userId?: string;
	roleId?: string;
	workHours: number;
	startTime?: string;
	endTime?: string;
	validFrom?: string;
	validTo?: string;
}

export interface UpdateWorkhourDto {
	workHours?: number;
	startTime?: string;
	endTime?: string;
	validFrom?: string;
	validTo?: string;
}
