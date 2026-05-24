import { useMemo, useState } from 'react';
import '../admin.css';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { addExpense, getExpenses, getOrders } from '../lib/repo';
import { todayISO } from '../lib/storage';
import { dashboardSummary, orderTotals, buildDailySeries, buildMonthlySeries } from '../lib/metrics';
import { formatMoneyLKR } from '../lib/format';
import { statusColor } from '../lib/domain';

function Kpi({ label, value, sub }) {
  return (
    <div className="card kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  );
}

function tooltipFormatter(value) {
  return formatMoneyLKR(value);
}

export default function Dashboard() {
  const [refresh, setRefresh] = useState(0);
  const [expenseForm, setExpenseForm] = useState({
    date: todayISO(),
    category: 'General',
    note: '',
    amount: '',
  });

  const orders = useMemo(() => {
    void refresh;
    return getOrders();
  }, [refresh]);
  const expenses = useMemo(() => {
    void refresh;
    return getExpenses();
  }, [refresh]);
  const summary = useMemo(
    () => dashboardSummary({ orders, expenses, todayISO: todayISO() }),
    [orders, expenses]
  );

  const daily = useMemo(() => buildDailySeries({ orders, expenses, days: 14 }), [orders, expenses]);
  const monthly = useMemo(
    () => buildMonthlySeries({ orders, expenses, months: 12 }),
    [orders, expenses]
  );

  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return sorted.slice(0, 6);
  }, [orders]);

  function onAddExpense(e) {
    e.preventDefault();
    const amount = Number(expenseForm.amount);
    if (!expenseForm.date || !expenseForm.category || !Number.isFinite(amount) || amount <= 0) return;
    addExpense({
      date: expenseForm.date,
      category: expenseForm.category,
      note: expenseForm.note.trim(),
      amount,
    });
    setExpenseForm({ date: todayISO(), category: 'General', note: '', amount: '' });
    setRefresh((x) => x + 1);
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">Daily & monthly profit/expenses with graphs</div>
        </div>
        <div className="page-actions">
          <div className="muted">Today: {todayISO()}</div>
        </div>
      </div>

      <div className="kpi-row">
        <Kpi label="Today Profit" value={formatMoneyLKR(summary.today.profit)} sub={`Revenue: ${formatMoneyLKR(summary.today.revenue)}`} />
        <Kpi label="Today Expenses" value={formatMoneyLKR(summary.today.expenses)} sub="Includes all logged expenses" />
        <Kpi label="Monthly Profit" value={formatMoneyLKR(summary.month.profit)} sub={`Revenue: ${formatMoneyLKR(summary.month.revenue)}`} />
        <Kpi label="Monthly Expenses" value={formatMoneyLKR(summary.month.expenses)} sub="Same month as today" />
      </div>

      <div className="split">
        <div className="card content-card">
          <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 850 }}>Daily Profit vs Expenses (last 14 days)</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Profit is based on delivered/received orders
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fill: '#9fb0d0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9fb0d0', fontSize: 11 }} />
                <Tooltip formatter={tooltipFormatter} contentStyle={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#28d17c" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="#ff5c7a" strokeWidth={2.0} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card content-card">
          <div style={{ fontWeight: 850, marginBottom: 10 }}>Add Expense</div>
          <form onSubmit={onAddExpense} className="grid" style={{ gap: 10 }}>
            <div className="field">
              <div className="field-label">Date</div>
              <input
                className="input"
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm((s) => ({ ...s, date: e.target.value }))}
              />
            </div>
            <div className="field">
              <div className="field-label">Category</div>
              <input
                className="input"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm((s) => ({ ...s, category: e.target.value }))}
                placeholder="Ads / Rent / Delivery / Packaging..."
              />
            </div>
            <div className="field">
              <div className="field-label">Amount (LKR)</div>
              <input
                className="input"
                inputMode="numeric"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm((s) => ({ ...s, amount: e.target.value }))}
                placeholder="e.g. 2500"
              />
            </div>
            <div className="field">
              <div className="field-label">Note (optional)</div>
              <input
                className="input"
                value={expenseForm.note}
                onChange={(e) => setExpenseForm((s) => ({ ...s, note: e.target.value }))}
                placeholder="Short description"
              />
            </div>
            <button className="btn primary" type="submit">
              Add Expense
            </button>
          </form>
          <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Tip: add delivery/packaging costs here to get more accurate profit.
          </div>
        </div>
      </div>

      <div className="card content-card">
        <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 850 }}>Monthly Profit vs Expenses (last 12 months)</div>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: '#9fb0d0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9fb0d0', fontSize: 11 }} />
              <Tooltip formatter={tooltipFormatter} contentStyle={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }} />
              <Legend />
              <Bar dataKey="profit" fill="#28d17c" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ff5c7a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card content-card">
        <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 850 }}>Recent Orders</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Go to Orders to update status
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => {
              const totals = orderTotals(o);
              return (
                <tr key={o.id}>
                  <td className="muted">{o.createdAt}</td>
                  <td style={{ fontWeight: 750 }}>{o.id.slice(0, 12)}…</td>
                  <td>{o.customerName}</td>
                  <td style={{ fontWeight: 750 }}>{formatMoneyLKR(totals.revenue)}</td>
                  <td>
                    <span className="badge">
                      <span className="dot" style={{ background: statusColor(o.status) }} />
                      {o.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
