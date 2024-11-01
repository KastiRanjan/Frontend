export function checkPermissionForComponent(permission: any, route: any) {
  if (!permission) return false;
    if (route.defaultPermission) return true;
   
  return permission.some(
    (role: any) =>
      role.resource === route.resource &&
      role.path === route.path &&
      role.method === route.method
  );
}
