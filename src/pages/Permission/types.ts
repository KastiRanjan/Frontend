export interface PermissionType {
    id: string; // Changed from number to string to match backend UUID
    createdAt: string;
    updatedAt: string;
    resource: string;
    description: string;
    path: string;
    method: string;
    isDefault: boolean;
}
