import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { apiFetch, getApiBaseUrl } from "../api/client";
import { CATEGORY_GROUPS } from "../lib/productCategories";
import logoImg from "../assets/logo/logo.png";
import logoDarkImg from "../assets/logo/logow.png";
import QuickView from "../User/Pages/Collection/QuickView";
import { productToCollectionShape } from "../User/Pages/Collection/collectionUtils";
import { isProductVisible } from "../lib/productAvailability";
import { groupProductsForDisplay } from "../lib/productGrouping";

/* ─── Nav Links ─────────────────────────────────────────────────────────── */
const PUBLIC_LINKS = [
  { label: "Home", to: "/" },
  {
    label: "Collections",
    to: "/collections",
    dropdown: CATEGORY_GROUPS,
  },
  { label: "About", to: "/about" },
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
    <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const IconBag = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const IconHeart = ({ filled }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "fill 0.35s ease" }}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const IconPerson = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconParcel = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 7.5L12 3l8.5 4.5L12 12 3.5 7.5Z" />
    <path d="M3.5 7.5V16.5L12 21l8.5-4.5V7.5" />
    <path d="M12 12v9" />
    <path d="M7.5 5.5l9 4.5" />
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/* ─── Logo ───────────────────────────────────────────────────────────────── */
function Logo({ isDark }) {
  return (
    <img
      src={isDark ? logoDarkImg : logoImg}
      alt="HUES"
      className="hues-logo__image"
      decoding="async"
    />
  );
}

