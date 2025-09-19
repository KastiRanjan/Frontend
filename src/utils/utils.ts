/**
 * Utility function to check if user has permission
 * @param permission Permission string to check
 * @returns Boolean indicating if user has permission
 */
export const hasPermission = (permission: string): boolean => {
  // TODO: Implement actual permission checking based on user roles
  // For now, return true for development
  return true;
};

/**
 * Utility function to check if user can modify data based on permissions
 * @param permission Permission string to check
 * @returns Boolean indicating if user can modify data
 */
export const canModifyData = (permission: string): boolean => {
  return hasPermission(permission);
};