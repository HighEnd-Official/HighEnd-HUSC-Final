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

const IconFacebook = (props) => (
  <IconBase {...props}>
    <path d="M15 8h-2a2 2 0 0 0-2 2v2H9v3h2v5h3v-5h2.2l.5-3H14v-1.5c0-.4.2-.5.6-.5H17V8h-2z" />
  </IconBase>
);

const IconTikTok = (props) => (
  <IconBase {...props}>
    <path d="M14 3v10.3a3.7 3.7 0 1 1-3.7-3.7c.4 0 .8.1 1.2.2" />
    <path d="M14 3c.5 3 2.2 4.7 5 5" />
  </IconBase>
);

const SOCIAL_LINKS = [
  {
    n: "Instagram",
    url: "https://www.instagram.com/huesforever?igsh=ZGQzZXcwemVsc3B0&utm_source=qr",
    e: <IconInstagram size={14} />,
  },
  {
    n: "Facebook",
    url: "https://www.facebook.com/share/1BY7ewmvLN/?mibextid=wwXIfr",
    e: <IconFacebook size={14} />,
  },
  {
    n: "TikTok",
    url: "https://www.tiktok.com/@huesforever?_r=1&_t=ZS-91WObW5NP3R",
    e: <IconTikTok size={14} />,
  },
];

