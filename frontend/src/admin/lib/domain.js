export const ORDER_STATUSES = [
  'order pending',
  'order approved',
  'order ready for delivery',
  'order delivered',
  'order received',
];

export function isRevenueRecognized(status) {
  return status === 'order delivered' || status === 'order received';
}

export function statusColor(status) {
  switch (status) {
    case 'order pending':
      return 'var(--color-outline)';
    case 'order approved':
      return 'var(--color-primary-container)';
    case 'order ready for delivery':
      return 'var(--color-primary)';
    case 'order delivered':
      return 'var(--color-tertiary)';
    case 'order received':
      return 'var(--color-tertiary)';
    default:
      return 'var(--color-outline)';
  }
}

