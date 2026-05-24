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
      return '#9fb0d0';
    case 'order approved':
      return '#43d0ff';
    case 'order ready for delivery':
      return '#7c5cff';
    case 'order delivered':
      return '#28d17c';
    case 'order received':
      return '#28d17c';
    default:
      return '#9fb0d0';
  }
}

