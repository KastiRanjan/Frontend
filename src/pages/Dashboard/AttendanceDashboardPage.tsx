import React from "react";
import { AttendanceDashboard } from "@/components/Dashboard";

/**
 * Dashboard page component that displays attendance statistics
 * This component will only render if user has the required permission
 */
const DashboardPage: React.FC = () => {
  return (
    <div>
      <AttendanceDashboard />
    </div>
  );
};

export default DashboardPage;
