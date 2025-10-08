// Utility functions for leave permissions

// Permission constants for leave management
export const LEAVE_PERMISSIONS = {
  // View permissions
  VIEW_ALL: 'get/leave',
  VIEW_MY_LEAVES: 'get/leave/my-leaves',
  VIEW_USER_LEAVES: 'get/leave/user/:userId',
  VIEW_LEAVE_BY_ID: 'get/leave/:id',
  VIEW_CALENDAR: 'get/leave/calendar/view',
  VIEW_BALANCE: 'get/leave/balance/:userId',
  
  // Pending approvals for managers/admins
  VIEW_PENDING_APPROVALS: 'get/leave/approvals/pending',
  
  // Mutation permissions
  APPLY: 'post/leave',
  UPDATE: 'patch/leave/:id',
  DELETE: 'delete/leave/:id',
  
  // Approval permissions
  APPROVE: 'patch/leave/:id/approve',
  APPROVE_BY_MANAGER: 'patch/leave/:id/approve/manager',
  APPROVE_BY_PM: 'patch/leave/:id/approve/pm', // Legacy - kept for compatibility
  APPROVE_BY_LEAD: 'patch/leave/:id/approve/lead', // Legacy - kept for compatibility
  APPROVE_BY_ADMIN: 'patch/leave/:id/approve/admin',
  REJECT: 'patch/leave/:id/reject',
};

/**
 * Type for role-based approver level
 */
export type ApproverLevel = 'manager' | 'admin' | null;

// Legacy approver levels kept for backward compatibility
export type LegacyApproverLevel = 'lead' | 'pm' | ApproverLevel;

/**
 * Checks if the user has a specific leave permission
 * 
 * @param permissions - Array of user permissions from session context
 * @param requiredPermission - The permission to check for
 * @returns boolean - Whether the user has the permission
 */
export const hasLeavePermission = (permissions: any[], requiredPermission: string): boolean => {
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  // Check both string permissions and object-based permissions
  return permissions.some((permission) => {
    if (typeof permission === 'string') {
      // Direct match
      if (permission === requiredPermission) return true;
      
      // Special case for role-based permissions (shorthand format)
      if (requiredPermission.startsWith('patch/leave/:id/approve')) {
        return permission === 'leave:approve';
      }
      
      return false;
    } else if (typeof permission === 'object' && permission !== null) {
      // Handle different permission formats
      if (requiredPermission.includes('/')) {
        const [method, path] = requiredPermission.split('/', 2);
        
        // Match by method and path/resource
        if (permission.method && permission.path) {
          return permission.method.toLowerCase() === method.toLowerCase() &&
                 permission.path.toLowerCase().includes(path.toLowerCase());
        }
        
        if (permission.method && permission.resource) {
          return permission.method.toLowerCase() === method.toLowerCase() &&
                 permission.resource.toLowerCase().includes(path.toLowerCase().split(':')[0]);
        }
      }
      
      // Try different permission formats
      const permString = permission.path ? 
        `${permission.method}${permission.path}` : 
        (permission.resource ? 
          `${permission.method}/${permission.resource}` : 
          (permission.name || ''));
      
      return permString === requiredPermission;
    }
    return false;
  });
};

/**
 * Check if the user has any of the specified leave permissions
 * 
 * @param permissions - Array of user permissions from session context
 * @param requiredPermissions - Array of permissions to check for
 * @returns boolean - Whether the user has any of the permissions
 */
export const hasAnyLeavePermission = (
  permissions: any[], 
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.some(permission => 
    hasLeavePermission(permissions, permission)
  );
};

/**
 * Check if the user has any leave approval permissions
 * 
 * @param permissions - Array of user permissions from session context
 * @returns boolean - Whether the user has any approval permission
 */
export const hasAnyLeaveApprovalPermission = (permissions: any[]): boolean => {
  // Users can approve leaves if they have any approval permission
  return hasAnyLeavePermission(permissions, [
    LEAVE_PERMISSIONS.APPROVE,
    LEAVE_PERMISSIONS.APPROVE_BY_MANAGER,
    LEAVE_PERMISSIONS.APPROVE_BY_PM,    // Legacy - kept for compatibility
    LEAVE_PERMISSIONS.APPROVE_BY_ADMIN
  ]);
};

/**
 * Check if the user can view the leave approvals section
 * 
 * @param permissions - Array of user permissions from session context
 * @returns boolean - Whether the user can view the approvals section
 */
export const canViewLeaveApprovals = (permissions: any[]): boolean => {
  // Users can view the approvals section if they have any approval permission
  return hasAnyLeaveApprovalPermission(permissions);
};

/**
 * Check if the user can submit a leave application
 * 
 * @param permissions - Array of user permissions from session context
 * @returns boolean - Whether the user can submit leave applications
 */
export const canApplyForLeave = (permissions: any[]): boolean => {
  return hasLeavePermission(permissions, LEAVE_PERMISSIONS.APPLY);
};

/**
 * Check if the user can view the leave calendar
 * 
 * @param permissions - Array of user permissions from session context
 * @returns boolean - Whether the user can view the leave calendar
 */
export const canViewLeaveCalendar = (permissions: any[]): boolean => {
  return hasLeavePermission(permissions, LEAVE_PERMISSIONS.VIEW_CALENDAR);
};

/**
 * Determine what type of approver the user is based on their permissions
 * 
 * @param permissions - Array of user permissions from session context
 * @returns String indicating the approver level (manager, admin) or null
 */
export const getApproverLevel = (permissions: any[]): ApproverLevel => {
  if (hasLeavePermission(permissions, LEAVE_PERMISSIONS.APPROVE_BY_ADMIN)) {
    return 'admin';
  }
  
  if (hasLeavePermission(permissions, LEAVE_PERMISSIONS.APPROVE_BY_MANAGER)) {
    return 'manager';
  }
  
  // Check for legacy permissions for backwards compatibility
  if (hasLeavePermission(permissions, LEAVE_PERMISSIONS.APPROVE_BY_PM)) {
    return 'manager'; // PM is now considered a manager
  }
  
  return null;
};

// Override functionality removed per requirements

/**
 * Get the list of possible leave actions for a given user based on their permissions
 * 
 * @param permissions - Array of user permissions from session context
 * @returns object - Object with boolean flags for each possible leave action
 */
export const getLeaveActionPermissions = (permissions: any[]) => {
  return {
    canView: hasLeavePermission(permissions, LEAVE_PERMISSIONS.VIEW_ALL),
    canViewMyLeaves: hasLeavePermission(permissions, LEAVE_PERMISSIONS.VIEW_MY_LEAVES),
    canViewUserLeaves: hasLeavePermission(permissions, LEAVE_PERMISSIONS.VIEW_USER_LEAVES),
    canApply: canApplyForLeave(permissions),
    canApprove: hasAnyLeaveApprovalPermission(permissions),
    canViewCalendar: canViewLeaveCalendar(permissions),
    canUpdate: hasLeavePermission(permissions, LEAVE_PERMISSIONS.UPDATE),
    canDelete: hasLeavePermission(permissions, LEAVE_PERMISSIONS.DELETE),
    canReject: hasLeavePermission(permissions, LEAVE_PERMISSIONS.REJECT),
    canViewApprovals: hasLeavePermission(permissions, LEAVE_PERMISSIONS.VIEW_PENDING_APPROVALS),
    approverLevel: getApproverLevel(permissions)
  };
};