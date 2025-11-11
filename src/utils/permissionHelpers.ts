/**
 * New permission utility functions using the direct permission checking pattern
 */

/**
 * Check if user can view all leaves
 */
export const canViewAllLeaves = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        !perm.path?.includes("/") && // No specific path constraint
        perm.method?.toLowerCase() === "get"
    );
};

/**
 * Check if user can view a specific user's leaves
 */
export const canViewUserLeaves = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/user/") &&
        perm.method?.toLowerCase() === "get"
    );
};

/**
 * Check if user can view a specific leave by ID
 */
export const canViewLeaveById = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/:id") &&
        perm.method?.toLowerCase() === "get"
    );
};

/**
 * Check if user can view leave calendar
 */
export const canViewLeaveCalendar = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/calendar/view") &&
        perm.method?.toLowerCase() === "get"
    );
};

/**
 * Check if user can apply for leave
 */
export const canApplyForLeave = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.method?.toLowerCase() === "post"
    );
};

/**
 * Check if user can update a leave
 */
export const canUpdateLeave = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/:id") &&
        perm.method?.toLowerCase() === "patch" &&
        !perm.path?.includes("/approve") && // Not an approval endpoint
        !perm.path?.includes("/reject") // Not a rejection endpoint
    );
};

/**
 * Check if user can delete a leave
 */
export const canDeleteLeave = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/:id") &&
        perm.method?.toLowerCase() === "delete"
    );
};

/**
 * Check if user can reject a leave
 */
export const canRejectLeave = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/reject") &&
        perm.method?.toLowerCase() === "patch"
    );
};

/**
 * Check if user can approve leaves (any approval level)
 */
export const canApproveLeave = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) => (
        // Check for any approval endpoint permission
        (perm.resource === "leave" &&
        perm.path?.includes("/approve") &&
        perm.method?.toLowerCase() === "patch") ||
        // Also check for shorthand format
        perm === "leave:approve"
      )
    );
};

/**
 * Check if user can approve leaves as manager/PM
 */
export const canApproveLeaveAsManager = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        (perm.path?.includes("/approve/manager") || perm.path?.includes("/approve/pm")) &&
        perm.method?.toLowerCase() === "patch"
    );
};

/**
 * Check if user can approve leaves as admin
 */
export const canApproveLeaveAsAdmin = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/approve/admin") &&
        perm.method?.toLowerCase() === "patch"
    );
};

/**
 * Check if user has any leave approval permissions
 */
export const hasAnyLeaveApprovalPermission = (permissions: any[]): boolean => {
  return canApproveLeave(permissions) || 
         canApproveLeaveAsManager(permissions) || 
         canApproveLeaveAsAdmin(permissions);
};

/**
 * Determine what type of approver the user is based on their permissions
 */
export const getApproverLevel = (permissions: any[]): 'admin' | 'manager' | null => {
  if (canApproveLeaveAsAdmin(permissions)) {
    return 'admin';
  }
  
  if (canApproveLeaveAsManager(permissions)) {
    return 'manager';
  }
  
  return null;
};

/**
 * Check if user can view pending approvals
 */
export const canViewPendingApprovals = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "leave" &&
        perm.path?.includes("/approvals/pending") &&
        perm.method?.toLowerCase() === "get"
    );
};

/**
 * Check if user can view dashboard attendance
 */
export const canViewDashboardAttendance = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "dashboard" &&
        perm.path === "/dashboard/attendance" &&
        perm.method?.toLowerCase() === "get"
    );
};

/**
 * Check if user can view dashboard working time
 */
export const canViewDashboardWorkingTime = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "dashboard" &&
        perm.path === "/dashboard/working-time" &&
        perm.method?.toLowerCase() === "get"
    );
};

/**
 * Check if user can view user availability
 */
export const canViewUserAvailability = (permissions: any[]): boolean => {
  return Array.isArray(permissions) &&
    permissions.some(
      (perm: any) =>
        perm.resource === "projects" &&
        perm.path === "/projects/availability/users" &&
        perm.method?.toLowerCase() === "get"
    );
};