/* ─── Icon Action Button ─────────────────────────────────────────────────── */
function ActionBtn({ onClick, label, children, badge, dot, className = "" }) {
  return (
    <button onClick={onClick} className={`hues-action-btn ${className}`.trim()} aria-label={label} title={label}>
      {children}
      {badge > 0 && (
        <span className="hues-badge">{badge}</span>
      )}
      {dot && !badge && <span className="hues-dot" aria-hidden="true" />}
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
            <IconClose />
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
                <img src={item.image} alt={item.name} loading="lazy" />
              </div>
              <div className="hues-wishlist-item__info">
                <span className="hues-wishlist-item__name">{item.name}</span>
                <span className="hues-wishlist-item__price">
                  {typeof item.price === "number" ? `Rs. ${item.price.toFixed(2)}` : item.price}
                </span>
                <button
                  className="hues-wishlist-item__add"
                  disabled={Number(item.stock) <= 0}
                  onClick={() => addItem(item, "XS", 1)}
                >
                  {Number(item.stock) <= 0 ? "Out of stock" : "Add to bag"}
                </button>
              </div>
              <button
                className="hues-wishlist-item__remove"
                onClick={() => toggleWishlist(item)}
                aria-label={`Remove ${item.name}`}
              >
                <IconClose />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Mobile Drawer ─────────────────────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
  isAuthenticated,
  user,
  hasRole,
  handleLogout,
  navigate,
  avatarSrc,
  userInitial,
  isActiveRoute,
  isCollectionsActive,
  currentPath,
  onSearchClick,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const { theme } = useTheme();

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
              src={theme === "dark" ? logoDarkImg : logoImg}
              alt="HUES"
              className="hues-logo__image"
            />
          </Link>
          <button className="hues-drawer__close" onClick={onClose} aria-label="Close menu">
            <IconClose />
          </button>
        </div>

        {/* nav links */}
        <nav className="hues-drawer__nav">
          {PUBLIC_LINKS.map(link => (
            <div key={link.label} className="hues-drawer__item">
              {link.dropdown ? (
                <>
                  <button
                    className={`hues-drawer__link hues-drawer__link--toggle${isCollectionsActive ? " hues-drawer__link--active" : ""}`}
                    type="button"
                    onClick={() => setOpenDropdown((current) => (current === link.label ? null : link.label))}
                    aria-expanded={openDropdown === link.label}
                  >
                  {link.label}
                  </button>
                  <div className={`hues-drawer__sub ${openDropdown === link.label ? "hues-drawer__sub--open" : ""}`}>
                    {link.dropdown.map((group) => (
                      <button
                        key={group.label}
                        type="button"
                        className={`hues-drawer__sublink hues-drawer__sublink--group${currentPath.startsWith(group.route) ? " hues-drawer__sublink--active" : ""}`}
                        onClick={() => go(group.route)}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button className={`hues-drawer__link${isActiveRoute(link.to) ? " hues-drawer__link--active" : ""}`} onClick={() => go(link.to)}>
                  {link.label}
                </button>
              )}
            </div>
          ))}

          {isAuthenticated && hasRole(["Admin", "SuperAdmin"]) && (
            <div className="hues-drawer__item">
              <button className={`hues-drawer__link hues-drawer__link--admin${isActiveRoute("/admin") ? " hues-drawer__link--active" : ""}`} onClick={() => go("/admin")}>
                Dashboard
              </button>
            </div>
          )}
        </nav>

        {/* footer auth */}
        <div className="hues-drawer__foot">
          <div className="hues-drawer__quick-actions">
            <button className="hues-drawer__quick-action" type="button" onClick={() => { onSearchClick(); onClose(); }}>
              <IconSearch /> Search
            </button>
            <button className="hues-drawer__quick-action hues-drawer__quick-action--bag" type="button" onClick={() => go("/payment")}>
              <IconBag /> Cart
            </button>
          </div>
          {isAuthenticated ? (
            <>
              <div className="hues-drawer__user">
                <span className="hues-user-pill__avatar" style={{ width: 28, height: 28, fontSize: 11, overflow: "hidden" }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    userInitial
                  )}
                </span>
                <div>
                  <div className="hues-drawer__user-name">{user.username}</div>
                  <div className="hues-drawer__user-role">{user.role}</div>
                </div>
              </div>
              <button className="hues-drawer__signin" onClick={() => { navigate("/profile"); onClose(); }}>
                <IconPerson /> Profile
              </button>
              <button className="hues-drawer__signin" onClick={() => { navigate("/my-orders"); onClose(); }}>
                <IconParcel /> Orders
              </button>
              <button className="hues-drawer__signout" onClick={() => { handleLogout(); onClose(); }}>
                <IconLogout /> Sign out
              </button>
            </>
          ) : (
            <button className="hues-drawer__signin" onClick={() => go("/signin")}>
              <IconPerson /> Sign in
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main NavBar ────────────────────────────────────────────────────────── */
export default function NavBar() {
  const scrolled = useScrolled(30);
  const [showWishlist, setShowWishlist] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(null);
  const wishlistRef = useRef(null);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { theme } = useTheme();
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const { totalItems, wishlist = [], addItem, toggleWishlist } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const avatarSrc = user?.avatarUrl
    ? (String(user.avatarUrl).startsWith("http") ? user.avatarUrl : `${getApiBaseUrl()}${user.avatarUrl}`)
    : "";
  const userInitial = (user?.username || "U")[0].toUpperCase();
  const userFirstName = (user?.username || "User").split(" ")[0];

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

  // Fetch products when search overlay is opened
  useEffect(() => {
    if (showSearch && products.length === 0) {
      setSearchLoading(true);
      apiFetch("/products")
        .then((data) => {
          setProducts(
            groupProductsForDisplay(
              (data.products || []).map(productToCollectionShape).filter((product) => isProductVisible(product))
            )
          );
          setSearchError("");
        })
        .catch((err) => {
          setSearchError(err?.message || "Unable to load products.");
        })
        .finally(() => {
          setSearchLoading(false);
        });
    }
  }, [showSearch, products.length]);

  // Prevent body scroll when search overlay is active
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSearch]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.subcategory?.toLowerCase().includes(query) ||
        product.collection?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.subtitle?.toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActiveRoute = useCallback(
    (path) => path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`),
    [location.pathname]
  );

  const isCollectionsActive = location.pathname === "/collections" || location.pathname.startsWith("/collections/");
  const activeCollectionSubcategory = new URLSearchParams(location.search).get("sub") || "";

  const announcements = [
    "Free shipping on orders over Rs. 5,000",
    "New arrivals every Friday",
    "Complimentary gift wrapping",
    "Private styling appointments available",
    "Free shipping on orders over Rs. 5,000",
    "New arrivals every Friday",
    "Complimentary gift wrapping",
    "Private styling appointments available",
  ];

  return (
    <>
      <style>{`
        
        :root {
          --hues-rose:    #6f1f2f;
          --hues-blush:   #c46a74;
          --hues-petal:   #f9ecec;
          --hues-cream:   #fff8f7;
          --hues-ink:     var(--color-on-surface);
          --hues-muted:   #6c4950;
          --hues-border:  rgba(111,31,47,0.22);
          --hues-shadow:  rgba(111,31,47,0.12);
          --hues-r:       4px;
          --nav-h:        64px;
          --ff-display:   'Cormorant Garamond', Georgia, serif;
          --ff-body:      'Jost', 'Helvetica Neue', sans-serif;
        }
        .dark {
          --hues-cream:   #110c0d;
          --hues-petal:   #201215;
          --hues-ink:     #f0e4eb;
          --hues-muted:   #d7c6c7;
          --hues-border:  rgba(232,169,180,0.18);
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
          line-height: 0;
        }
        .hues-logo__image {
          height: 36px;
          width: auto;
          object-fit: contain;
          display: block;
          border-radius: 6px;
          transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.3s, filter 0.3s;
          filter: drop-shadow(0 2px 8px rgba(111,31,47,0.18));
        }
        .hues-logo:hover .hues-logo__image {
          transform: scale(1.06);
          filter: drop-shadow(0 4px 16px rgba(111,31,47,0.32)) brightness(1.04);
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
        .hues-link--active { color: var(--hues-rose); }
        .hues-link--active::after { width: 100%; }
        .hues-link--admin { color: var(--hues-rose); }

        .hues-link__chevron {
          opacity: 0.55;
          transition: transform 0.3s;
        }
        .hues-links__item:hover .hues-link__chevron { transform: rotate(180deg); }

        /* ── Dropdown ── */
        .hues-dropdown {
          position: absolute; top: calc(100% - 2px); left: -20px;
          min-width: 320px;
          max-width: 560px;
          background: var(--hues-cream);
          border: 0.5px solid var(--hues-border);
          border-radius: 0 0 var(--hues-r) var(--hues-r);
          box-shadow: 0 20px 50px var(--hues-shadow);
          overflow: hidden;
          opacity: 0; pointer-events: none;
          transform: translateY(6px);
          transition: opacity 0.25s, transform 0.25s cubic-bezier(.25,1,.5,1);
        }
        .hues-links__item:hover .hues-dropdown,
        .hues-dropdown--open {
          opacity: 1; pointer-events: auto; transform: translateY(0);
        }
        .hues-dropdown--collection {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 4px 0;
          padding: 8px 0;
        }
        .hues-dropdown__group {
          display: flex;
          flex-direction: column;
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
        .hues-dropdown__link--group {
          font-weight: 700;
          color: var(--hues-rose);
        }
        .hues-dropdown__link--child {
          padding-left: 34px;
          font-size: 12px;
          letter-spacing: 0.12em;
        }
        .hues-dropdown__link:hover {
          background: var(--hues-petal);
          color: var(--hues-rose);
        }
        .hues-dropdown__link--active {
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
          color: #9b4a57; background: none; border: none; cursor: pointer;
          text-transform: uppercase; font-family: var(--ff-body);
          transition: color 0.2s;
        }
        .hues-wishlist-panel__clear:hover { color: #6f1f2f; }
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
        .hues-wishlist-item__remove:hover { background: #f9ecec; color: #6f1f2f; }

        /* ── Announce bar ── */
        .hues-announce {
          position: fixed;
          left: 0;
          right: 0;
          top: var(--nav-h);
          z-index: 199;
          height: 34px;
          background: var(--hues-rose);
          color: rgba(236,236,230,0.92);
          display: flex;
          align-items: center;
          overflow: hidden;
          font-family: var(--ff-body);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .hues-announce__track {
          display: flex;
          width: max-content;
          white-space: nowrap;
          animation: marquee 50s linear infinite;
        }

        .hues-announce__item {
          flex-shrink: 0;
          padding-right: 80px;
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

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
          pointer-events: none;
        }
        .hues-drawer-backdrop--open {
          opacity: 1;
          pointer-events: auto;
        }

        /* ── Drawer panel ── */
        .hues-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 500;
          width: min(320px, 85vw);
          background: var(--hues-cream);
          display: flex; flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.38s cubic-bezier(.25,1,.5,1);
          overflow: hidden;
          box-shadow: 4px 0 40px rgba(111,31,47,0.18);
          pointer-events: none;
        }
        .hues-drawer--open {
          transform: translateX(0);
          pointer-events: auto;
        }
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
        .hues-drawer__link--active {
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
        .hues-drawer__sub--open { max-height: 1200px; }
        .hues-drawer__group {
          border-bottom: 0.5px solid var(--hues-border);
        }
        .hues-drawer__group:last-child { border-bottom: none; }
        .hues-drawer__sublink {
          display: block; width: 100%; padding: 12px 24px 12px 36px;
          font-family: var(--ff-body); font-size: 11px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--hues-muted);
          background: none; border: none; cursor: pointer; text-align: left;
          transition: color 0.2s;
        }
        .hues-drawer__sublink--group {
          font-weight: 700;
          color: var(--hues-rose);
          padding-left: 24px;
        }
        .hues-drawer__subcategories {
          padding-bottom: 6px;
        }
        .hues-drawer__sublink--child {
          padding-left: 40px;
          font-size: 10px;
          letter-spacing: 0.12em;
        }
        .hues-drawer__sublink:hover { color: var(--hues-rose); }
        .hues-drawer__sublink--active { color: var(--hues-rose); }
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
        .hues-drawer__signout { color: #9b4a57; }
        .hues-drawer__signout:hover { background: #f9ecec; }
        .hues-drawer__signin { color: var(--hues-rose); }
        .hues-drawer__signin:hover { background: var(--hues-petal); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hues-nav {
            padding: 0 14px;
            backdrop-filter: blur(18px) saturate(180%);
          }
          .hues-links { display: none; }
          .hues-user-pill { display: none; }
          .hues-nav__inner { position: relative; }
          .hues-hamburger {
            display: flex;
            width: 42px;
            height: 42px;
            border: 0.5px solid var(--hues-border);
            background: color-mix(in srgb, var(--hues-petal) 35%, transparent);
          }
          .hues-hamburger:active { transform: scale(0.96); }
          .hues-drawer-backdrop { display: block; }
          .hues-nav__inner { gap: 8px; }
          .hues-nav__left {
            gap: 12px;
            min-width: 0;
            flex: 1 1 0;
          }
          .hues-logo {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1;
          }
          .hues-logo__image { height: 36px; }
          .hues-nav__right {
            gap: 6px;
            flex: 0 0 auto;
            margin-left: auto;
            position: relative;
            z-index: 2;
          }
          .hues-nav__action--search,
          .hues-nav__desktop-only {
            display: none !important;
          }
          .hues-nav__action--wishlist {
            display: block;
          }
          .hues-action-btn {
            width: 38px;
            height: 38px;
            border: 0.5px solid var(--hues-border);
            border-radius: 50%;
            background: color-mix(in srgb, var(--hues-petal) 28%, transparent);
          }
          .hues-action-btn:active { transform: scale(0.96); }
          .hues-wishlist-panel {
            position: fixed; top: var(--nav-h);
            left: 0; right: 0; width: 100%;
            border-radius: 0 0 var(--hues-r) var(--hues-r);
          }
          .hues-drawer {
            width: min(360px, 88vw);
            border-top-right-radius: 24px;
            border-bottom-right-radius: 24px;
            border-right: 0.5px solid var(--hues-border);
          }
          .hues-drawer__head {
            padding: 0 18px;
          }
          .hues-drawer__link {
            min-height: 54px;
            padding: 16px 18px;
          }
          .hues-drawer__sublink {
            min-height: 46px;
            padding-left: 30px;
          }
          .hues-drawer__foot {
            padding: 18px;
          }
          .hues-drawer__signin,
          .hues-drawer__signout {
            min-height: 44px;
            justify-content: center;
          }
          .hues-drawer__quick-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 10px;
          }
          .hues-drawer__quick-action {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            min-height: 44px;
            padding: 10px 14px;
            border: 0.5px solid var(--hues-border);
            border-radius: var(--hues-r);
            background: color-mix(in srgb, var(--hues-petal) 35%, transparent);
            color: var(--hues-muted);
            font-family: var(--ff-body);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            cursor: pointer;
          }
          .hues-drawer__quick-action--bag {
            color: var(--hues-rose);
            background: var(--hues-petal);
          }
        }
        @media (max-width: 400px) {
          .hues-logo__image { height: 30px; margin-left: 70px; }
          .hues-action-btn { width: 36px; height: 36px; }
          .hues-nav__right { gap: 4px; }
        }

        /* ── Search Overlay Styles ── */
        .hues-search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999;
          background: color-mix(in srgb, var(--hues-bg) 95%, transparent);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          animation: huesSearchFadeIn 0.3s ease both;
        }

        @keyframes huesSearchFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hues-search-overlay__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 48px;
          border-bottom: 0.5px solid var(--hues-border);
          gap: 24px;
        }

        @media (max-width: 768px) {
          .hues-search-overlay__header {
            padding: 16px 20px;
          }
        }

        .hues-search-overlay__input-wrapper {
          display: flex;
          align-items: center;
          flex: 1;
          gap: 16px;
          background: color-mix(in srgb, var(--hues-petal) 40%, transparent);
          padding: 12px 20px;
          border-radius: 40px;
          border: 0.5px solid var(--hues-border);
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .hues-search-overlay__input-wrapper svg {
          color: var(--hues-rose);
          flex-shrink: 0;
        }

        .hues-search-overlay__input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--ff-body);
          font-size: 15px;
          color: var(--hues-rose);
        }

        .hues-search-overlay__input::placeholder {
          color: var(--hues-muted);
          opacity: 0.7;
        }

        .hues-search-overlay__clear {
          background: transparent;
          border: none;
          color: var(--hues-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .hues-search-overlay__clear:hover {
          color: var(--hues-rose);
        }

        .hues-search-overlay__close-btn {
          font-family: var(--ff-body);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--hues-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          padding: 8px 16px;
        }

        .hues-search-overlay__close-btn:hover {
          color: var(--hues-rose);
        }

        .hues-search-overlay__body {
          flex: 1;
          overflow-y: auto;
          padding: 48px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .hues-search-overlay__body {
            padding: 24px 20px;
          }
        }

        .hues-search-overlay__section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hues-rose);
          margin-bottom: 24px;
          border-bottom: 0.5px solid var(--hues-border);
          padding-bottom: 8px;
        }

        .hues-search-overlay__suggestions {
          max-width: 600px;
          margin: 0 auto;
        }

        .hues-search-overlay__suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .hues-search-overlay__tag-btn {
          font-family: var(--ff-body);
          font-size: 12px;
          font-weight: 500;
          color: var(--hues-rose);
          background: transparent;
          border: 0.5px solid var(--hues-border);
          padding: 8px 20px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.25s;
        }

        .hues-search-overlay__tag-btn:hover {
          background: var(--hues-petal);
          border-color: var(--hues-blush);
        }

        .hues-search-overlay__loading,
        .hues-search-overlay__empty,
        .hues-search-overlay__error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 64px 0;
          color: var(--hues-muted);
          font-family: var(--ff-body);
        }

        .hues-search-overlay__loading p,
        .hues-search-overlay__empty p,
        .hues-search-overlay__error {
          font-size: 16px;
          color: var(--hues-rose);
          margin-bottom: 8px;
        }

        .hues-search-overlay__spinner {
          width: 32px;
          height: 32px;
          border: 2px solid var(--hues-border);
          border-top-color: var(--hues-rose);
          border-radius: 50%;
          animation: huesSearchSpinner 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes huesSearchSpinner {
          to { transform: rotate(360deg); }
        }

        .hues-search-overlay__results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          padding-bottom: 48px;
        }

        .hues-search-result-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          border: 0.5px solid var(--hues-border);
          border-radius: 16px;
          background: var(--hues-bg);
          cursor: pointer;
          transition: all 0.3s;
        }

        .hues-search-result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(111, 31, 47, 0.04);
          border-color: var(--hues-blush);
        }

        .hues-search-result-card__image {
          width: 80px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--hues-petal);
          flex-shrink: 0;
        }

        .hues-search-result-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hues-search-result-card__info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        .hues-search-result-card__collection {
          font-family: var(--ff-body);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hues-blush);
          margin-bottom: 4px;
        }

        .hues-search-result-card__name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          font-weight: 500;
          color: var(--hues-rose);
          margin: 0 0 6px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hues-search-result-card__price {
          font-family: var(--ff-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--hues-rose);
        }
      `}</style>

      {/* ── Announcement bar ── */}
      <div className="hues-announce">
        <div className="hues-announce__track">
          {[...announcements, ...announcements].map((msg, i) => (
            <span key={i} className="hues-announce__item">
              {msg} ✦
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
        avatarSrc={avatarSrc}
        userInitial={userInitial}
        isActiveRoute={isActiveRoute}
        isCollectionsActive={isCollectionsActive}
        currentPath={location.pathname}
        onSearchClick={() => setShowSearch(true)}
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
              <IconMenu />
            </button>

            <Logo isDark={theme === "dark"} />

            <ul className="hues-links">
              {PUBLIC_LINKS.map(link => (
                <li key={link.label} className="hues-links__item">
                  {link.dropdown ? (
                    <button
                      type="button"
                      className={`hues-link hues-link--button${isCollectionsActive ? " hues-link--active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setDesktopDropdownOpen((current) => (current === link.label ? null : link.label));
                      }}
                      aria-expanded={desktopDropdownOpen === link.label}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link to={link.to} className={`hues-link${isActiveRoute(link.to) ? " hues-link--active" : ""}`}>
                      {link.label}
                    </Link>
                  )}
                  {link.dropdown && (
                    <div className={`hues-dropdown hues-dropdown--collection ${desktopDropdownOpen === link.label ? "hues-dropdown--open" : ""}`} role="menu">
                      {link.dropdown.map((group) => (
                        <Link
                          key={group.label}
                          to={group.route}
                          className={`hues-dropdown__link hues-dropdown__link--group${isActiveRoute(group.route) ? " hues-dropdown__link--active" : ""}`}
                          role="menuitem"
                        >
                          {group.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}

              {isAuthenticated && hasRole(["Admin", "SuperAdmin"]) && (
                <li className="hues-links__item">
                  <Link to="/admin" className={`hues-link hues-link--admin${isActiveRoute("/admin") ? " hues-link--active" : ""}`}>Dashboard</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Right: actions */}
          <div className="hues-nav__right">

            <ActionBtn onClick={() => setShowSearch(true)} label="Search" className="hues-nav__action--search">
              <IconSearch />
            </ActionBtn>

            <div className="hues-nav__action--wishlist" style={{ position: "relative" }} ref={wishlistRef}>
              <ActionBtn
                onClick={() => setShowWishlist(p => !p)}
                label="Wishlist"
                badge={wishlist.length || null}
              >
                <span className={heartPulse ? "hues-heart-pulse" : ""} style={{ display: "flex" }}>
                  <IconHeart filled={wishlist.length > 0} />
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
              <IconBag />
            </ActionBtn>

            <div className="hues-nav__desktop-only" style={{ display: "contents" }}>
            {isAuthenticated ? (
              <>
                <span className="hues-user-pill" style={{ marginLeft: 6 }}>
                  <span className="hues-user-pill__avatar" aria-hidden="true" style={{ overflow: "hidden" }}>
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      userInitial
                    )}
                  </span>
                  {user.role} · {userFirstName}
                </span>
                <ActionBtn onClick={() => navigate("/profile")} label="Profile">
                  <IconPerson />
                </ActionBtn>
                <ActionBtn onClick={() => navigate("/my-orders")} label="My orders">
                  <IconParcel />
                </ActionBtn>
                <ActionBtn onClick={handleLogout} label="Sign out">
                  <IconLogout />
                </ActionBtn>
              </>
            ) : (
              <Link to="/signin" style={{ display: "flex" }}>
                <ActionBtn label="Sign in">
                  <IconPerson />
                </ActionBtn>
              </Link>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Search Overlay ── */}
      {showSearch && (
        <div className="hues-search-overlay" role="dialog" aria-modal="true" aria-label="Search site">
          <div className="hues-search-overlay__header">
            <div className="hues-search-overlay__input-wrapper">
              <IconSearch />
              <input
                type="text"
                className="hues-search-overlay__input"
                placeholder="Search our collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className="hues-search-overlay__clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <IconClose />
                </button>
              )}
            </div>
            <button
              type="button"
              className="hues-search-overlay__close-btn"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              aria-label="Close search"
            >
              Close
            </button>
          </div>

          <div className="hues-search-overlay__body">
            {searchLoading ? (
              <div className="hues-search-overlay__loading">
                <div className="hues-search-overlay__spinner" />
                <p>Loading collection items...</p>
              </div>
            ) : searchError ? (
              <div className="hues-search-overlay__error">{searchError}</div>
            ) : !searchQuery ? (
              <div className="hues-search-overlay__suggestions">
                <h4 className="hues-search-overlay__section-title">Trending Searches</h4>
                <div className="hues-search-overlay__suggestion-tags">
                  {["Dresses", "Tops", "Shirts", "Skirts", "Pants", "Accessories"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="hues-search-overlay__tag-btn"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="hues-search-overlay__empty">
                <p>No results found for "{searchQuery}"</p>
                <span>Try searching for something else, e.g. "dress" or "pants"</span>
              </div>
            ) : (
              <div className="hues-search-overlay__results">
                <h4 className="hues-search-overlay__section-title">
                  Search Results ({filteredProducts.length})
                </h4>
                <div className="hues-search-overlay__results-grid">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="hues-search-result-card"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="hues-search-result-card__image">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="hues-search-result-card__info">
                        <span className="hues-search-result-card__collection">
                          {product.collection}
                        </span>
                        <h4 className="hues-search-result-card__name">{product.name}</h4>
                        <span className="hues-search-result-card__price">{product.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

