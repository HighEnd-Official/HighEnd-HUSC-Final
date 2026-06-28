import { useEffect, useMemo, useState } from "react";
import "../admin.css";
import { getContactMessages, markContactMessageRead, replyContactMessage } from "../lib/apiRepo";

function Stat({ label, value, sub }) {
  return (
    <div className="card kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  );
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [error, setError] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  const selected = useMemo(
    () => messages.find((message) => message.id === selectedId) || messages[0] || null,
    [messages, selectedId]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getContactMessages()
      .then((list) => {
        if (cancelled) return;
        setMessages(list);
        setSelectedId((current) => current || list[0]?.id || null);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setMessages([]);
        setError(err?.message || "Failed to load contact messages.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setReplyDraft(selected?.replyMessage || "");
    setReplyError("");
    setReplySuccess("");
  }, [selected?.id]);

  const unreadCount = messages.filter((message) => !message.isRead).length;

  async function onMarkRead(message) {
    setSavingId(message.id);
    try {
      const updated = await markContactMessageRead(message.id);
      setMessages((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    } finally {
      setSavingId("");
    }
  }

  async function onReply(message) {
    const trimmed = replyDraft.trim();
    if (!trimmed) {
      setReplyError("Please enter a reply before sending.");
      return;
    }

    setReplying(true);
    setReplyError("");
    setReplySuccess("");
    try {
      const updated = await replyContactMessage(message.id, trimmed);
      setMessages((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedId(updated.id);
      setReplyDraft(updated.replyMessage || trimmed);
      setReplySuccess("Reply sent to the customer.");
    } catch (err) {
      setReplyError(err?.message || "Failed to send reply.");
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <div className="page-subtitle">Contact us submissions from the public site</div>
        </div>
        <div className="page-actions">
          <div className="muted">Unread: {unreadCount}</div>
        </div>
      </div>

      <div className="kpi-row">
        <Stat label="Total Messages" value={messages.length} sub="All contact form submissions" />
        <Stat label="Unread" value={unreadCount} sub="Needs a reply" />
        <Stat label="Read" value={messages.length - unreadCount} sub="Already reviewed" />
      </div>

      {error ? <div className="card content-card" style={{ color: "var(--color-primary)", fontWeight: 700 }}>{error}</div> : null}

      <div className="split">
        <div className="card content-card admin-table-card">
          <div className="toolbar" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 850 }}>Inbox</div>
            <div className="muted" style={{ fontSize: 12 }}>{loading ? "Loading..." : `${messages.length} message(s)`}</div>
          </div>
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr
                  key={message.id}
                  onClick={() => setSelectedId(message.id)}
                  style={{ cursor: "pointer", background: selected?.id === message.id ? "rgba(133, 76, 111, 0.08)" : "transparent" }}
                >
                  <td className="muted">{message.createdAt}</td>
                  <td style={{ fontWeight: 750 }}>{message.name}</td>
                  <td>{message.email}</td>
                  <td className="muted">
                    {message.message.slice(0, 90)}
                    {message.message.length > 90 ? "..." : ""}
                  </td>
                  <td>
                    <span className="badge">
                      <span className="dot" style={{ background: message.isRead ? "#28d17c" : "#ff5c7a" }} />
                      {message.isRead ? "Read" : "Unread"}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">No contact messages yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="card content-card">
          {selected ? (
            <div className="grid" style={{ gap: 12 }}>
              <div className="toolbar" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{selected.name}</div>
                  <div className="muted">{selected.email}</div>
                </div>
                <button
                  className={`btn ${selected.isRead ? "" : "primary"}`}
                  onClick={() => onMarkRead(selected)}
                  type="button"
                  disabled={savingId === selected.id || selected.isRead}
                >
                  {selected.isRead ? "Marked Read" : savingId === selected.id ? "Saving..." : "Mark Read"}
                </button>
              </div>

              {replyError ? <div className="muted" style={{ color: "var(--color-primary)", fontWeight: 700 }}>{replyError}</div> : null}
              {replySuccess ? <div className="muted" style={{ color: "#28a46a", fontWeight: 700 }}>{replySuccess}</div> : null}

              <div className="card" style={{ padding: 14, background: "var(--admin-surface-card)" }}>
                <div className="field-label" style={{ marginBottom: 8 }}>Message</div>
                <div style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.message}</div>
              </div>

              <div className="card" style={{ padding: 14, background: "var(--admin-surface-card)" }}>
                <div className="field-label" style={{ marginBottom: 8 }}>Reply to customer</div>
                <textarea
                  className="input"
                  rows={6}
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  placeholder="Write a reply that will be emailed to the customer..."
                  style={{ resize: "vertical" }}
                />
                <div className="toolbar" style={{ justifyContent: "space-between", marginTop: 10, gap: 10, flexWrap: "wrap" }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {selected.repliedAt ? `Last sent ${selected.repliedAt}` : "No reply sent yet."}
                  </div>
                  <button
                    className="btn primary"
                    onClick={() => onReply(selected)}
                    type="button"
                    disabled={replying}
                  >
                    {replying ? "Sending..." : selected.replyMessage ? "Resend Reply" : "Send Reply"}
                  </button>
                </div>
              </div>

              {selected.replyMessage ? (
                <div className="card" style={{ padding: 14, background: "var(--admin-surface-card)" }}>
                  <div className="field-label" style={{ marginBottom: 8 }}>Sent reply</div>
                  <div style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.replyMessage}</div>
                </div>
              ) : null}

              <div className="toolbar" style={{ flexWrap: "wrap", gap: 8 }}>
                <span className="badge">Submitted {selected.createdAt}</span>
                <span className="badge">{selected.isRead ? "Read" : "Unread"}</span>
                {selected.readAt ? <span className="badge">Read at {selected.readAt}</span> : null}
                {selected.repliedAt ? <span className="badge">Replied at {selected.repliedAt}</span> : null}
              </div>
            </div>
          ) : (
            <div className="muted">Select a message to preview it here.</div>
          )}
        </div>
      </div>
    </div>
  );
}
