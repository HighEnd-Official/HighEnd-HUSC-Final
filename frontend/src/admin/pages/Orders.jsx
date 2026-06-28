import { Fragment, useEffect, useMemo, useState } from 'react';
import '../admin.css';
import { getOrders, updateOrderStatus } from '../lib/apiRepo';
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
  const [ordersState, setOrdersState] = useState([]);

  const orders = useMemo(() => {
    void refresh;
    return [...ordersState].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [ordersState, refresh]);

  useEffect(() => {
    let cancelled = false;
    getOrders()
      .then((list) => {
        if (!cancelled) setOrdersState(list);
      })
      .catch(() => {
        if (!cancelled) setOrdersState([]);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(order.id).toLowerCase().includes(q) ||
        String(order.customerName || '').toLowerCase().includes(q) ||
        String(order.customerPhone || '').toLowerCase().includes(q) ||
        String(order.customerEmail || '').toLowerCase().includes(q) ||
        (order.items || []).some((item) => String(item.name || '').toLowerCase().includes(q))
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

  async function onStatusChange(orderId, nextStatus) {
    await updateOrderStatus(orderId, nextStatus);
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            className="input"
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
            {filtered.map((order) => {
              const totals = orderTotals(order);
              const isOpen = expanded.has(order.id);

              return (
                <Fragment key={order.id}>
                  <tr>
                    <td style={{ width: 46 }}>
                      <button className="btn" type="button" onClick={() => toggleExpanded(order.id)}>
                        {isOpen ? '-' : '+'}
                      </button>
                    </td>
                    <td className="muted">{order.createdAt}</td>
                    <td style={{ fontWeight: 780 }}>{order.id.slice(0, 12)}...</td>
                    <td>
                      <div style={{ fontWeight: 720 }}>{order.customerName || '-'}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {order.customerPhone || ''}
                      </div>
                    </td>
                    <td style={{ fontWeight: 780 }}>{formatMoneyLKR(totals.revenue)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ width: 260 }}>
                      <select
                        className="select"
                        value={order.status}
                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {isOpen ? (
                    <tr>
                      <td colSpan={7} style={{ background: 'var(--admin-panel)' }}>
                        <div className="grid" style={{ gap: 10 }}>
                          <div className="toolbar" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div className="muted" style={{ fontSize: 12 }}>Customer</div>
                              <div style={{ fontWeight: 800 }}>{order.customerName || '-'}</div>
                              <div className="muted" style={{ fontSize: 12 }}>
                                {(order.customerPhone || '').trim() ? `Phone: ${order.customerPhone}` : ''}
                                {(order.customerEmail || '').trim() ? ` Email: ${order.customerEmail}` : ''}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div className="muted" style={{ fontSize: 12 }}>Payment</div>
                              <div style={{ fontWeight: 850 }}>{order.paymentMethod || '-'}</div>
                              {order.paymentProofUrl ? (
                                <a
                                  className="btn"
                                  href={order.paymentProofUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ marginTop: 8, display: 'inline-flex' }}
                                >
                                  View customer invoice
                                </a>
                              ) : (
                                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                                  No customer invoice uploaded
                                </div>
                              )}
                              <div className="muted" style={{ fontSize: 12 }}>
                                Subtotal {formatMoneyLKR(order.subtotal || 0)} - Shipping {formatMoneyLKR(order.shipping || 0)} - Discount {formatMoneyLKR(order.discount || 0)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Shipping Address</div>
                            <div style={{ fontWeight: 700 }}>
                              {order.address?.line1 || '-'}
                            </div>
                            {order.address?.line2 ? <div className="muted" style={{ fontSize: 12 }}>{order.address.line2}</div> : null}
                            <div className="muted" style={{ fontSize: 12 }}>
                              {[order.address?.city, order.address?.postalCode, order.address?.country].filter(Boolean).join(' - ')}
                            </div>
                          </div>

                          <div className="muted" style={{ fontSize: 12 }}>
                            Items
                          </div>

                          <table className="table" style={{ marginTop: -6 }}>
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Size</th>
                                <th>Color</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Line Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(order.items || []).map((item, index) => (
                                <tr key={`${order.id}:${index}`}>
                                  <td style={{ fontWeight: 700 }}>{item.name}</td>
                                  <td className="muted">{item.size || '-'}</td>
                                  <td className="muted">{item.color || '-'}</td>
                                  <td>{item.qty}</td>
                                  <td>{formatMoneyLKR(item.price)}</td>
                                  <td style={{ fontWeight: 750 }}>{formatMoneyLKR(item.price * item.qty)}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={5} style={{ textAlign: 'right', fontWeight: 800 }}>
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
