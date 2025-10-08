/**
 * Interface for API permissions in the system
 */
export interface Permission {
    id: string;
    name: string;
    method: string;
    path: string;
    resource: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}