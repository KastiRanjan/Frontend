import { UserType } from '@/types/user';

// Returns users filtered according to the current user's role and the rules requested by product.
// Rules implemented:
// - audit junior -> show audit senior and higher (exclude other juniors)
// - audit senior -> show project lead (position) and project manager of that project, admin, superuser
// - project lead -> show project manager and higher (admin, superuser)
// - project manager -> show admin and superuser
// - admin -> show superuser only
// Always exclude self
export function getFilteredApprovers(users: UserType[] = [], currentUserRole?: string, currentUserId?: string) {
  if (!Array.isArray(users)) return [];

  const currentRole = (currentUserRole || '').toString().toLowerCase().trim();
  const currentId = currentUserId?.toString();

  return users.filter((u: any) => {
    const userId = u?.id?.toString();
    if (!userId) return false;

    // Exclude self
    if (currentId && userId === currentId) return false;

    const roleName = (u?.role && u.role.name) ? u.role.name.toString().toLowerCase().trim() : '';
    const isProjectLead = u?.position === 'projectLead' || roleName === 'projectlead';

    // Helper: check if role is at least auditsenior or above
    const isAuditSeniorOrHigher = ['auditsenior', 'seniorauditor', 'projectlead', 'projectmanager', 'admin', 'superuser'].includes(roleName) || isProjectLead;

    // audit junior -> show audit senior and higher (exclude other audit juniors)
    if (['auditjunior', 'junior'].includes(currentRole)) {
      return isAuditSeniorOrHigher;
    }

    // audit senior -> show project lead (position), project manager, admin, superuser
    if (['auditsenior', 'seniorauditor'].includes(currentRole)) {
      return isProjectLead || ['projectmanager', 'admin', 'superuser'].includes(roleName);
    }

    // project lead -> show project manager and higher
    if (['projectlead', 'project lead', 'lead'].includes(currentRole)) {
      return ['projectmanager', 'admin', 'superuser'].includes(roleName);
    }

    // project manager -> show admin and superuser
    if (['projectmanager', 'manager'].includes(currentRole)) {
      return ['admin', 'superuser'].includes(roleName);
    }

    // admin -> show superuser only
    if (currentRole === 'admin') {
      return roleName === 'superuser';
    }

    // Default fallback: allow all except self
    return true;
  });
}
