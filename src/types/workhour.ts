
// We'll define a minimal RoleType here if it doesn't exist elsewhere
export interface RoleType {
	id: string;
	name: string;
	displayName: string;
}

export interface WorkhourType {
	id: string;
	roleId: string;
	role?: RoleType;
	workHours: number;
	startTime?: string; // e.g. "09:00"
	endTime?: string;   // e.g. "17:00"
	validFrom: string;  // Date string in ISO format
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface WorkhourHistoryType {
	id: string;
	roleId: string;
	previousWorkHourId?: string;
	workHours: number;
	startTime?: string;
	endTime?: string;
	validFrom: string;
	validUntil?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateWorkhourDto {
	roleId: string;
	workHours: number;
	startTime?: string;
	endTime?: string;
	validFrom: string;
}

export interface UpdateWorkhourDto {
	workHours?: number;
	startTime?: string;
	endTime?: string;
	validFrom?: string;
}
