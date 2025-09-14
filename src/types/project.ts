import { TaskType } from "./task";
import { UserType } from "./user";

export interface NatureOfWorkType {
    id: string;
    name: string;
    shortName: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProjectType {
    id: number;
    name: string;
    description: string;
    status: "active" | "suspended" | "archived" | "signed_off";
    natureOfWork: NatureOfWorkType | string;
    fiscalYear: number;
    startingDate: string;
    endingDate: string;
    startingDateNepali?: string; // YYYY-MM-DD in BS
    endingDateNepali?: string; // YYYY-MM-DD in BS
    startingDateFormatted?: string; // Human-readable nepali date
    endingDateFormatted?: string; // Human-readable nepali date
    allowSubtaskWorklog?: boolean;
    projectLead?: UserType;
    projectManager?: UserType;
    users?: UserType[];
    tasks?: TaskType[];
    createdAt?: string;
    updatedAt?: string;
}