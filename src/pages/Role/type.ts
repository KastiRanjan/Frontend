export interface Role {
    id: number;
    createdAt: string; // Consider using Date if you want to work with date objects
    updatedAt: string; // Same as above
    name: string;
    description: string;
  }
  
  // Interface for the response containing roles
  export interface RoleResponse {
    results: Role[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    next: number;
    previous: number;
  }