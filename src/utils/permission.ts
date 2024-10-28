export function checkPermissionForComponent(roles: any, route: any) {
  if (!roles || !roles.permission) return false;
    if (route.defaultPermission) return true;
    console.log(route);
  return roles.permission.some(
    (role: any) =>
      role.resource === route.resource &&
      role.path === route.path &&
      role.method === route.method
  );
}
