export interface User {
    id: string;
    name: string;
    email: string;
    status: string;
  }
  
 export interface Task {
    id: string;
    name: string;
    description: string;
    dueDate: string;
  }
  
 export interface Project {
    id: string;
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
    users: User[];
    tasks: Task[];
  }