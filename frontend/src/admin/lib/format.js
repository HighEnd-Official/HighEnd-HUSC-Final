export function formatMoneyLKR(amount) {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `LKR ${Math.round(n).toLocaleString()}`;
  }
}

