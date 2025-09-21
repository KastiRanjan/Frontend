/**
 * Utility function to check if user has permission
 * @param permission Permission string to check
 * @returns Boolean indicating if user has permission
 */
export const hasPermission = (_permission: string): boolean => {
  // For development purposes, return true to allow all permissions
  // This should be replaced with actual permission checking in production
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