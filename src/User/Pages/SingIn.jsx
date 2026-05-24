import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

/* ── Floating blossom particle ─────────────────────────────────────────── */
function Blossom({ x, y, delay, size, char }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${size}px`,
        opacity: 0.15,
        animation: `blossomDrift ${8 + delay}s ease-in-out ${delay}s infinite`,
        pointerEvents: "none",
        userSelect: "none",
        color: "#c07fa5",
      }}
    >
      {char}
    </span>
  );
}

const BLOSSOMS = [
  { x: 5,  y: 10, delay: 0,   size: 12, char: "✿" },
  { x: 90, y: 20, delay: 1.5, size: 9,  char: "❀" },
  { x: 15, y: 70, delay: 3,   size: 11, char: "✾" },
  { x: 80, y: 80, delay: 2,   size: 8,  char: "✿" },
  { x: 50, y: 5,  delay: 4,   size: 10, char: "❀" },
  { x: 95, y: 55, delay: 0.5, size: 7,  char: "✿" },
  { x: 3,  y: 45, delay: 2.5, size: 9,  char: "✾" },
];

/* ── Animated input field ──────────────────────────────────────────────── */
function FloatInput({ id, label, type = "text", value, onChange, autoComplete, placeholder, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative mb-8">
      <label
        htmlFor={id}
        style={{
          position: "absolute",
          left: 0,
          top: lifted ? "-18px" : "14px",
          fontSize: lifted ? "9px" : "13px",
          fontWeight: 600,
          letterSpacing: lifted ? "0.28em" : "0.06em",
          textTransform: lifted ? "uppercase" : "none",
          color: focused ? "#c07fa5" : "#9c7488",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
        }}
      >
        {label}
      </label>

      {rightSlot && (
        <div className="absolute right-0 bottom-3">{rightSlot}</div>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        placeholder={focused ? placeholder : ""}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${focused ? "#c07fa5" : "#e8d5df"}`,
          padding: "12px 0 10px",
          fontSize: "15px",
          color: "#1f1a1d",
          outline: "none",
          transition: "border-color 0.3s ease",
          fontFamily: "'Jost', sans-serif",
        }}
      />

      {/* Animated underline accent */}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "1.5px",
          width: focused ? "100%" : "0%",
          background: "linear-gradient(90deg, #c07fa5, #e8acd0)",
          transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