/* ─── Inject styles ────────────────────────────────────────────────────── */
const STYLES = `
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::selection { background: var(--color-primary-container); color: var(--color-on-primary-container); }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-surface-container-low); }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(var(--color-primary), var(--color-primary-container));
    border-radius: 999px;
  }

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

  .font-display { font-family: 'Gillie Quest', 'Cormorant Garamond', Georgia, serif; }
  .font-body    { font-family: 'Manrope', 'Inter', system-ui, sans-serif; }

  .contact-bg {
    --contact-bg: var(--color-surface);
    --contact-bg-soft: var(--color-surface-container-low);
    --contact-bg-raised: var(--color-surface-container);
    --contact-bg-strong: var(--color-surface-container-high);
    --contact-text: var(--color-on-surface);
    --contact-muted: var(--color-on-surface-variant);
    --contact-soft: var(--color-outline);
    --contact-accent: var(--color-primary);
    --contact-accent-soft: var(--color-primary-container);
    --contact-border: color-mix(in srgb, var(--color-primary) 18%, transparent);
    --contact-border-strong: color-mix(in srgb, var(--color-primary) 34%, transparent);
    --contact-shadow: 0 18px 56px color-mix(in srgb, var(--color-primary) 13%, transparent);
    --contact-shadow-strong: 0 28px 84px color-mix(in srgb, var(--color-primary) 22%, transparent);
    background:
      radial-gradient(56% 42% at 12% 4%, color-mix(in srgb, var(--contact-accent-soft) 24%, transparent), transparent 72%),
      radial-gradient(48% 38% at 100% 18%, color-mix(in srgb, var(--contact-accent) 10%, transparent), transparent 70%),
      linear-gradient(145deg, var(--contact-bg) 0%, var(--contact-bg-soft) 48%, var(--contact-bg) 100%);
    background-size: 400% 400%;
    animation: bgShift 14s ease infinite;
    min-height:100vh;
    color: var(--contact-text);
  }
  .contact-bg.dark {
    --contact-shadow: 0 20px 64px rgba(0,0,0,0.42);
    --contact-shadow-strong: 0 32px 92px rgba(0,0,0,0.56);
    background:
      radial-gradient(56% 42% at 10% 0%, color-mix(in srgb, var(--contact-accent) 18%, transparent), transparent 72%),
      radial-gradient(48% 38% at 100% 16%, color-mix(in srgb, var(--contact-accent-soft) 12%, transparent), transparent 70%),
      linear-gradient(145deg, var(--color-surface-container-low) 0%, var(--color-surface) 54%, var(--color-surface-container-high) 100%);
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
    background: color-mix(in srgb, var(--contact-bg) 86%, transparent);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid var(--contact-border);
    box-shadow: var(--contact-shadow), inset 0 1px 0 color-mix(in srgb, var(--contact-bg) 80%, transparent);
    transition: box-shadow .35s ease, transform .35s ease, border-color .35s ease;
  }
  .glass-card:hover {
    border-color: var(--contact-border-strong);
    box-shadow: var(--contact-shadow-strong);
    transform: translateY(-3px);
  }
  .glass-card.dark {
    background: color-mix(in srgb, var(--color-surface-container-high) 72%, transparent);
    border: 1px solid var(--contact-border);
    box-shadow: var(--contact-shadow);
  }
  .glass-card.dark:hover { box-shadow: var(--contact-shadow-strong); }

  .field-line-anim { animation: lineGrow 0.45s cubic-bezier(.4,0,.2,1) forwards; }

  .petal-float { animation: drift 5s ease-in-out infinite; }

  .toggle-pill {
    width:50px; height:28px; border-radius:999px; cursor:pointer; border:1px solid var(--contact-border); outline:none;
    position:relative; transition:background .35s, box-shadow .35s, transform .25s;
    box-shadow: 0 8px 18px color-mix(in srgb, var(--contact-accent) 18%, transparent);
  }
  .toggle-pill:hover { transform: translateY(-1px); box-shadow: 0 10px 24px color-mix(in srgb, var(--contact-accent) 24%, transparent); }
  .toggle-knob {
    position:absolute; top:4px; left:4px; width:20px; height:20px;
    border-radius:50%; background:var(--color-on-primary);
    box-shadow:0 1px 4px rgba(0,0,0,.18);
    transition:transform .32s cubic-bezier(.4,0,.2,1);
  }
  .toggle-pill.on .toggle-knob { transform:translateX(22px); }

  .info-pill {
    font-family: 'Manrope', system-ui, sans-serif; font-size:10px; font-weight:700;
    letter-spacing:.11em; text-transform:uppercase;
    padding:5px 11px; border-radius:999px;
    background: color-mix(in srgb, var(--contact-accent) 10%, transparent);
    color:var(--contact-accent);
    border: 1px solid var(--contact-border);
    display:inline-block;
  }
  .info-pill.dark {
    background: color-mix(in srgb, var(--contact-accent) 16%, transparent);
    color:var(--contact-accent-soft);
  }

  .send-btn {
    position:relative; overflow:hidden; border:none; cursor:pointer;
    font-family: 'Manrope', system-ui, sans-serif; font-size:11px; font-weight:800;
    letter-spacing:.18em; text-transform:uppercase;
    padding:15px 42px; border-radius:999px;
    color:var(--color-on-primary); transition:transform .25s ease, box-shadow .25s ease, background-position .35s ease;
    background:linear-gradient(135deg,var(--contact-accent),var(--contact-accent-soft),var(--contact-accent));
    background-size:200% auto;
    box-shadow: 0 12px 32px color-mix(in srgb, var(--contact-accent) 28%, transparent);
  }
  .send-btn:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 16px 42px color-mix(in srgb, var(--contact-accent) 36%, transparent); background-position:right center; }
  .send-btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%);
    transform:translateX(-100%); transition:transform .6s;
  }
  .send-btn:hover::before { transform:translateX(100%); }
  .send-btn:disabled {
    cursor: wait;
    opacity: 0.72;
    transform: none;
  }
  .send-btn.dark { background:linear-gradient(135deg,var(--contact-accent),var(--contact-accent-soft),var(--contact-accent)); }

  .social-btn {
  display:inline-flex; align-items:center; gap:6px;
  font-family: 'Manrope', system-ui, sans-serif; font-size:12px; font-weight:700;
  color:var(--contact-muted); border:1px solid var(--contact-border);
  padding:9px 16px; border-radius:999px;
  background:color-mix(in srgb, var(--contact-bg) 78%, transparent); cursor:pointer; border-style:solid;
  transition:transform .25s ease, box-shadow .25s ease, background-color .25s ease, color .25s ease, border-color .25s ease;
  text-decoration:none;
}

  .social-btn:hover {
    color: var(--contact-accent);
    border-color: var(--contact-border-strong);
    background: color-mix(in srgb, var(--contact-accent) 10%, var(--contact-bg));
    transform:translateY(-2px);
    box-shadow:0 10px 24px color-mix(in srgb, var(--contact-accent) 14%, transparent);
  }
  .social-btn.dark { color:var(--contact-soft); border-color:var(--contact-border); background:color-mix(in srgb, var(--color-surface-container-high) 70%, transparent); }
  .social-btn.dark:hover { background:color-mix(in srgb, var(--contact-accent) 16%, transparent); }

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
    background: linear-gradient(135deg,var(--contact-accent),var(--contact-accent-soft),var(--contact-accent-soft),var(--contact-accent));
    background-size:300% auto; animation: shimmer 6s linear infinite;
  }
  .newsletter-bg.dark {
    background: linear-gradient(135deg,var(--contact-accent),var(--contact-accent-soft),var(--contact-accent-soft),var(--contact-accent));
    background-size:300% auto;
  }

  .contact-bg main {
    position: relative;
  }

  .contact-bg main > section:first-child {
    padding: 18px 0 4px;
  }

  .contact-bg input::placeholder,
  .contact-bg textarea::placeholder {
    color: var(--contact-soft);
    opacity: 0.7;
  }

  .contact-bg input,
  .contact-bg textarea {
    font-family: 'Manrope', system-ui, sans-serif;
    letter-spacing: 0.01em;
  }

  .contact-bg label {
    color: var(--contact-muted);
  }

  .contact-bg a:focus-visible,
  .contact-bg button:focus-visible,
  .contact-bg input:focus-visible,
  .contact-bg textarea:focus-visible {
    outline: 2px solid var(--contact-accent);
    outline-offset: 4px;
  }

  @media (max-width: 768px) {
    .glass-card {
      border-radius: 18px;
    }
    .send-btn {
      width: 100%;
      justify-content: center;
      padding-inline: 24px;
    }
    .social-btn {
      min-height: 42px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .contact-bg *,
    .contact-bg *::before,
    .contact-bg *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
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

        <InfoCard title="Open Hours" icon={<IconClock size={16} />} dark={isDark}>
          <p className="font-body text-[13px] leading-relaxed mb-1" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>Monday — Friday · 09:00–18:00 IST</p>
          <p className="font-body text-[13px] leading-relaxed mb-3" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>Saturday · 10:00–14:00 IST</p>
          <span className={`info-pill${isDark ? " dark" : ""}`}><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 5 }}><IconSparkle size={12} /></span>Urgent inquiries welcome</span>
        </InfoCard>

        <InfoCard title="Direct Contact" icon={<IconPhone size={16} />} dark={isDark}>
          <p className="font-body text-[13px] mb-1" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>concierge@hues.com</p>
          <p className="font-body text-[13px] mb-3" style={{ color: isDark ? "var(--color-outline)" : "var(--color-on-surface-variant)" }}>+94 77 726 0926</p>
          <div className="flex gap-2 flex-wrap">
            {["WhatsApp", "Telegram"].map(s => (
              <span key={s} className={`info-pill${isDark ? " dark" : ""}`}>{s}</span>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Follow Our Journal" icon={<IconSparkle size={16} />} dark={isDark}>
          <div className="flex flex-wrap gap-2 mt-1">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.n}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={`social-btn${isDark ? " dark" : ""}`}
                aria-label={`Open ${s.n}`}
              >
                <span>{s.e}</span> {s.n}
              </a>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
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
        </main>
        <Footer />
      </div>
    </>
  );
}

