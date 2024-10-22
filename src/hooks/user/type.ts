export interface UserType {
    id: number;
    createdAt: string;
    updatedAt: string;
    username: string;
    email: string;
    name: string;
    avatar: null;
    status: "active" | "inactive";
    isTwoFAEnabled: boolean;
    role: {
        id: number;
        name: string;
    };
}
