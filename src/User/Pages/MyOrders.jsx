import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { apiFetch } from "../../api/client";

function money(cents) {
  return `Rs.${((Number(cents) || 0) / 100).toFixed(2)}`;
}

function formatDate(iso) {
  const s = String(iso || "");
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch("/orders/mine")
      .then((data) => {
        if (!cancelled) setOrders(data.orders || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Failed to load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => String(o.id).toLowerCase().includes(q) || String(o.status || "").toLowerCase().includes(q));
  }, [orders, query]);

  return (
    <div style={{ background: "var(--color-surface)", minHeight: "100vh" }}>
      <NavBar />
      <main className="max-w-[1200px] mx-auto px-6 md:px-14 lg:px-20 pt-[110px] pb-24">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300, color: "var(--color-on-surface)" }}>My Orders</h1>
            <p style={{ marginTop: 6, color: "var(--color-outline)", fontSize: 13 }}>Track order status and view order details.</p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order id or status"
            style={{
              width: 320,
              maxWidth: "100%",
              borderRadius: 999,
              border: "1px solid rgba(210,155,185,0.35)",
              background: "var(--color-surface)",
              padding: "10px 14px",
              outline: "none",
              fontSize: 13,
              color: "var(--color-on-surface)",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          />
        </div>

        <div style={{ marginTop: 28 }}>
          {loading ? (
            <p style={{ color: "var(--color-outline)", fontFamily: "'Cormorant Garamond', serif" }}>Loading…</p>
          ) : error ? (
            <p style={{ color: "var(--color-primary)", fontFamily: "'Cormorant Garamond', serif" }}>{error}</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--color-outline)", fontFamily: "'Cormorant Garamond', serif" }}>No orders found.</p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {filtered.map((o) => (
                <div key={o.id} style={{ borderRadius: 18, border: "1px solid rgba(210,155,185,0.24)", background: "var(--color-surface)", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "var(--color-on-surface)" }}>Order #{String(o.id).slice(0, 12)}…</div>
                      <div style={{ marginTop: 4, color: "var(--color-outline)", fontSize: 12 }}>
                        {formatDate(o.createdAt)} · {o.paymentMethod}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, color: "var(--color-primary)" }}>{money(o.totalCents)}</div>
                      <div style={{ marginTop: 4, color: "var(--color-on-surface)", fontSize: 12 }}>
                        Status: <span style={{ fontWeight: 800 }}>{o.status}</span>
                      </div>
                    </div>
                  </div>

                  {o.items?.length ? (
                    <div style={{ marginTop: 14, borderTop: "1px solid rgba(210,155,185,0.18)", paddingTop: 12, display: "grid", gap: 8 }}>
                      {o.items.map((it) => (
                        <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ color: "var(--color-on-surface)" }}>
                            <div style={{ fontWeight: 700 }}>{it.productName}</div>
                            <div style={{ color: "var(--color-outline)", fontSize: 12 }}>
                              {it.size ? `Size: ${it.size}` : ""} {it.color ? `· Color: ${it.color}` : ""} · Qty: {it.quantity}
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, color: "var(--color-on-surface)" }}>{money(it.unitPriceCents * it.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}


