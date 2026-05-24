import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logoImg from "../assets/logo/logo.jpg";

/* ─── Nav Links ─────────────────────────────────────────────────────────── */
const PUBLIC_LINKS = [
  { label: "Home", to: "/" },
  {
    label: "Collections",
    to: "/collections",
    dropdown: [
      { label: "All Collections", to: "/collections/AllCollections" },
      { label: "Blouse",          to: "/collections/blouse" },
      { label: "Dress",           to: "/collections/dress" },
      { label: "Shirt",           to: "/collections/shirt" },
    ],
  },
  { label: "About",      to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

/* ─── Scroll hook ────────────────────────────────────────────────────────── */
function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);
  return scrolled;
}

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
  </svg>
);

const IconBag = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const IconHeart = ({ filled }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "fill 0.35s ease" }}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const IconPerson = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconChevron = ({ rotated }) => (
  <svg width="9" height="5" viewBox="0 0 10 6" fill="none" style={{ transition: "transform 0.3s", transform: rotated ? "rotate(180deg)" : "rotate(0deg)" }}>
    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

/* ─── Logo ───────────────────────────────────────────────────────────────── */
function Logo() {
  return (
      <img
        src={logoImg}
        alt="HUES"
        className="hues-logo__image"
      />
  );
}

/* ─── Icon Action Button ─────────────────────────────────────────────────── */
function ActionBtn({ onClick, label, children, badge, dot }) {
  return (
    <button onClick={onClick} className="hues-action-btn" aria-label={label} title={label}>
      {children}
      {badge > 0 && (
        <span className="hues-badge">{badge}</span>
      )}
      {dot && !badge && <span className="hues-dot" aria-hidden="true"/>}
    </button>
  );
}

/* ─── Wishlist Panel ─────────────────────────────────────────────────────── */
function WishlistPanel({ wishlist, toggleWishlist, addItem, onClose }) {
  return (
    <div className="hues-wishlist-panel" role="dialog" aria-label="Wishlist">
      <div className="hues-wishlist-panel__header">
        <span className="hues-wishlist-panel__title">Wishlist · {wishlist.length}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {wishlist.length > 0 && (
            <button
              className="hues-wishlist-panel__clear"
              onClick={() => wishlist.forEach(item => toggleWishlist(item))}
            >
              Clear all
            </button>
          )}
          <button className="hues-wishlist-panel__close" onClick={onClose} aria-label="Close wishlist">
            <IconClose/>
          </button>
        </div>
      </div>

      <div className="hues-wishlist-panel__body">
        {wishlist.length === 0 ? (
          <div className="hues-wishlist-panel__empty">
            <span className="hues-wishlist-panel__empty-icon" aria-hidden="true">♡</span>
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          wishlist.map(item => (
            <div key={item.id} className="hues-wishlist-item">
              <div className="hues-wishlist-item__img">
                <img src={item.image} alt={item.name} loading="lazy"/>
              </div>
              <div className="hues-wishlist-item__info">
                <span className="hues-wishlist-item__name">{item.name}</span>
                <span className="hues-wishlist-item__price">
                  {typeof item.price === "number" ? `Rs. ${item.price.toFixed(2)}` : item.price}
                </span>
                <button
                  className="hues-wishlist-item__add"
                  onClick={() => addItem(item, "XS", 1)}
                >
                  Add to bag
                </button>
              </div>
              <button
                className="hues-wishlist-item__remove"
                onClick={() => toggleWishlist(item)}
                aria-label={`Remove ${item.name}`}
              >
                <IconClose/>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Mobile Drawer ─────────────────────────────────────────────────────── */
function MobileDrawer({ open, onClose, isAuthenticated, user, hasRole, handleLogout, navigate }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const go = (path) => { navigate(path); onClose(); };

  return (
    <>
      <div
        className={`hues-drawer-backdrop ${open ? "hues-drawer-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`hues-drawer ${open ? "hues-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* header */}
        <div className="hues-drawer__head">
          <Link to="/" className="hues-logo" onClick={onClose} aria-label="HUES home">
            <img
              src={logoImg}
              alt="HUES"
              className="hues-logo__image"
            />
          </Link>
          <button className="hues-drawer__close" onClick={onClose} aria-label="Close menu">
            <IconClose/>
          </button>
        </div>

        {/* nav links */}
        <nav className="hues-drawer__nav">
          {PUBLIC_LINKS.map(link => (
            <div key={link.label} className="hues-drawer__item">
              {link.dropdown ? (
                <>
                  <button
                    className="hues-drawer__link hues-drawer__link--toggle"
                    onClick={() => setOpenDropdown(p => p === link.label ? null : link.label)}
                    aria-expanded={openDropdown === link.label}
                  >
                    {link.label}
                    <IconChevron rotated={openDropdown === link.label}/>
                  </button>
                  <div className={`hues-drawer__sub ${openDropdown === link.label ? "hues-drawer__sub--open" : ""}`}>
                    {link.dropdown.map(d => (
                      <button key={d.to} className="hues-drawer__sublink" onClick={() => go(d.to)}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button className="hues-drawer__link" onClick={() => go(link.to)}>
                  {link.label}
                </button>
              )}
            </div>
          ))}

          {isAuthenticated && hasRole(["Admin", "SuperAdmin"]) && (
            <div className="hues-drawer__item">
              <button className="hues-drawer__link hues-drawer__link--admin" onClick={() => go("/admin")}>
                Dashboard
              </button>
            </div>
          )}
        </nav>

        {/* footer auth */}
        <div className="hues-drawer__foot">
          {isAuthenticated ? (
            <>
              <div className="hues-drawer__user">
                <span className="hues-user-pill__avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                  {(user.username || "U")[0].toUpperCase()}
                </span>
                <div>
                  <div className="hues-drawer__user-name">{user.username}</div>
                  <div className="hues-drawer__user-role">{user.role}</div>
                </div>
              </div>
              <button className="hues-drawer__signout" onClick={() => { handleLogout(); onClose(); }}>
                <IconLogout/> Sign out
              </button>
            </>
          ) : (
            <button className="hues-drawer__signin" onClick={() => go("/signin")}>
              <IconPerson/> Sign in
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main NavBar ────────────────────────────────────────────────────────── */
export default function NavBar() {
  const scrolled      = useScrolled(30);
  const [showWishlist, setShowWishlist] = useState(false);
  const [heartPulse, setHeartPulse]   = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const wishlistRef = useRef(null);

  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const { totalItems, wishlist = [], addItem, toggleWishlist } = useCart();
  const navigate = useNavigate();

  const handleCloseMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const handler = (e) => {
      if (wishlistRef.current && !wishlistRef.current.contains(e.target)) {
        setShowWishlist(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (wishlist.length > 0) {
      setHeartPulse(true);
      const t = setTimeout(() => setHeartPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [wishlist.length]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --hues-rose:    #8a3a60;
          --hues-blush:   #c07fa5;
          --hues-petal:   #fce8f0;
          --hues-cream:   #fff8f9;
          --hues-ink:     #1c1018;
          --hues-muted:   #7a5068;
          --hues-border:  rgba(180,130,155,0.22);
          --hues-shadow:  rgba(138,58,96,0.12);
          --hues-r:       4px;
          --nav-h:        64px;
          --ff-display:   'Cormorant Garamond', Georgia, serif;
          --ff-body:      'Jost', 'Helvetica Neue', sans-serif;
        }
        .dark {
          --hues-cream:   #110a0e;
          --hues-petal:   #1e0f17;
          --hues-ink:     #f0e4eb;
          --hues-muted:   #b08098;
          --hues-border:  rgba(180,100,140,0.18);
          --hues-shadow:  rgba(0,0,0,0.35);
        }

        /* ── Nav shell ── */
        .hues-nav {
          position: fixed; left: 0; right: 0; top: 0; z-index: 200;
          height: var(--nav-h);
          display: flex; align-items: center;
          padding: 0 48px;
          font-family: var(--ff-body);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 0.5px solid var(--hues-border);
          transition: background 0.4s ease, box-shadow 0.4s ease;
        }
        .hues-nav--scrolled {
          background: color-mix(in srgb, var(--hues-cream) 96%, transparent);
          box-shadow: 0 8px 40px var(--hues-shadow);
        }
        .hues-nav--top {
          background: color-mix(in srgb, var(--hues-cream) 70%, transparent);
        }
        .hues-nav__inner {
          width: 100%; max-width: 1440px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .hues-nav__left  { display: flex; align-items: center; gap: 44px; }
        .hues-nav__right { display: flex; align-items: center; gap: 4px; }

        /* ── Logo ── */
        .hues-logo {
          display: flex; align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hues-logo__image {
          height: 150px;
          width: auto;
          object-fit: contain;
          display: block;
          border-radius: 6px;
          transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.3s, filter 0.3s;
          filter: drop-shadow(0 2px 8px rgba(180,140,200,0.18));
        }
        .hues-logo:hover .hues-logo__image {
          transform: scale(1.06);
          filter: drop-shadow(0 4px 16px rgba(180,140,210,0.32)) brightness(1.04);
          opacity: 0.92;
        }

        /* ── Nav links ── */
        .hues-links {
          display: flex; align-items: center; gap: 32px;
          list-style: none; margin: 0; padding: 0;
        }
        .hues-links__item { position: relative; }

        .hues-link {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 14px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--hues-muted);
          text-decoration: none;
          padding: 20px 0;
          transition: color 0.25s;
          white-space: nowrap;
          background: none; border: none; cursor: pointer;
        }
        .hues-link::after {
          content: '';
          position: absolute; bottom: 14px; left: 0;
          width: 0; height: 0.5px;
          background: var(--hues-rose);
          transition: width 0.35s cubic-bezier(.25,1,.5,1);
        }
        .hues-link:hover { color: var(--hues-rose); }
        .hues-link:hover::after { width: 100%; }
        .hues-link--admin { color: var(--hues-rose); }

        .hues-link__chevron {
          opacity: 0.55;
          transition: transform 0.3s;
        }
        .hues-links__item:hover .hues-link__chevron { transform: rotate(180deg); }

        /* ── Dropdown ── */
        .hues-dropdown {
          position: absolute; top: calc(100% - 2px); left: -20px;
          min-width: 190px;
          background: var(--hues-cream);
          border: 0.5px solid var(--hues-border);
          border-radius: 0 0 var(--hues-r) var(--hues-r);
          box-shadow: 0 20px 50px var(--hues-shadow);
          overflow: hidden;
          opacity: 0; pointer-events: none;
          transform: translateY(6px);
          transition: opacity 0.25s, transform 0.25s cubic-bezier(.25,1,.5,1);
        }
        .hues-links__item:hover .hues-dropdown {
          opacity: 1; pointer-events: auto; transform: translateY(0);
        }
        .hues-dropdown__link {
          display: block; padding: 12px 24px;
          font-size: 14px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--hues-muted);
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .hues-dropdown__link:hover {
          background: var(--hues-petal);
          color: var(--hues-rose);
        }
        .hues-dropdown__divider {
          height: 0.5px;
          background: var(--hues-border);
          margin: 2px 16px;
        }

        /* ── Action buttons ── */
        .hues-action-btn {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px;
          background: none; border: none; cursor: pointer;
          color: var(--hues-muted);
          border-radius: 50%;
          transition: color 0.25s, background 0.25s, transform 0.2s;
        }
        .hues-action-btn:hover {
          color: var(--hues-rose);
          background: var(--hues-petal);
          transform: scale(1.08);
        }
        .hues-action-btn:active { transform: scale(0.96); }

        .hues-badge {
          position: absolute; top: -2px; right: -2px;
          min-width: 17px; height: 17px; padding: 0 4px;
          background: var(--hues-rose); color: #fff;
          font-size: 9.5px; font-weight: 600;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-body);
          animation: huesBadgePop 0.35s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes huesBadgePop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        .hues-dot {
          position: absolute; top: 6px; right: 6px;
          width: 6px; height: 6px;
          border-radius: 50%; background: var(--hues-rose);
        }

        .hues-heart-pulse {
          animation: huesHeartbeat 0.45s ease both;
        }
        @keyframes huesHeartbeat {
          0%   { transform: scale(1);   }
          30%  { transform: scale(1.35); }
          60%  { transform: scale(0.95); }
          100% { transform: scale(1);   }
        }

        /* ── User pill ── */
        .hues-user-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px 5px 8px;
          background: var(--hues-petal);
          border: 0.5px solid var(--hues-border);
          border-radius: 20px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--hues-rose);
          font-family: var(--ff-body);
        }
        .hues-user-pill__avatar {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--hues-rose); color: #fff;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-body);
          flex-shrink: 0;
        }

        /* ── Wishlist panel ── */
        .hues-wishlist-panel {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 320px;
          background: var(--hues-cream);
          border: 0.5px solid var(--hues-border);
          border-radius: var(--hues-r);
          box-shadow: 0 24px 60px var(--hues-shadow);
          overflow: hidden;
          animation: huesPanelIn 0.28s cubic-bezier(.25,1,.5,1) both;
          z-index: 300;
        }
        @keyframes huesPanelIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hues-wishlist-panel__header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px 13px;
          border-bottom: 0.5px solid var(--hues-border);
          background: color-mix(in srgb, var(--hues-petal) 60%, transparent);
        }
        .hues-wishlist-panel__title {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--hues-muted);
          font-family: var(--ff-body);
        }
        .hues-wishlist-panel__clear {
          font-size: 10px; font-weight: 500; letter-spacing: 0.08em;
          color: #c0605a; background: none; border: none; cursor: pointer;
          text-transform: uppercase; font-family: var(--ff-body);
          transition: color 0.2s;
        }
        .hues-wishlist-panel__clear:hover { color: #e04040; }
        .hues-wishlist-panel__close {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 50%;
          background: none; border: none; cursor: pointer;
          color: var(--hues-muted); transition: background 0.2s, color 0.2s;
        }
        .hues-wishlist-panel__close:hover {
          background: var(--hues-petal); color: var(--hues-rose);
        }
        .hues-wishlist-panel__body { max-height: 340px; overflow-y: auto; }
        .hues-wishlist-panel__body::-webkit-scrollbar { width: 4px; }
        .hues-wishlist-panel__body::-webkit-scrollbar-thumb {
          background: var(--hues-border); border-radius: 4px;
        }
        .hues-wishlist-panel__empty {
          padding: 44px 20px; text-align: center;
          color: var(--hues-muted); font-family: var(--ff-body);
        }
        .hues-wishlist-panel__empty-icon {
          display: block; font-size: 36px; margin-bottom: 10px; opacity: 0.35;
          font-family: var(--ff-display);
        }
        .hues-wishlist-panel__empty p {
          font-size: 13px; font-weight: 400; letter-spacing: 0.04em;
        }
        .hues-wishlist-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px;
          border-bottom: 0.5px solid var(--hues-border);
          transition: background 0.2s;
        }
        .hues-wishlist-item:hover { background: var(--hues-petal); }
        .hues-wishlist-item:last-child { border-bottom: none; }
        .hues-wishlist-item__img {
          width: 46px; height: 60px; border-radius: 3px;
          overflow: hidden; flex-shrink: 0;
          background: color-mix(in srgb, var(--hues-petal) 80%, transparent);
        }
        .hues-wishlist-item__img img { width: 100%; height: 100%; object-fit: cover; }
        .hues-wishlist-item__info {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 3px;
        }
        .hues-wishlist-item__name {
          font-size: 13px; font-weight: 500; letter-spacing: 0.02em;
          color: var(--hues-ink); font-family: var(--ff-body);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hues-wishlist-item__price {
          font-size: 14px; font-weight: 500;
          color: var(--hues-rose); font-family: var(--ff-body);
        }
        .hues-wishlist-item__add {
          margin-top: 5px; font-size: 10px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 3px;
          background: var(--hues-ink); color: var(--hues-cream);
          border: none; cursor: pointer; font-family: var(--ff-body);
          align-self: flex-start; transition: background 0.25s;
        }
        .hues-wishlist-item__add:hover { background: var(--hues-rose); }
        .hues-wishlist-item__remove {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 50%;
          background: none; border: none; cursor: pointer;
          color: var(--hues-muted); flex-shrink: 0;
          transition: background 0.2s, color 0.2s;
        }
        .hues-wishlist-item__remove:hover { background: #fce8e8; color: #d04040; }

        /* ── Announce bar ── */
        .hues-announce {
          position: fixed; left: 0; right: 0; top: var(--nav-h); z-index: 199;
          height: 34px;
          background: var(--hues-rose); color: rgba(236,236,230,0.92);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-body);
          font-size: 11px; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; overflow: hidden;
        }
        .hues-announce__track {
          display: flex; gap: 80px;
          animation: huesMarquee 22s linear infinite;
          white-space: nowrap;
        }
        @keyframes huesMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .hues-announce__sep { color: rgba(255,255,255,0.4); margin: 0 4px; }

        /* ── Hamburger ── */
        .hues-hamburger {
          display: none;
          align-items: center; justify-content: center;
          width: 38px; height: 38px;
          background: none; border: none; cursor: pointer;
          color: var(--hues-muted); border-radius: 50%;
          transition: color 0.25s, background 0.25s;
          flex-shrink: 0;
        }
        .hues-hamburger:hover { color: var(--hues-rose); background: var(--hues-petal); }

        /* ── Drawer backdrop ── */
        .hues-drawer-backdrop {
          display: none;
          position: fixed; inset: 0; z-index: 400;
          background: rgba(28,16,24,0.45);
          backdrop-filter: blur(4px);
          opacity: 0; transition: opacity 0.35s ease;
        }
        .hues-drawer-backdrop--open { opacity: 1; }

        /* ── Drawer panel ── */
        .hues-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 500;
          width: min(320px, 85vw);
          background: var(--hues-cream);
          display: flex; flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.38s cubic-bezier(.25,1,.5,1);
          overflow: hidden;
          box-shadow: 4px 0 40px rgba(138,58,96,0.18);
        }
        .hues-drawer--open { transform: translateX(0); }
        .hues-drawer__head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px; height: var(--nav-h);
          border-bottom: 0.5px solid var(--hues-border); flex-shrink: 0;
        }
        .hues-drawer__close {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: none; border: none; cursor: pointer;
          color: var(--hues-muted); transition: background 0.2s, color 0.2s;
        }
        .hues-drawer__close:hover { background: var(--hues-petal); color: var(--hues-rose); }
        .hues-drawer__nav { flex: 1; overflow-y: auto; padding: 12px 0; }
        .hues-drawer__nav::-webkit-scrollbar { width: 3px; }
        .hues-drawer__nav::-webkit-scrollbar-thumb { background: var(--hues-border); border-radius: 4px; }
        .hues-drawer__item { border-bottom: 0.5px solid var(--hues-border); }
        .hues-drawer__item:last-child { border-bottom: none; }
        .hues-drawer__link {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 16px 24px;
          font-family: var(--ff-body); font-size: 14px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--hues-muted);
          background: none; border: none; cursor: pointer; text-align: left;
          transition: color 0.2s, background 0.2s;
        }
        .hues-drawer__link:hover {
          color: var(--hues-rose);
          background: color-mix(in srgb, var(--hues-petal) 50%, transparent);
        }
        .hues-drawer__link--admin { color: var(--hues-rose); }
        .hues-drawer__link--toggle { gap: 8px; }
        .hues-drawer__sub {
          overflow: hidden; max-height: 0;
          transition: max-height 0.32s cubic-bezier(.25,1,.5,1);
          background: color-mix(in srgb, var(--hues-petal) 35%, transparent);
        }
        .hues-drawer__sub--open { max-height: 400px; }
        .hues-drawer__sublink {
          display: block; width: 100%; padding: 12px 24px 12px 36px;
          font-family: var(--ff-body); font-size: 11px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--hues-muted);
          background: none; border: none; cursor: pointer; text-align: left;
          transition: color 0.2s;
        }
        .hues-drawer__sublink:hover { color: var(--hues-rose); }
        .hues-drawer__foot {
          padding: 20px 24px;
          border-top: 0.5px solid var(--hues-border);
          background: color-mix(in srgb, var(--hues-petal) 40%, transparent);
          flex-shrink: 0; display: flex; flex-direction: column; gap: 14px;
        }
        .hues-drawer__user { display: flex; align-items: center; gap: 10px; }
        .hues-drawer__user-name {
          font-family: var(--ff-body); font-size: 13px; font-weight: 600;
          color: var(--hues-ink); letter-spacing: 0.04em;
        }
        .hues-drawer__user-role {
          font-family: var(--ff-body); font-size: 11px; font-weight: 400;
          color: var(--hues-muted); letter-spacing: 0.06em; text-transform: uppercase;
          margin-top: 1px;
        }
        .hues-drawer__signout, .hues-drawer__signin {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 10px 14px;
          font-family: var(--ff-body); font-size: 11px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          background: none; border: 0.5px solid var(--hues-border);
          border-radius: var(--hues-r); cursor: pointer;
          transition: background 0.25s, color 0.25s;
        }
        .hues-drawer__signout { color: #c0605a; }
        .hues-drawer__signout:hover { background: #fce8e8; }
        .hues-drawer__signin { color: var(--hues-rose); }
        .hues-drawer__signin:hover { background: var(--hues-petal); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hues-nav { padding: 0 16px; }
          .hues-links { display: none; }
          .hues-user-pill { display: none; }
          .hues-hamburger { display: flex; }
          .hues-drawer-backdrop { display: block; }
          .hues-wishlist-panel {
            position: fixed; top: var(--nav-h);
            left: 0; right: 0; width: 100%;
            border-radius: 0 0 var(--hues-r) var(--hues-r);
          }
        }
        @media (max-width: 400px) {
          .hues-action-btn { width: 34px; height: 34px; }
          .hues-nav__right { gap: 2px; }
        }
      `}</style>

      {/* ── Announcement bar ── */}
      <div className="hues-announce" aria-label="Site announcement">
        <div className="hues-announce__track">
          {[
            "Free shipping on orders over Rs. 5,000",
            "New arrivals every Friday",
            "Complimentary gift wrapping",
            "Private styling appointments available",
            "Free shipping on orders over Rs. 5,000",
            "New arrivals every Friday",
            "Complimentary gift wrapping",
            "Private styling appointments available",
          ].map((msg, i) => (
            <span key={i}>
              {msg} <span className="hues-announce__sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={handleCloseMobile}
        isAuthenticated={isAuthenticated}
        user={user}
        hasRole={hasRole}
        handleLogout={handleLogout}
        navigate={navigate}
      />

      {/* ── Nav ── */}
      <nav className={`hues-nav ${scrolled ? "hues-nav--scrolled" : "hues-nav--top"}`} role="navigation" aria-label="Main navigation">
        <div className="hues-nav__inner">

          {/* Left: hamburger (mobile) + logo + links */}
          <div className="hues-nav__left">
            <button
              className="hues-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <IconMenu/>
            </button>

            <Logo />

            <ul className="hues-links">
              {PUBLIC_LINKS.map(link => (
                <li key={link.label} className="hues-links__item">
                  <Link to={link.to} className="hues-link">
                    {link.label}
                    {link.dropdown && (
                      <span className="hues-link__chevron" aria-hidden="true">
                        <IconChevron/>
                      </span>
                    )}
                  </Link>
                  {link.dropdown && (
                    <div className="hues-dropdown" role="menu">
                      {link.dropdown.map((d, i) => (
                        <>
                          {i === 1 && <div key={`div-${i}`} className="hues-dropdown__divider"/>}
                          <Link key={d.to} to={d.to} className="hues-dropdown__link" role="menuitem">
                            {d.label}
                          </Link>
                        </>
                      ))}
                    </div>
                  )}
                </li>
              ))}

              {isAuthenticated && hasRole(["Admin","SuperAdmin"]) && (
                <li className="hues-links__item">
                  <Link to="/admin" className="hues-link hues-link--admin">Dashboard</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Right: actions */}
          <div className="hues-nav__right">

            <ActionBtn label="Search">
              <IconSearch/>
            </ActionBtn>

            <div style={{ position: "relative" }} ref={wishlistRef}>
              <ActionBtn
                onClick={() => setShowWishlist(p => !p)}
                label="Wishlist"
                badge={wishlist.length || null}
              >
                <span className={heartPulse ? "hues-heart-pulse" : ""} style={{ display: "flex" }}>
                  <IconHeart filled={wishlist.length > 0}/>
                </span>
              </ActionBtn>

              {showWishlist && (
                <WishlistPanel
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                  addItem={addItem}
                  onClose={() => setShowWishlist(false)}
                />
              )}
            </div>

            <ActionBtn
              onClick={() => navigate("/payment")}
              label="Shopping bag"
              badge={totalItems || null}
              dot={!totalItems}
            >
              <IconBag/>
            </ActionBtn>

            {isAuthenticated ? (
              <>
                <span className="hues-user-pill" style={{ marginLeft: 6 }}>
                  <span className="hues-user-pill__avatar" aria-hidden="true">
                    {(user.username || "U")[0].toUpperCase()}
                  </span>
                  {user.role} · {user.username.split(" ")[0]}
                </span>
                <ActionBtn onClick={handleLogout} label="Sign out">
                  <IconLogout/>
                </ActionBtn>
              </>
            ) : (
              <Link to="/signin" style={{ display: "flex" }}>
                <ActionBtn label="Sign in">
                  <IconPerson/>
                </ActionBtn>
              </Link>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}