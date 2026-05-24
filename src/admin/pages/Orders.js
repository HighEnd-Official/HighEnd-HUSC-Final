import { Fragment, useMemo, useState } from 'react';
import '../admin.css';
import { getOrders, updateOrderStatus } from '../lib/repo';
import { ORDER_STATUSES, statusColor } from '../lib/domain';
import { orderTotals } from '../lib/metrics';
import { formatMoneyLKR } from '../lib/format';

function StatusBadge({ status }) {
  return (
    <span className="badge">
      <span className="dot" style={{ background: statusColor(status) }} />
      {status}
    </span>
  );
}

export default function Orders() {
  const [refresh, setRefresh] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());

  const orders = useMemo(() => {
    void refresh;
    const list = getOrders();
    return [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(o.id).toLowerCase().includes(q) ||
        String(o.customerName || '').toLowerCase().includes(q) ||
        String(o.customerPhone || '').toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  function toggleExpanded(orderId) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  function onStatusChange(orderId, nextStatus) {
    updateOrderStatus(orderId, nextStatus);
    setRefresh((x) => x + 1);
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <div className="page-subtitle">
            View orders and change status: pending → approved → ready for delivery → delivered → received
          </div>
        </div>
        <div className="page-actions">
          <select
            className="select"
            style={{ width: 220 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            className="input"
            style={{ width: 280 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order id / customer / phone"
          />
        </div>
      </div>

      <div className="card content-card">
        <table className="table">
          <thead>
            <tr>
              <th />
              <th>Date</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const totals = orderTotals(o);
              const isOpen = expanded.has(o.id);
              return (
                <Fragment key={o.id}>
                  <tr>
                    <td style={{ width: 46 }}>
                      <button className="btn" type="button" onClick={() => toggleExpanded(o.id)}>
                        {isOpen ? '−' : '+'}
                      </button>
                    </td>
                    <td className="muted">{o.createdAt}</td>
                    <td style={{ fontWeight: 780 }}>{o.id.slice(0, 12)}…</td>
                    <td>
                      <div style={{ fontWeight: 720 }}>{o.customerName || '-'}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {o.customerPhone || ''}
                      </div>
                    </td>
                    <td style={{ fontWeight: 780 }}>{formatMoneyLKR(totals.revenue)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td style={{ width: 260 }}>
                      <select
                        className="select"
                        value={o.status}
                        onChange={(e) => onStatusChange(o.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr>
                      <td colSpan={7} style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="grid" style={{ gap: 10 }}>
                          <div className="muted" style={{ fontSize: 12 }}>
                            Items
                          </div>
                          <table className="table" style={{ marginTop: -6 }}>
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Line Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((it, idx) => (
                                <tr key={`${o.id}:${idx}`}>
                                  <td style={{ fontWeight: 700 }}>{it.name}</td>
                                  <td>{it.qty}</td>
                                  <td>{formatMoneyLKR(it.price)}</td>
                                  <td style={{ fontWeight: 750 }}>{formatMoneyLKR(it.price * it.qty)}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 800 }}>
                                  Total
                                </td>
                                <td style={{ fontWeight: 900 }}>{formatMoneyLKR(totals.revenue)}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="muted" style={{ fontSize: 12 }}>
                            Profit tracking uses your product cost values. For accurate profit, keep product cost and expenses updated.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="muted">
                  No orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
