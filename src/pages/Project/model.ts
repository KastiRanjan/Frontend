// models.ts
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
    dueDate: string; // Assuming dueDate is a string representation of a date
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    fiscalYear: string;
    startingDate: string; // Assuming startingDate is a string representation of a date
    endingDate: string; // Assuming endingDate is a string representation of a date
    users: User[];
    tasks: Task[];
  }
  