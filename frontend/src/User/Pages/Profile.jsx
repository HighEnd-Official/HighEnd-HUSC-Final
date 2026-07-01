import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { apiFetch, getApiBaseUrl } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import adminAvatarImg from "../../assets/logo/Admin.png";
import superAdminAvatarImg from "../../assets/logo/superAdmin.png";
import userAvatarImg from "../../assets/logo/user.png";

const emptyProfile = {
  username: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "",
};

function formatMoney(cents) {
  return `Rs.${((Number(cents) || 0) / 100).toFixed(2)}`;
}

function formatDate(value) {
  const text = String(value || "");
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function fileToAvatarPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      resolve({
        fileName: file.name,
        contentType: file.type,
        data: dataUrl.split(",")[1] || "",
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile({
      username: user?.username || "",
      phone: user?.phone || "",
      addressLine1: user?.addressLine1 || "",
      addressLine2: user?.addressLine2 || "",
      city: user?.city || "",
      postalCode: user?.postalCode || "",
      country: user?.country || "Sri Lanka",
    });
    setAvatarPreview(
      user?.avatarUrl
        ? (String(user.avatarUrl).startsWith("http") ? user.avatarUrl : `${getApiBaseUrl()}${user.avatarUrl}`)
        : ""
    );
    setAvatarFile(null);
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    let cancelled = false;
    setLoadingOrders(true);
    apiFetch("/orders/mine")
      .then((data) => {
        if (!cancelled) setOrders(data?.orders || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load your orders.");
      })
      .finally(() => {
        if (!cancelled) setLoadingOrders(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const roleKey = String(user?.role || "").toLowerCase().replace(/[^a-z]/g, "");
  const defaultAvatarSrc =
    roleKey === "superadmin" ? superAdminAvatarImg :
    roleKey === "admin" ? adminAvatarImg :
    userAvatarImg;
  const displayAvatarSrc = avatarPreview || defaultAvatarSrc;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        username: profile.username.trim(),
        phone: profile.phone.trim() || null,
        addressLine1: profile.addressLine1.trim() || null,
        addressLine2: profile.addressLine2.trim() || null,
        city: profile.city.trim() || null,
        postalCode: profile.postalCode.trim() || null,
        country: profile.country.trim() || null,
      };

      if (avatarFile) {
        payload.avatarImage = await fileToAvatarPayload(avatarFile);
      }

      await updateProfile(payload);
      setMessage("Profile updated successfully.");
      setAvatarFile(null);
    } catch (err) {
      setError(err?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface) 100%)" }}>
      <NavBar />

      <main className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 pt-[110px] pb-24">
        <div className="flex flex-col gap-3 mb-10">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--color-primary-container)" }}>
            Account Profile
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 300, color: "var(--color-on-surface)", lineHeight: 1.05 }}>
            Manage your details
          </h1>
          <p style={{ color: "var(--color-outline)", maxWidth: 680, lineHeight: 1.7 }}>
            Keep your contact details, shipping address, and profile picture in one place. We’ll reuse them at checkout automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <section style={{ background: "var(--color-surface)", border: "1px solid rgba(210,155,185,0.22)", borderRadius: 28, boxShadow: "0 18px 48px rgba(180,60,110,0.08)", padding: 28 }}>
            <div className="flex items-center gap-4 mb-8">
              <div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, var(--color-surface-container-low), var(--color-surface-container-low))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(210,155,185,0.28)" }}>
                {displayAvatarSrc ? (
                  <img
                    src={displayAvatarSrc}
                    alt="Profile avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(event) => {
                      if (defaultAvatarSrc && event.currentTarget.src !== defaultAvatarSrc) {
                        event.currentTarget.src = defaultAvatarSrc;
                      }
                    }}
                  />
                ) : (
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "var(--color-primary)" }}>
                    {(profile.username || user?.username || "U")[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-primary-container)" }}>
                  Signed in as
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300, color: "var(--color-on-surface)" }}>
                  {user?.username}
                </h2>
                <p style={{ color: "var(--color-outline)", fontSize: 13 }}>{user?.email}</p>
              </div>
            </div>

            {message ? (
              <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: "rgba(92,170,92,0.08)", border: "1px solid rgba(92,170,92,0.18)", color: "var(--color-tertiary)", fontSize: 13 }}>
                {message}
              </div>
            ) : null}
            {error ? (
              <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: "rgba(184,64,112,0.08)", border: "1px solid rgba(184,64,112,0.18)", color: "var(--color-primary)", fontSize: 13 }}>
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="grid gap-6">
              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-outline)" }}>
                  Profile photo
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      background: "var(--color-primary-container)",
                      color: "var(--color-on-primary)",
                      padding: "8px 16px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarChange}
                      hidden
                    />
                  </label>

                  <span style={{ fontSize: 13, color: "var(--color-outline)" }}>
                    {avatarFile?.name || "No file selected"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Display name" name="username" value={profile.username} onChange={handleChange} />
                <Field label="Phone number" name="phone" value={profile.phone} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Address line 1" name="addressLine1" value={profile.addressLine1} onChange={handleChange} />
                <Field label="Address line 2" name="addressLine2" value={profile.addressLine2} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="City" name="city" value={profile.city} onChange={handleChange} />
                <Field label="Postal code" name="postalCode" value={profile.postalCode} onChange={handleChange} />
                <Field label="Country" name="country" value={profile.country} onChange={handleChange} />
              </div>

              <Field label="Email address" value={user?.email || ""} readOnly />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "14px 22px",
                    borderRadius: 999,
                    border: "none",
                    background: "linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-primary) 55%, var(--color-primary-container) 100%)",
                    color: "var(--color-on-primary)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".22em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
                {/* {hasRole(["Admin", "SuperAdmin"]) ? (
                  <Link
                    to="/admin"
                    style={{
                      padding: "14px 22px",
                      borderRadius: 999,
                      border: "1px solid rgba(133,76,111,0.22)",
                      background: "var(--color-surface)",
                      color: "var(--color-primary)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".22em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                    }}
                  >
                    Admin dashboard
                  </Link>
                ) : null} */}
                <p style={{ fontSize: 12, color: "var(--color-outline)" }}>
                  Your address and phone will auto-fill at checkout.
                </p>
              </div>
            </form>
          </section>

          <aside className="grid gap-6">
            <div style={{ background: "var(--color-surface)", border: "1px solid rgba(210,155,185,0.22)", borderRadius: 24, padding: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-primary-container)", marginBottom: 12 }}>
                Saved details
              </p>
              <div className="grid gap-4">
                {[
                  ["Phone", user?.phone || "—"],
                  ["Address", [user?.addressLine1, user?.addressLine2].filter(Boolean).join(", ") || "—"],
                  ["City", user?.city || "—"],
                  ["Postal code", user?.postalCode || "—"],
                  ["Country", user?.country || "—"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, borderBottom: "1px solid rgba(210,155,185,0.16)", paddingBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--color-outline)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface)", textAlign: "right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--color-surface)", border: "1px solid rgba(210,155,185,0.22)", borderRadius: 24, padding: 24 }}>
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-primary-container)" }}>
                    Recent orders
                  </p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "var(--color-on-surface)" }}>
                    Order history
                  </h3>
                </div>
                <span style={{ fontSize: 12, color: "var(--color-outline)" }}>{orders.length} total</span>
              </div>

              {loadingOrders ? (
                <p style={{ color: "var(--color-outline)" }}>Loading orders…</p>
              ) : recentOrders.length === 0 ? (
                <p style={{ color: "var(--color-outline)" }}>No orders yet.</p>
              ) : (
                <div className="grid gap-4">
                  {recentOrders.map((order) => (
                    <article key={order.id} style={{ borderRadius: 18, border: "1px solid rgba(210,155,185,0.18)", padding: 16, background: "var(--color-surface)" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p style={{ fontWeight: 800, color: "var(--color-on-surface)" }}>Order #{String(order.id).slice(0, 10)}…</p>
                          <p style={{ marginTop: 4, fontSize: 12, color: "var(--color-outline)" }}>
                            {formatDate(order.createdAt)} · {order.paymentMethod}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: 800, color: "var(--color-primary)" }}>{formatMoney(order.totalCents)}</p>
                          <p style={{ marginTop: 4, fontSize: 12, color: "var(--color-on-surface)" }}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                      {order.items?.length ? (
                        <p style={{ marginTop: 10, fontSize: 12, color: "var(--color-outline)" }}>
                          {order.items.length} item{order.items.length === 1 ? "" : "s"} · {order.items.slice(0, 2).map((item) => item.productName).join(", ")}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, name, readOnly = false }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--color-outline)" }}>
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          width: "100%",
          padding: "12px 0",
          border: "none",
          borderBottom: "1px solid rgba(210,155,185,0.45)",
          outline: "none",
          background: "transparent",
          color: "var(--color-on-surface)",
          fontSize: 14,
          fontFamily: "'Cormorant Garamond', serif",
        }}
      />
    </label>
  );
}
