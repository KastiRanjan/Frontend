export interface PermissionType {
    id: number;
    createdAt: string;
    updatedAt: string;
    resource: string;
    description: string;
    path: string;
    method: string;
    isDefault: boolean;
}
