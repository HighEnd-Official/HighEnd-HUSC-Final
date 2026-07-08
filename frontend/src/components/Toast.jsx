import { useEffect } from "react";

export function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = type === "error";

  return (
    <div
      style={{
        position: "fixed",
        top: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 24px",
        borderRadius: 14,
        minWidth: 320,
        maxWidth: 440,
        background: "var(--color-surface)",
        border: `1px solid ${isError ? "rgba(184,64,112,0.35)" : "rgba(120,180,140,0.35)"}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        backdropFilter: "blur(20px)",
        animation: "toastIn .35s cubic-bezier(.4,0,.2,1) both",
        fontFamily: "'Cormorant Garamond', serif",
      }}
    >
      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translate(-50%,-12px); }
          to   { opacity:1; transform:translate(-50%,0); }
        }
      `}</style>

      <span style={{ fontSize: 20, flexShrink: 0 }}>
        {isError ? "⚠️" : "✓"}
      </span>

      <p
        style={{
          flex: 1,
          fontSize: 14.5,
          lineHeight: 1.5,
          color: "var(--color-on-surface)",
          margin: 0,
        }}
      >
        {message}
      </p>

      <button
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 16,
          color: "var(--color-outline)",
          padding: 4,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}