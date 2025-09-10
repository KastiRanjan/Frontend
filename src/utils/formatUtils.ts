/**
 * Format business status enum to readable text
 */
export const formatBusinessStatus = (status?: string): string => {
  if (!status) return '';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
