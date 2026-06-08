import { useState } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { apiFetch } from "../../api/client";

function IconBase({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const IconUser = (props) => (
  <IconBase {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7.5" r="3.5" />
  </IconBase>
);

const IconMail = (props) => (
  <IconBase {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </IconBase>
);

const IconMessage = (props) => (
  <IconBase {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconBase>
);

const IconClock = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" />
  </IconBase>
);

const IconPhone = (props) => (
  <IconBase {...props}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" />
  </IconBase>
);

const IconSparkle = (props) => (
  <IconBase {...props}>
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
    <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
  </IconBase>
);

const IconLocation = (props) => (
  <IconBase {...props}>
    <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </IconBase>
);

const IconSend = (props) => (
  <IconBase {...props}>
    <path d="M5 12h13" />
    <path d="M12 5l7 7-7 7" />
  </IconBase>
);

const IconInstagram = (props) => (
  <IconBase {...props}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="17" cy="7" r="1" />
  </IconBase>
);

const IconPinterest = (props) => (
  <IconBase {...props}>
    <path d="M12 21c1.5 0 3-5 3-8.5a4.5 4.5 0 1 0-6.6 4" />
    <circle cx="12" cy="12" r="8" />
  </IconBase>
);

const IconLinkedIn = (props) => (
  <IconBase {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 11v5" />
    <path d="M8 8.5h0" />
    <path d="M12 16v-3a2 2 0 0 1 4 0v3" />
  </IconBase>
);

/* ─── Inject styles ────────────────────────────────────────────────────── */
const STYLES = `
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::selection { background: var(--color-primary-container); color: #3a0f28; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-surface-container-low); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(var(--color-primary-container), var(--color-primary-container)); border-radius: 6px; }

  @keyframes floatUp  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  @keyframes drift    { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-14px) rotate(3deg); } }
  @keyframes shimmer  { 0% { background-position:-300% center; } 100% { background-position:300% center; } }
  @keyframes pulseRing{ 0%,100%{ transform:scale(1); opacity:.5; } 50%{ transform:scale(1.15); opacity:1; } }
  @keyframes lineGrow { from { transform:scaleX(0); } to { transform:scaleX(1); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes confettiFall {
    0%   { transform: translateY(-20px) rotate(0deg);   opacity:1; }
    100% { transform: translateY(120px) rotate(720deg); opacity:0; }
  }
  @keyframes bgShift  { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
  @keyframes petalSpin{ 0%{ transform:rotate(0deg) scale(1); opacity:.7; } 100%{ transform:rotate(360deg) scale(1.2); opacity:0; } }

  .font-display { font-family:Gillie Quest; }
  .font-body    { font-family: 'Italiana', serif; }

  .contact-bg {
    background: linear-gradient(-45deg, var(--color-surface), var(--color-surface), var(--color-surface-container-low), var(--color-surface));
    background-size: 400% 400%;
    animation: bgShift 14s ease infinite;
    min-height:100vh;
  }
  .contact-bg.dark {
    background: linear-gradient(-45deg, var(--color-surface-container-highest), var(--color-surface-container-highest), var(--color-surface-container-highest), var(--color-surface-container-highest));
    background-size: 400% 400%;
  }

  .shimmer-title {
    background: linear-gradient(90deg,var(--color-primary) 0%,var(--color-primary-container) 30%,var(--color-primary-container) 50%,var(--color-primary-container) 70%,var(--color-primary) 100%);
    background-size: 300% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 5s linear infinite;
  }
  .shimmer-title.dark {
    background: linear-gradient(90deg,var(--color-primary-container) 0%,var(--color-primary-container) 30%,var(--color-surface-container-low) 50%,var(--color-primary-container) 70%,var(--color-primary-container) 100%);
    background-size: 300% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .glass-card {
    background: var(--color-surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(220,160,190,0.25);
    box-shadow: 0 8px 40px rgba(180,60,110,0.08), 0 1px 0 var(--color-surface) inset;
    transition: box-shadow .4s, transform .4s;
  }
  .glass-card:hover {
    box-shadow: 0 16px 60px rgba(180,60,110,0.14);
    transform: translateY(-3px);
  }
  .glass-card.dark {
    background: rgba(28,14,22,0.82);
    border: 1px solid rgba(130,60,100,0.30);
    box-shadow: 0 8px 40px rgba(0,0,0,0.40);
  }
  .glass-card.dark:hover { box-shadow: 0 16px 60px rgba(0,0,0,0.55); }

  .field-line-anim { animation: lineGrow 0.45s cubic-bezier(.4,0,.2,1) forwards; }

  .petal-float { animation: drift 5s ease-in-out infinite; }

  .toggle-pill {
    width:50px; height:28px; border-radius:999px; cursor:pointer; border:none; outline:none;
    position:relative; transition:background .35s;
  }
  .toggle-knob {
    position:absolute; top:4px; left:4px; width:20px; height:20px;
    border-radius:50%; background:var(--color-on-primary);
    box-shadow:0 1px 4px rgba(0,0,0,.18);
    transition:transform .32s cubic-bezier(.4,0,.2,1);
  }
  .toggle-pill.on .toggle-knob { transform:translateX(22px); }

  .info-pill {
    font-family: 'Italiana', serif; font-size:10px; font-weight:600;
    letter-spacing:.12em; text-transform:uppercase;
    padding:3px 10px; border-radius:999px;
    background:rgba(200,120,160,0.12); color:var(--color-primary);
    display:inline-block;
  }
  .info-pill.dark { background:rgba(180,80,130,0.20); color:var(--color-primary-container); }

  .send-btn {
    position:relative; overflow:hidden; border:none; cursor:pointer;
    font-family: 'Italiana', serif; font-size:11px; font-weight:700;
    letter-spacing:.20em; text-transform:uppercase;
    padding:15px 40px; border-radius:999px;
    color:var(--color-on-primary); transition:transform .3s, box-shadow .3s;
    background:linear-gradient(135deg,var(--color-primary),var(--color-primary-container),var(--color-primary-container));
    background-size:200% auto;
  }
  .send-btn:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 10px 32px rgba(168,56,94,0.35); background-position:right center; }
  .send-btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%);
    transform:translateX(-100%); transition:transform .6s;
  }
  .send-btn:hover::before { transform:translateX(100%); }
  .send-btn.dark { background:linear-gradient(135deg,var(--color-primary),var(--color-primary-container),var(--color-primary-container)); }

  .social-btn {
    display:inline-flex; align-items:center; gap:6px;
    font-family: 'Italiana', serif; font-size:12px; font-weight:500;
    color:var(--color-on-surface-variant); border:1px solid rgba(200,120,160,0.35);
    padding:8px 16px; border-radius:999px;
    background:var(--color-surface); cursor:pointer; border-style:solid;
    transition:all .3s;
  }
  .social-btn:hover { background:rgba(200,120,160,0.15); transform:translateY(-2px); box-shadow:0 4px 16px rgba(180,60,110,0.12); }
  .social-btn.dark { color:var(--color-outline); border-color:rgba(160,80,120,0.40); background:rgba(28,14,22,0.60); }
  .social-btn.dark:hover { background:rgba(160,80,120,0.20); }

  .confetti-piece {
    position:absolute; width:8px; height:8px; border-radius:2px;
    animation:confettiFall .9s ease forwards;
    pointer-events:none;
  }

  .fade-in-1 { animation: floatUp 0.75s 0.05s ease both; }
  .fade-in-2 { animation: floatUp 0.75s 0.18s ease both; }
  .fade-in-3 { animation: floatUp 0.75s 0.30s ease both; }
  .fade-in-4 { animation: floatUp 0.75s 0.42s ease both; }
  .fade-in-5 { animation: floatUp 0.75s 0.55s ease both; }
  .fade-in-6 { animation: floatUp 0.75s 0.66s ease both; }

  .newsletter-bg {
    background: linear-gradient(135deg,var(--color-primary),var(--color-primary-container),var(--color-primary-container),var(--color-primary-container),var(--color-primary));
    background-size:300% auto; animation: shimmer 6s linear infinite;
  }
  .newsletter-bg.dark {
    background: linear-gradient(135deg,var(--color-primary),var(--color-primary-container),var(--color-primary-container),var(--color-primary-container),var(--color-primary));
    background-size:300% auto;
  }
`;

      <NavBar />

/* ─── Decorative petal ──────────────────────────────────────────────────── */
function Petal({ style }) {
  return (
    <div
      className="petal-float pointer-events-none select-none"
      style={{ position: "absolute", fontSize: 22, opacity: 0.18, ...style }}
      aria-hidden="true"
    >
      ✿
    </div>
  );
}

/* ─── Underline field ───────────────────────────────────────────────────── */
function Field({ label, type = "text", placeholder, rows, icon, value, onChange, dark: isDark }) {
  const [focused, setFocused] = useState(false);
  const Tag = rows ? "textarea" : "input";
  return (
    <div className="mb-7 group">
      <label
        className="font-body flex items-center gap-2 mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}
      >
        <span style={{ display: "inline-flex", width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>{icon}</span>
        {label}
      </label>
      <div className="relative">
        <Tag
          type={type}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="font-body w-full bg-transparent outline-none resize-none py-3 text-[15px] leading-relaxed"
          style={{
            borderBottom: `1.5px solid ${focused ? (isDark ? "var(--color-primary-container)" : "var(--color-primary-container)") : (isDark ? "rgba(150,70,100,0.40)" : "rgba(200,150,180,0.45)")}`,
            color: isDark ? "var(--color-surface)" : "var(--color-on-surface)",
            transition: "border-color .3s",
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-0.5 origin-left"
          style={{
            width: "100%",
            background: "linear-gradient(90deg,var(--color-primary-container),var(--color-primary-container))",
            transform: focused ? "scaleX(1)" : "scaleX(0)",
            transition: "transform .45s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Info card ─────────────────────────────────────────────────────────── */
function InfoCard({ title, icon, children, dark: isDark }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className={`glass-card${isDark ? " dark" : ""} rounded-2xl p-6`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: hov
              ? "linear-gradient(135deg,var(--color-primary),var(--color-primary-container))"
              : isDark ? "rgba(180,60,110,0.20)" : "rgba(200,120,160,0.12)",
          }}
        >
          <span style={{ display: "inline-flex", width: 18, height: 18, alignItems: "center", justifyContent: "center", color: hov ? "var(--color-on-primary)" : "inherit", transition: "color .3s" }}>{icon}</span>
        </div>
        <h3
          className="font-body text-[10.5px] font-semibold tracking-[0.18em] uppercase"
          style={{ color: isDark ? "var(--color-outline)" : "var(--color-primary)" }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ─── Confetti ──────────────────────────────────────────────────────────── */
function Confetti() {
  const colors = ["var(--color-primary-container)","var(--color-primary-container)","var(--color-primary-container)","var(--color-primary-container)","var(--color-primary-container)","var(--color-surface)"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: 0,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Contact form grid ─────────────────────────────────────────────────── */
function ContactGrid({ isDark }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields before sending your message.");
      return;
    }

    setSending(true);
    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Failed to send your message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
      {/* Form card */}
      <div className={`glass-card${isDark ? " dark" : ""} rounded-3xl p-8 md:p-12 relative overflow-hidden`}>
        {/* Decorative corner petals */}
        <Petal style={{ top: 16, right: 24, animationDelay: "0s" }} />
        <Petal style={{ bottom: 24, left: 16, animationDelay: "1.5s", fontSize: 16 }} />

        {submitted ? (
          <div className="py-16 text-center relative">
            <Confetti />
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,var(--color-primary),var(--color-primary-container))", fontSize: 32 }}
            >
              <IconSparkle size={30} />
            </div>
            <p
              className="font-display text-3xl mb-3"
              style={{ color: isDark ? "var(--color-primary-container)" : "var(--color-primary)" }}
            >
              Thank you, lovely.
            </p>
            <p className="font-body text-[14px]" style={{ color: isDark ? "var(--color-outline)" : "var(--color-outline)" }}>
              Our team will respond within 24 hours. <span style={{ display: "inline-flex", verticalAlign: "middle" }}><IconSparkle size={14} /></span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-10">
              <div
                className="inline-flex w-14 h-14 rounded-full items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg,rgba(200,120,160,0.15),rgba(240,180,210,0.10))", fontSize: 26 }}
              >
                <IconMail size={26} />
              </div>
              <h3 className="font-display text-3xl mb-1" style={{ color: isDark ? "var(--color-surface)" : "var(--color-on-surface)" }}>
                Send us a message
              </h3>
              <p className="font-body text-[13px]" style={{ color: isDark ? "var(--color-outline)" : "var(--color-outline)" }}>
                We'd love to hear from you, darling.
              </p>
            </div>

            <Field label="Full Name"      icon={<IconUser size={16} />} placeholder="Sofia Valentini"         value={form.name}    onChange={e => setForm({ ...form, name: e.target.value })}    dark={isDark} />
            <Field label="Email Address"  icon={<IconMail size={16} />} type="email" placeholder="sofia@example.com" value={form.email}   onChange={e => setForm({ ...form, email: e.target.value })}   dark={isDark} />
            <Field label="Your Message"   icon={<IconMessage size={16} />}  rows={4} placeholder="How can we help you today?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} dark={isDark} />

            {error ? (
              <div className="font-body text-[13px] mt-3" style={{ color: "var(--color-primary-container)" }}>
                {error}
              </div>
            ) : null}

            <div className="flex justify-center mt-8">
              <button type="submit" className={`send-btn${isDark ? " dark" : ""}`} disabled={sending}>
                {sending ? "Sending..." : "Send Inquiry"}
                <span className="inline-flex ml-2 align-middle"><IconSend size={16} /></span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-5">
        {/* Decorative image panel */}
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 220 }}>
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: isDark
                ? "linear-gradient(135deg,var(--color-surface-container-highest),var(--color-surface-container-highest),var(--color-surface-container-highest))"
                : "linear-gradient(135deg,var(--color-surface-container-low),var(--color-surface-container-low),var(--color-surface-container-low))",
            }}
          >
            <div className="text-center">
              <div className="font-display text-7xl" style={{ color: isDark ? "rgba(200,120,160,0.25)" : "rgba(180,80,130,0.18)", lineHeight: 1 }}>HUES</div>
              <div className="font-body text-[11px] tracking-[0.32em] uppercase mt-2" style={{ color: isDark ? "var(--color-outline)" : "var(--color-primary-container)" }}>Atelier — Milan</div>
            </div>
          </div>
          {/* badge */}
          <span
            className="absolute bottom-3 left-3 font-body text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full"
            style={{
              background: isDark ? "rgba(28,14,22,0.88)" : "var(--color-surface)",
              color: isDark ? "var(--color-outline)" : "var(--color-primary)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><IconLocation size={14} /></span> Our Atelier
          </span>
        </div>

        <InfoCard title="Concierge Hours" icon={<IconClock size={16} />} dark={isDark}>
          <p className="font-body text-[13px] leading-relaxed mb-1" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>Monday — Friday · 09:00–18:00 CET</p>
          <p className="font-body text-[13px] leading-relaxed mb-3" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>Saturday · 10:00–14:00 CET</p>
          <span className={`info-pill${isDark ? " dark" : ""}`}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 5 }}><IconSparkle size={12} /></span>Urgent inquiries welcome</span>
        </InfoCard>

        <InfoCard title="Direct Contact" icon={<IconPhone size={16} />} dark={isDark}>
          <p className="font-body text-[13px] mb-1" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>concierge@hues.com</p>
          <p className="font-body text-[13px] mb-3" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>+44 (0) 20 7946 0123</p>
          <div className="flex gap-2 flex-wrap">
            {["WhatsApp", "Telegram"].map(s => (
              <span key={s} className={`info-pill${isDark ? " dark" : ""}`}>{s}</span>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Follow Our Journal" icon={<IconSparkle size={16} />} dark={isDark}>
          <div className="flex flex-wrap gap-2 mt-1">
            {[{ n: "Instagram", e: <IconInstagram size={14} /> }, { n: "Pinterest", e: <IconPinterest size={14} /> }, { n: "LinkedIn", e: <IconLinkedIn size={14} /> }].map(s => (
              <button key={s.n} type="button" className={`social-btn${isDark ? " dark" : ""}`}>
                <span>{s.e}</span> {s.n}
              </button>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

/* ─── Location section ──────────────────────────────────────────────────── */
function LocationSection({ isDark }) {
  return (
    <section className="mt-28 pt-14" style={{ borderTop: `1px solid ${isDark ? "rgba(130,50,90,0.30)" : "rgba(210,150,180,0.30)"}` }}>
      <div className="text-center mb-14">
        <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🌿</span>
        <h2 className="font-display text-4xl md:text-5xl" style={{ color: isDark ? "var(--color-surface)" : "var(--color-on-surface)" }}>
          Visit Our Atelier
        </h2>
        <div className="mx-auto mt-3 h-px w-16 origin-left" style={{ background: "linear-gradient(90deg,var(--color-primary-container),transparent)", animationName: "lineGrow", animationDuration: "0.8s", animationFillMode: "both" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Map-ish decorative panel */}
        <div className={`glass-card${isDark ? " dark" : ""} rounded-2xl overflow-hidden`} style={{ aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? "radial-gradient(ellipse at 30% 40%, rgba(180,60,110,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(120,40,80,0.14) 0%, transparent 60%)"
                : "radial-gradient(ellipse at 30% 40%, rgba(240,180,210,0.35) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(200,140,180,0.22) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 text-center">
            <div style={{ fontSize: 48, marginBottom: 8, display: "inline-flex" }}><IconLocation size={48} /></div>
            <div className="font-display text-xl" style={{ color: isDark ? "var(--color-primary-container)" : "var(--color-primary)" }}>Via della Spiga, 14</div>
            <div className="font-body text-[13px] mt-1" style={{ color: isDark ? "var(--color-outline)" : "var(--color-outline)" }}>Milano MI, Italy</div>
          </div>
          {/* Decorative grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute w-full" style={{ top: `${15 + i * 18}%`, height: 1, background: isDark ? "rgba(180,80,130,0.08)" : "rgba(200,130,170,0.12)" }} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute h-full" style={{ left: `${10 + i * 20}%`, width: 1, background: isDark ? "rgba(180,80,130,0.08)" : "rgba(200,130,170,0.12)" }} />
          ))}
        </div>

        <div className="space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-px" style={{ background: "linear-gradient(90deg,var(--color-primary-container),transparent)" }} />
            <span className="font-body text-[10.5px] font-semibold tracking-[0.22em] uppercase" style={{ color: isDark ? "var(--color-outline)" : "var(--color-primary)" }}>The Atelier</span>
          </div>

          <h2 className="font-display text-5xl md:text-6xl" style={{ color: isDark ? "var(--color-surface)" : "var(--color-on-surface)", lineHeight: 1.05 }}>
            Milan Flagship
          </h2>

          <p className="font-body text-[15px] leading-relaxed" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>
            Via della Spiga, 14<br />20121 Milano MI, Italy<br />
            <span style={{ fontSize: 13, opacity: .8 }}>🚇 Montenapoleone (2 min walk)</span>
          </p>

          <div
            className="p-4 rounded-xl"
            style={{ background: isDark ? "rgba(180,60,110,0.10)" : "rgba(240,180,210,0.18)" }}
          >
            <p className="font-body text-[13px] leading-relaxed" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>
              "Appointments recommended for private viewings and bespoke consultations."
            </p>
          </div>

          <div className="flex gap-3 justify-center lg:justify-start pt-2 flex-wrap">
            <button
              type="button"
              className="font-body text-[11px] font-bold tracking-[0.16em] uppercase px-6 py-3 rounded-full text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,var(--color-primary),var(--color-primary-container))", boxShadow: "0 4px 16px rgba(168,56,94,0.28)" }}
            >
              Book Appointment
            </button>
            <button
              type="button"
              className="font-body text-[11px] font-bold tracking-[0.16em] uppercase px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5"
              style={{
                border: `2px solid ${isDark ? "rgba(200,110,160,0.50)" : "rgba(168,56,94,0.45)"}`,
                color: isDark ? "var(--color-outline)" : "var(--color-primary)",
                background: "transparent",
              }}
            >
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Newsletter ────────────────────────────────────────────────────────── */
function Newsletter({ isDark }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email) { setDone(true); setTimeout(() => { setDone(false); setEmail(""); }, 3000); }
  };

  return (
    <section className={`mt-24 py-16 px-8 md:px-20 rounded-3xl text-center relative overflow-hidden newsletter-bg${isDark ? " dark" : ""}`}>
      <Petal style={{ top: 18, left: "8%", color: "var(--color-on-primary)", animationDelay: "0s" }} />
      <Petal style={{ top: 30, right: "6%", color: "var(--color-on-primary)", animationDelay: "1.2s", fontSize: 16 }} />
      <Petal style={{ bottom: 18, left: "20%", color: "var(--color-on-primary)", animationDelay: "2s", fontSize: 14 }} />

      <div className="max-w-2xl mx-auto relative z-10">
        <div style={{ fontSize: 36, marginBottom: 8, display: "inline-flex" }}><IconMail size={36} /></div>
        <h3 className="font-display text-3xl md:text-4xl text-white mb-2">Stay Connected</h3>
        <p className="font-body text-[14px] mb-8" style={{ color: "var(--color-surface)" }}>
          Receive updates on new collections, exclusive events, and design insights.
        </p>
        {done ? (
          <div className="font-body text-white text-[15px] font-medium py-3 px-6 rounded-full" style={{ background: "var(--color-surface)", backdropFilter: "blur(8px)" }}>
            🎉 Thank you for subscribing! You're wonderful.
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="font-body flex-1 px-5 py-3 rounded-full border-none outline-none text-[var(--color-on-surface)] text-[14px]"
              style={{ background: "var(--color-surface)" }}
            />
            <button
              type="submit"
              className="font-body font-bold text-[11px] tracking-[0.16em] uppercase px-6 py-3 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ background: "var(--color-surface)", color: "var(--color-on-primary)", backdropFilter: "blur(8px)", border: "1px solid var(--color-surface)" }}
            >
              Subscribe 💖
            </button>
          </form>
        )}
        <p className="font-body text-[10px] mt-4" style={{ color: "var(--color-surface)" }}>
          Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function Contact() {
  const [isDark, setIsDark] = useState(false);

  return (
    <>
      <style>{STYLES}</style>
      <div className={`contact-bg${isDark ? " dark" : ""} transition-colors duration-500`}>

        {/* ── Minimal top bar with toggle ── */}
        <div> <NavBar />
        
          <span className="font-display text-2xl" style={{ color: isDark ? "var(--color-primary-container)" : "var(--color-primary)" }}>HUES</span>
          <div className="flex items-center gap-3">
            <span className="font-body text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: isDark ? "var(--color-outline)" : "var(--color-primary-container)" }}>
              {isDark ? "Dark" : "Light"}
            </span>
            <button
              className={`toggle-pill${isDark ? " on" : ""}`}
              style={{ background: isDark ? "var(--color-primary)" : "var(--color-primary-container)" }}
              onClick={() => setIsDark(d => !d)}
              aria-label="Toggle dark mode"
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        <main className="max-w-[1380px] mx-auto px-6 md:px-16 lg:px-24 pt-36 pb-24">

          {/* ── Hero ── */}
          <section className="mb-20 text-center">
            <div
              className="font-body inline-flex items-center gap-2 px-5 py-2 rounded-full mb-7 fade-in-1"
              style={{
                background: isDark ? "rgba(180,60,110,0.15)" : "rgba(200,120,160,0.10)",
                border: `1px solid ${isDark ? "rgba(180,60,110,0.25)" : "rgba(200,120,160,0.20)"}`,
                color: isDark ? "var(--color-outline)" : "var(--color-primary)",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
              }}
            >
              <span>📬</span> Get in Touch
            </div>

            <h1
              className={`font-display fade-in-2`}
              style={{
                fontSize: "clamp(48px,7vw,88px)",
                lineHeight: 1.05,
                marginBottom: 16,
                color: isDark ? "var(--color-surface)" : "var(--color-on-surface)",
              }}
            >
              Connect with{" "}
              <span className={`shimmer-title${isDark ? " dark" : ""}`}>HUES</span>
            </h1>

            {/* Decorative rule */}
            <div className="flex items-center justify-center gap-4 mb-8 fade-in-3">
              <div className="h-px w-12" style={{ background: "linear-gradient(90deg,transparent,var(--color-primary-container))" }} />
              <span style={{ color: "var(--color-primary-container)", fontSize: 16, display: "inline-flex" }}><IconSparkle size={16} /></span>
              <div className="h-px w-12" style={{ background: "linear-gradient(90deg,var(--color-primary-container),transparent)" }} />
            </div>

            <p
              className="font-body text-[16px] md:text-[17px] leading-relaxed max-w-2xl mx-auto fade-in-4"
              style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}
            >
              We believe in deliberate conversation and timeless service. Whether you have a question
              about our collections or a bespoke request, we are here to assist.
            </p>
          </section>

          {/* ── Contact grid ── */}
          <div className="fade-in-5">
            <ContactGrid isDark={isDark} />
          </div>

          {/* ── Location ── */}
          <div className="fade-in-6">
            <LocationSection isDark={isDark} />
          </div>

          {/* ── Newsletter ── */}
          <Newsletter isDark={isDark} />

        </main>
        <Footer />
      </div>
    </>
  );
}


