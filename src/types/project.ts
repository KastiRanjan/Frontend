import { TaskType } from "./task";
import { UserType } from "./user";


export interface ProjectType {
    id: number;
    name: string;
    description: string;
    status: "active" | "suspended" | "archived" | "signed_off";
    natureOfWork:
    | "external_audit"
    | "tax_compliance"
    | "accounts_review"
    | "legal_services"
    | "financial_projection"
    | "valuation"
    | "internal_audit"
    | "others";
    fiscalYear: number;
    startingDate: string;
    endingDate: string;
    projectLead?: UserType;
    projectManager?: UserType;
    users?: UserType[];
    tasks?: TaskType[];
    createdAt?: string;
    updatedAt?: string;
}