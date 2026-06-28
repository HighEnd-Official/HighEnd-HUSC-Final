import { isRevenueRecognized } from './domain';

function sum(arr) {
  return arr.reduce((acc, n) => acc + n, 0);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function toMonthKey(dateISO) {
  return dateISO.slice(0, 7);
}

export function orderTotals(order) {
  const revenue = sum(order.items.map((i) => i.price * i.qty));
  const cost = sum(order.items.map((i) => i.cost * i.qty));
  return { revenue: round2(revenue), cost: round2(cost), grossProfit: round2(revenue - cost) };
}

export function dashboardSummary({ orders, expenses, todayISO }) {
  const todayOrders = orders.filter(
    (o) => o.createdAt === todayISO && isRevenueRecognized(o.status)
  );
  const monthKey = toMonthKey(todayISO);
  const monthOrders = orders.filter(
    (o) => toMonthKey(o.createdAt) === monthKey && isRevenueRecognized(o.status)
  );
  const todayExpenses = expenses.filter((e) => e.date === todayISO);
  const monthExpenses = expenses.filter((e) => toMonthKey(e.date) === monthKey);

  const todayRevenue = sum(todayOrders.map((o) => orderTotals(o).revenue));
  const todayCost = sum(todayOrders.map((o) => orderTotals(o).cost));
  const todayGross = todayRevenue - todayCost;
  const todayExp = sum(todayExpenses.map((e) => e.amount));

  const monthRevenue = sum(monthOrders.map((o) => orderTotals(o).revenue));
  const monthCost = sum(monthOrders.map((o) => orderTotals(o).cost));
  const monthGross = monthRevenue - monthCost;
  const monthExp = sum(monthExpenses.map((e) => e.amount));

  return {
    today: { profit: round2(todayGross - todayExp), expenses: round2(todayExp), revenue: round2(todayRevenue) },
    month: { profit: round2(monthGross - monthExp), expenses: round2(monthExp), revenue: round2(monthRevenue) },
  };
}

export function buildDailySeries({ orders, expenses, days = 14 }) {
  const map = new Map();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    map.set(key, { date: key, profit: 0, expenses: 0, revenue: 0 });
  }

  orders
    .filter((o) => isRevenueRecognized(o.status))
    .forEach((o) => {
      const row = map.get(o.createdAt);
      if (!row) return;
      const totals = orderTotals(o);
      row.revenue += totals.revenue;
      row.profit += totals.grossProfit;
    });

  expenses.forEach((e) => {
    const row = map.get(e.date);
    if (!row) return;
    row.expenses += e.amount;
  });

  return Array.from(map.values()).map((r) => ({
    ...r,
    profit: round2(r.profit - r.expenses),
    revenue: round2(r.revenue),
    expenses: round2(r.expenses),
  }));
}

export function buildMonthlySeries({ orders, expenses, months = 12 }) {
  const map = new Map();
  const now = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, { month: key, profit: 0, expenses: 0, revenue: 0 });
  }

  orders
    .filter((o) => isRevenueRecognized(o.status))
    .forEach((o) => {
      const k = toMonthKey(o.createdAt);
      const row = map.get(k);
      if (!row) return;
      const totals = orderTotals(o);
      row.revenue += totals.revenue;
      row.profit += totals.grossProfit;
    });

  expenses.forEach((e) => {
    const k = toMonthKey(e.date);
    const row = map.get(k);
    if (!row) return;
    row.expenses += e.amount;
  });

  return Array.from(map.values()).map((r) => ({
    ...r,
    profit: round2(r.profit - r.expenses),
    revenue: round2(r.revenue),
    expenses: round2(r.expenses),
  }));
}

