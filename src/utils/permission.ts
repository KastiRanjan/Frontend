export function checkPermissionForComponent(permission: any,resource: any, method: any, path: any) {
  console.log(permission,resource, method, path)
  if (!permission) return false;   
  return permission.some(
    (role: any) =>
      role.resource === resource &&
      role.path === path &&
      role.method === method
  );
}
