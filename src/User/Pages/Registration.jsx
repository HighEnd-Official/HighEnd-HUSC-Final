import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

/* ── Floating petal ─────────────────────────────────────────────────────── */
function Petal({ x, y, delay, size, char }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        fontSize: size,
        color: "#d4a0be",
        opacity: 0.18,
        pointerEvents: "none",
        userSelect: "none",
        animation: `petalDrift ${9 + delay}s ease-in-out ${delay}s infinite`,
      }}
    >
      {char}
    </span>
  );
}

const PETALS = [
  { x: 4,  y: 8,  delay: 0,   size: 11, char: "✿" },
  { x: 88, y: 15, delay: 1.8, size: 8,  char: "❀" },
  { x: 92, y: 60, delay: 3.2, size: 10, char: "✿" },
  { x: 6,  y: 75, delay: 2.1, size: 9,  char: "✾" },
  { x: 50, y: 3,  delay: 4,   size: 7,  char: "❀" },
  { x: 96, y: 38, delay: 0.7, size: 8,  char: "✿" },
  { x: 2,  y: 50, delay: 5,   size: 10, char: "✾" },
];

/* ── Float-label input ──────────────────────────────────────────────────── */
function FloatInput({ id, name, label, type = "text", value, onChange, placeholder, required, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || (value && value.length > 0);

  return (
    <div style={{ position: "relative", paddingTop: 22, marginBottom: 28 }}>
      {/* Label */}
      <label
        htmlFor={id}
        style={{
          position: "absolute",
          left: 0,
          top: lifted ? 0 : 34,
          fontSize: lifted ? "9px" : "14px",
          fontWeight: 600,
          letterSpacing: lifted ? "0.3em" : "0.04em",
          textTransform: lifted ? "uppercase" : "none",
          color: focused ? "#c07fa5" : "#9c8490",
          transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#c07fa5", fontSize: 10, lineHeight: 1 }}>✦</span>
        )}
      </label>

      {/* Input */}
      <input
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${focused ? "#c07fa5" : "#e2cdd7"}`,
          padding: "10px 0 9px",
          fontSize: 15,
          color: "#1f1a1d",
          outline: "none",
          fontFamily: "'Jost', sans-serif",
          transition: "border-color 0.3s ease",
        }}
      />

      {/* Sliding accent line */}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "1.5px",
          width: focused ? "100%" : "0%",
          background: "linear-gradient(90deg, #c07fa5, #e8b8d4)",
          borderRadius: 2,
          transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

/* ── Progress steps ─────────────────────────────────────────────────────── */
function StepDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 36 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === current ? 24 : 6,
            height: 6,
            borderRadius: 3,
            background: i <= current ? "#c07fa5" : "#e2cdd7",
            transition: "all 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ── Main Registration ──────────────────────────────────────────────────── */
const Registration = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", newsletter: false,
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [step, setStep]         = useState(0); // 0 = personal, 1 = account

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Please enter your full name."); return; }
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim()) { setError("Please enter your email address."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) { setError("Please enter a valid email address."); return; }
    if (!form.password) { setError("Please enter a password."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      const result = register(form.name, form.email, form.password);
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 1800);
    }, 900);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: #e8acd0; color: #4a193a; }

        @keyframes petalDrift {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          40%       { transform: translateY(-20px) rotate(18deg) scale(1.08); }
          70%       { transform: translateY(-10px) rotate(-10deg) scale(0.94); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp   {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1);    opacity: 0.15; }
          50%       { transform: scale(1.05); opacity: 0.26; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-20px); }
        }

        .reg-root {
          font-family: 'Jost', sans-serif;
          background: #fdf7fa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Left panel ── */
        .reg-left {
          width: 42%;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          background: linear-gradient(160deg, #1e0b17 0%, #3a1228 45%, #5e2347 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }
        .reg-left__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.2;
          mix-blend-mode: luminosity;
        }
        .reg-left__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(30,11,23,0.3) 0%,
            rgba(94,35,71,0.15) 45%,
            rgba(30,11,23,0.85) 100%
          );
        }
        .reg-left__ring {
          position: absolute;
          border: 0.5px solid rgba(224,163,200,0.18);
          border-radius: 50%;
          animation: ringPulse 7s ease-in-out infinite;
          pointer-events: none;
        }
        .reg-left__content {
          position: relative;
          z-index: 2;
          padding: 48px;
        }
        .reg-left__season {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(224,163,200,0.7);
          margin-bottom: 12px;
        }
        .reg-left__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 4vw, 58px);
          font-weight: 300;
          font-style: italic;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .reg-left__title em {
          color: #e0a3c8;
          font-style: normal;
        }
        .reg-left__divider {
          width: 36px;
          height: 0.5px;
          background: linear-gradient(90deg, #e0a3c8, transparent);
          margin-bottom: 20px;
        }
        .reg-left__desc {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 280px;
          margin-bottom: 32px;
        }
        .reg-left__perks {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .reg-left__perk {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11.5px;
          font-weight: 400;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.04em;
        }
        .reg-left__perk-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #e0a3c8;
          flex-shrink: 0;
        }

        /* ── Right panel ── */
        .reg-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px 64px;
          background: #fdf7fa;
          position: relative;
          overflow: hidden;
        }
        .reg-right__deco {
          position: absolute;
          border: 0.5px solid rgba(192,127,165,0.1);
          border-radius: 50%;
          pointer-events: none;
        }
        .reg-right__box {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        /* Error */
        .reg-error {
          border-left: 2px solid #d97ca0;
          background: #fef0f5;
          padding: 11px 14px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #a0395f;
          border-radius: 0 6px 6px 0;
          animation: fadeIn 0.3s ease;
        }

        /* Checkbox */
        .reg-checkbox-wrap {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 0;
          cursor: pointer;
        }
        .reg-checkbox-custom {
          width: 18px;
          height: 18px;
          border: 1px solid #d4b8c8;
          border-radius: 4px;
          flex-shrink: 0;
          margin-top: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .reg-checkbox-custom--checked {
          background: #c07fa5;
          border-color: #c07fa5;
        }

        /* Submit button */
        .reg-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, #3a1228 0%, #854c6f 55%, #c07fa5 100%);
          background-size: 200% auto;
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-position 0.5s, transform 0.25s, box-shadow 0.3s;
          box-shadow: 0 10px 32px rgba(133,76,111,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .reg-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(133,76,111,0.35);
        }
        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Back button */
        .reg-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9c8490;
          cursor: pointer;
          padding: 0;
          margin-bottom: 28px;
          transition: color 0.25s;
        }
        .reg-back-btn:hover { color: #c07fa5; }

        /* Success */
        .reg-success {
          text-align: center;
          padding: 40px 0;
          animation: fadeIn 0.5s ease both;
        }
        .reg-success__ring {
          width: 84px; height: 84px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8dff0, #f0c8e0);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          animation: scaleUp 0.65s cubic-bezier(0.34,1.56,0.64,1) both;
          box-shadow: 0 10px 30px rgba(192,127,165,0.25);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .reg-split { flex-direction: column !important; }
          .reg-left  { width: 100% !important; height: auto !important; position: relative !important; min-height: 300px; }
          .reg-right { padding: 40px 24px 56px !important; }
        }

        .spin-anim { animation: spin 0.9s linear infinite; }
      `}</style>

      <div className="reg-root">
        <NavBar />

        <main
          className="reg-split flex flex-grow"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(10px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          {/* ── Left panel ── */}
          <div className="reg-left">
            <img
              className="reg-left__img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiJLhu6d3twJHJo_xLY2QHNZ9DiJxb1TDHyfNXVQzjDOvDxJ6-xm5AV7g4AB04UuMDwueaD6DAFwxQ4tQ3K1CLluINhQTjouo_DeHEmii6rQqta2YMjIzJmETdIxp7bHhY5iQ2UM17krNVjdK6pDB_TY2hP5XDK0AiwhgwiSfaGKD38s-vlofbacooMKWFiG6kKB6Zsi0hL6k11jjMnUUzrS4OKKhIHW9AziqbWmNc8Ybm9CvGTV7JA0PBls83qyomYDf9Dw1AqGkN"
              alt=""
              aria-hidden="true"
            />
            <div className="reg-left__overlay" />

            {/* Rings */}
            {[360, 540, 720].map((s, i) => (
              <div
                key={i}
                className="reg-left__ring"
                style={{
                  width: s, height: s,
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  animationDelay: `${i * 1.8}s`,
                }}
              />
            ))}

            {/* Petals */}
            {PETALS.map((p, i) => <Petal key={i} {...p} />)}

            <div className="reg-left__content">
              <p className="reg-left__season">Autumn / Winter · 2025</p>
              <h2 className="reg-left__title">
                The <em>Essence</em><br />of Form
              </h2>
              <div className="reg-left__divider" />
              <p className="reg-left__desc">
                Become part of an exclusive world where luxury meets intention — crafted for those who know.
              </p>
              <div className="reg-left__perks">
                {[
                  "Early access to new collections",
                  "Private sale invitations",
                  "Seasonal lookbooks & editorials",
                  "Curated style consultations",
                ].map((perk) => (
                  <div key={perk} className="reg-left__perk">
                    <span className="reg-left__perk-dot" />
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="reg-right">
            {/* Corner deco circles */}
            <div className="reg-right__deco" style={{ width: 280, height: 280, top: -100, right: -80 }} />
            <div className="reg-right__deco" style={{ width: 200, height: 200, bottom: -60, left: -60 }} />

            <div
              className="reg-right__box"
              style={{ animation: mounted ? "fadeSlideUp 0.85s 0.3s ease both" : "none" }}
            >

              {success ? (
                /* ── Success ── */
                <div className="reg-success">
                  <div className="reg-success__ring">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c07fa5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 36,
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: "#854c6f",
                      marginBottom: 10,
                    }}
                  >
                    Welcome to the Circle.
                  </h2>
                  <p style={{ fontSize: 13, color: "#9c8490", fontWeight: 300 }}>
                    Your account is ready. Taking you home…
                  </p>
                  <div style={{ marginTop: 24, fontSize: 20, animation: "petalDrift 3s ease-in-out infinite" }}>
                    ✿
                  </div>
                </div>

              ) : (
                <>
                  {/* ── Header ── */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ width: 20, height: 0.5, background: "#c07fa5", display: "block" }} />
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c07fa5" }}>
                        Create Account
                      </span>
                    </div>
                    <h1
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(36px, 5vw, 50px)",
                        fontWeight: 300,
                        color: "#1f1a1d",
                        lineHeight: 1.1,
                        marginBottom: 10,
                      }}
                    >
                      Join the<br />
                      <em style={{ fontStyle: "italic", color: "#c07fa5" }}>Inner Circle.</em>
                    </h1>
                    <p style={{ fontSize: 13, fontWeight: 300, color: "#9c8490", lineHeight: 1.65 }}>
                      Experience a world of curated luxury and exclusive previews.
                    </p>
                  </div>

                  {/* ── Step dots ── */}
                  <StepDots current={step} total={2} />

                  {/* ── Error ── */}
                  {error && <div className="reg-error">✦ {error}</div>}

                  {/* ── Step 0: Personal info ── */}
                  {step === 0 && (
                    <form onSubmit={handleNext} style={{ animation: "slideIn 0.35s ease both" }}>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c07fa5", marginBottom: 24 }}>
                        Step 1 — Your Details
                      </p>

                      <FloatInput
                        id="name"
                        label="Full Name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Eleanor Vance"
                        required
                        autoComplete="name"
                      />
                      <FloatInput
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(+94) 77-777-7777"
                        autoComplete="tel"
                      />

                      {/* Newsletter */}
                      <div
                        className="reg-checkbox-wrap"
                        onClick={() => setForm(p => ({ ...p, newsletter: !p.newsletter }))}
                      >
                        <div className={`reg-checkbox-custom ${form.newsletter ? "reg-checkbox-custom--checked" : ""}`}>
                          {form.newsletter && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                              <polyline points="1.5 6 4.5 9 10.5 3" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 300, color: "#7a6470", lineHeight: 1.6, cursor: "pointer" }}>
                          Join the 'Inner Circle' newsletter for seasonal lookbooks and private event invitations.
                        </span>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <button className="reg-btn" type="submit">
                          Continue
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ── Step 1: Account info ── */}
                  {step === 1 && (
                    <form onSubmit={handleSubmit} style={{ animation: "slideIn 0.35s ease both" }}>
                      <button
                        type="button"
                        className="reg-back-btn"
                        onClick={() => { setStep(0); setError(""); }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back
                      </button>

                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c07fa5", marginBottom: 24 }}>
                        Step 2 — Account Access
                      </p>

                      <FloatInput
                        id="email"
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="eleanor@example.com"
                        required
                        autoComplete="email"
                      />
                      <FloatInput
                        id="password"
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        required
                        autoComplete="new-password"
                      />

                      {/* Password strength dots */}
                      {form.password.length > 0 && (
                        <div style={{ display: "flex", gap: 5, marginTop: -16, marginBottom: 24 }}>
                          {[3, 6, 9].map((threshold, i) => (
                            <span
                              key={i}
                              style={{
                                flex: 1,
                                height: 2,
                                borderRadius: 2,
                                background: form.password.length >= threshold
                                  ? i === 0 ? "#d97ca0" : i === 1 ? "#c07fa5" : "#854c6f"
                                  : "#e2cdd7",
                                transition: "background 0.3s ease",
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 8 }}>
                        <button className="reg-btn" type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <svg className="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                              </svg>
                              Creating Account…
                            </>
                          ) : (
                            <>
                              Create Account
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Legal */}
                      <p style={{ marginTop: 16, fontSize: 10, color: "#b0969e", lineHeight: 1.7, textAlign: "center" }}>
                        By creating an account you agree to our{" "}
                        <button type="button" style={{ background: "none", border: "none", color: "#c07fa5", fontSize: 10, cursor: "pointer", textDecoration: "underline", fontFamily: "'Jost', sans-serif" }}
                          onClick={() => alert("Terms of Service coming soon.")}>
                          Terms
                        </button>{" "}and{" "}
                        <button type="button" style={{ background: "none", border: "none", color: "#c07fa5", fontSize: 10, cursor: "pointer", textDecoration: "underline", fontFamily: "'Jost', sans-serif" }}
                          onClick={() => alert("Privacy Policy coming soon.")}>
                          Privacy Policy
                        </button>.
                      </p>
                    </form>
                  )}

                  {/* ── Footer ── */}
                  <div
                    style={{
                      marginTop: 40,
                      paddingTop: 24,
                      borderTop: "0.5px solid #e8d5df",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: 12, color: "#9c8490", fontWeight: 300, marginBottom: 10 }}>
                      Already part of our world?
                    </p>
                    <Link
                      to="/signin"
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#1f1a1d",
                        textDecoration: "none",
                        borderBottom: "1px solid #1f1a1d",
                        paddingBottom: 2,
                        transition: "color 0.3s, border-color 0.3s",
                      }}
                      onMouseEnter={e => { e.target.style.color = "#c07fa5"; e.target.style.borderColor = "#c07fa5"; }}
                      onMouseLeave={e => { e.target.style.color = "#1f1a1d"; e.target.style.borderColor = "#1f1a1d"; }}
                    >
                      Sign In ✦
                    </Link>
                  </div>

                </>
              )}

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Registration;