/* ── Main SignIn ────────────────────────────────────────────────────────── */
export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const from = location.state?.from?.pathname;

  function roleRedirect(role) {
    if (role === "Admin" || role === "SuperAdmin") return "/admin";
    if (from && from !== "/signin" && from !== "/signup") return from;
    return "/";
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email or username."); return; }
    if (!password)     { setError("Please enter your password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      setSuccess(true);
      setTimeout(() => navigate(roleRedirect(result.role), { replace: true }), 1400);
    }, 900);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes blossomDrift {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          33%       { transform: translateY(-18px) rotate(15deg) scale(1.1); }
          66%       { transform: translateY(-8px) rotate(-8deg) scale(0.95); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes petalspin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.18; }
          50%       { transform: scale(1.06); opacity: 0.3; }
        }

        ::selection { background: #e8acd0; color: #4a193a; }

        .si-root {
          font-family: 'Jost', sans-serif;
          background: #fdf7fa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Decorative left panel ── */
        .si-left {
          position: relative;
          width: 45%;
          background: linear-gradient(145deg, #2a0e20 0%, #3d1530 40%, #5c2245 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 56px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .si-left__bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.22;
          mix-blend-mode: luminosity;
        }

        .si-left__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom,
            rgba(42,14,32,0.45) 0%,
            rgba(92,34,69,0.25) 50%,
            rgba(42,14,32,0.7) 100%
          );
        }

        .si-left__ring {
          position: absolute;
          border: 0.5px solid rgba(224,163,200,0.2);
          border-radius: 50%;
          animation: ringPulse 6s ease-in-out infinite;
        }

        .si-left__content {
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .si-left__eyebrow {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #e0a3c8;
          margin-bottom: 20px;
          opacity: 0.85;
        }

        .si-left__brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 6vw, 80px);
          font-weight: 300;
          color: #ffffff;
          letter-spacing: 0.12em;
          line-height: 1;
          margin-bottom: 6px;
        }

        .si-left__brand span {
          color: #e0a3c8;
        }

        .si-left__tagline {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          margin-bottom: 40px;
        }

        .si-left__divider {
          width: 40px;
          height: 0.5px;
          background: linear-gradient(90deg, transparent, #e0a3c8, transparent);
          margin: 0 auto 40px;
        }

        .si-left__quote {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(16px, 1.8vw, 22px);
          font-weight: 300;
          color: rgba(255,255,255,0.75);
          line-height: 1.55;
          max-width: 300px;
          text-align: center;
        }

        .si-left__badge {
          margin-top: 40px;
          padding: 8px 20px;
          border: 0.5px solid rgba(224,163,200,0.3);
          border-radius: 30px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #e0a3c8;
        }

        /* ── Right form panel ── */
        .si-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          background: #fdf7fa;
          position: relative;
          overflow: hidden;
        }

        .si-right__corner-deco {
          position: absolute;
          width: 220px;
          height: 220px;
          border: 0.5px solid rgba(192,127,165,0.12);
          border-radius: 50%;
          pointer-events: none;
        }

        .si-right__form-box {
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 1;
        }

        /* ── Demo hint ── */
        .si-demo-hint {
          background: #fcf3f8;
          border: 0.5px solid #e8d5df;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 28px;
          font-size: 10.5px;
          line-height: 1.8;
          color: #7a5468;
        }

        /* ── Error ── */
        .si-error {
          border-left: 2px solid #d97ca0;
          background: #fef0f5;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #a0395f;
          border-radius: 0 6px 6px 0;
          animation: fadeIn 0.3s ease;
        }

        /* ── CTA Button ── */
        .si-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, #3d1530 0%, #854c6f 60%, #c07fa5 100%);
          background-size: 200% auto;
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-position 0.5s ease, transform 0.25s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 32px rgba(133,76,111,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .si-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(133,76,111,0.38);
        }
        .si-btn:active:not(:disabled) { transform: translateY(0); }
        .si-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── Success screen ── */
        .si-success {
          text-align: center;
          padding: 32px 0;
          animation: fadeIn 0.5s ease both;
        }
        .si-success__ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8dff0, #f0c8e0);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          animation: successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
          box-shadow: 0 8px 24px rgba(192,127,165,0.25);
        }

        /* ── Mobile card wrapper ── */
        @media (max-width: 768px) {
          .si-split { flex-direction: column !important; }
          .si-left  { width: 100% !important; padding: 56px 32px 40px !important; min-height: 260px; }
          .si-right { padding: 40px 24px 56px !important; }
        }

        .spin { animation: petalspin 1s linear infinite; }
      `}</style>

      <div className="si-root">
        <NavBar />

        <main
          className="flex-grow flex items-stretch"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div className="si-split flex w-full">

            {/* ── Left decorative panel ── */}
            <div className="si-left">
              <img
                className="si-left__bg-img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlIkSHz6pKqvTN0jzSue182U9oHit9JOzgYuuNLnlTfpknkBrUTqPa1fQWx3YEm402Vi37fn_NSWxcRvdONEu2E6MqiFynup-rD73_hV8WyZ_7_ImPs60inXKoZv6RBz3RHRFgfiVKwOy-IQtI8xaAdGAGDMo-cYfEgwqfvnSeO5jQjHKRZk66Qe46tVRorfkqec9BxlyY2eMuuSw1ae0jkCHwuUsDSAW8_iOmKZJQs6QpcoBSfwczHz63ar-bQK_0wC-J54UJa8XS"
                alt=""
                aria-hidden="true"
              />
              <div className="si-left__overlay" />

              {/* Decorative rings */}
              {[320, 480, 640].map((s, i) => (
                <div
                  key={i}
                  className="si-left__ring"
                  style={{
                    width: s, height: s,
                    animationDelay: `${i * 1.5}s`,
                  }}
                />
              ))}

              {/* Floating blossoms */}
              {BLOSSOMS.map((b, i) => (
                <Blossom key={i} {...b} />
              ))}

              <div
                className="si-left__content"
                style={{ animation: mounted ? "fadeSlideUp 0.9s 0.2s ease both" : "none" }}
              >
                <p className="si-left__eyebrow">The House of</p>
                <h2 className="si-left__brand">HU<span>E</span>S</h2>
                <p className="si-left__tagline">Curated Essence · 2025</p>
                <div className="si-left__divider" />
                <blockquote className="si-left__quote">
                  "Elegance is not about being noticed — it's about being remembered."
                </blockquote>
                <div className="si-left__badge">Est. MMXXIV</div>
              </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="si-right">

              {/* Corner decorations */}
              <div className="si-right__corner-deco" style={{ top: -80, right: -80 }} />
              <div className="si-right__corner-deco" style={{ bottom: -100, left: -100 }} />

              <div
                className="si-right__form-box"
                style={{ animation: mounted ? "fadeSlideUp 0.9s 0.35s ease both" : "none" }}
              >

                {success ? (
                  /* ── Success state ── */
                  <div className="si-success">
                    <div className="si-success__ring">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c07fa5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 32,
                        fontWeight: 300,
                        fontStyle: "italic",
                        color: "#854c6f",
                        marginBottom: 8,
                      }}
                    >
                      Welcome back.
                    </h2>
                    <p style={{ fontSize: 13, color: "#9c7488", fontWeight: 300 }}>
                      Redirecting you now…
                    </p>
                    <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                      <span style={{ fontSize: 22, animation: "blossomDrift 2s ease-in-out infinite" }}>✿</span>
                    </div>
                  </div>

                ) : (
                  <>
                    {/* ── Header ── */}
                    <header style={{ marginBottom: 36, animation: mounted ? "fadeSlideUp 0.7s 0.45s ease both" : "none" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        <span style={{ width: 20, height: 0.5, background: "#c07fa5", display: "block" }} />
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: "#c07fa5",
                          }}
                        >
                          Member Access
                        </span>
                      </div>
                      <h1
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "clamp(34px, 5vw, 46px)",
                          fontWeight: 300,
                          color: "#1f1a1d",
                          lineHeight: 1.1,
                          marginBottom: 8,
                        }}
                      >
                        Welcome<br />
                        <em style={{ fontStyle: "italic", color: "#c07fa5" }}>back.</em>
                      </h1>
                      <p style={{ fontSize: 13, fontWeight: 300, color: "#9c7488", lineHeight: 1.6 }}>
                        Sign in to your HUES account to continue.
                      </p>
                    </header>

                    {/* ── Demo hint ── */}
                    <div
                      className="si-demo-hint"
                      style={{ animation: mounted ? "fadeSlideUp 0.7s 0.5s ease both" : "none" }}
                    >
                      <strong style={{ color: "#854c6f" }}>✦ Demo Accounts</strong><br />
                      admin@hues.com / admin123 &nbsp;<span style={{ color: "#c07fa5" }}>Admin</span><br />
                      super@hues.com / super123 &nbsp;<span style={{ color: "#c07fa5" }}>SuperAdmin</span><br />
                      user@hues.com / user123 &nbsp;&nbsp;&nbsp;<span style={{ color: "#c07fa5" }}>User</span>
                    </div>

                    {/* ── Error ── */}
                    {error && <div className="si-error">✦ {error}</div>}

                    {/* ── Form ── */}
                    <form
                      onSubmit={handleSubmit}
                      style={{ animation: mounted ? "fadeSlideUp 0.7s 0.55s ease both" : "none" }}
                    >
                      <FloatInput
                        id="email"
                        label="Email or Username"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        placeholder="e.g. email@example.com"
                      />

                      <FloatInput
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        rightSlot={
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.1em",
                              color: "#c07fa5",
                              cursor: "pointer",
                              textDecoration: "underline",
                              textUnderlineOffset: 3,
                              fontFamily: "'Jost', sans-serif",
                            }}
                            onClick={() => alert("Password reset is not yet implemented.")}
                          >
                            Forgot?
                          </button>
                        }
                      />

                      <div style={{ marginTop: 8 }}>
                        <button className="si-btn" type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <svg
                                className="spin"
                                width="14" height="14"
                                viewBox="0 0 24 24" fill="none"
                              >
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                              </svg>
                              Verifying…
                            </>
                          ) : (
                            <>
                              Enter the World
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* ── Footer ── */}
                    <div
                      style={{
                        marginTop: 36,
                        paddingTop: 24,
                        borderTop: "0.5px solid #e8d5df",
                        textAlign: "center",
                        animation: mounted ? "fadeSlideUp 0.7s 0.65s ease both" : "none",
                      }}
                    >
                      <p style={{ fontSize: 12, color: "#9c7488", fontWeight: 300, marginBottom: 10 }}>
                        New to the world of HUES?
                      </p>
                      <Link
                        to="/signup"
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
                        onMouseEnter={e => {
                          e.target.style.color = "#c07fa5";
                          e.target.style.borderColor = "#c07fa5";
                        }}
                        onMouseLeave={e => {
                          e.target.style.color = "#1f1a1d";
                          e.target.style.borderColor = "#1f1a1d";
                        }}
                      >
                        Join the Inner Circle ✦
                      </Link>
                    </div>

                  </>
                )}

              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}