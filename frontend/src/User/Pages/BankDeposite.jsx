import { useEffect, useState, useRef } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { useCart } from "../../context/CartContext"; 
import NavBar from "../../components/NavBar"; 
import Footer from "../../components/Footer"; 
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/client";
import { hasCompleteCheckoutAddress, loadCheckoutAddress, saveCheckoutAddress } from "../lib/checkoutAddress";
import { Toast } from "../../components/Toast";
import { useToast } from "../../hooks/useToast";

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES = `
  
  *, *::before, *::after { box-sizing: border-box; }
  ::selection { background: var(--color-primary-container); color: var(--color-on-primary-container); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--color-surface-container-low); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(var(--color-primary-container),var(--color-primary-container)); border-radius:6px; }

  @keyframes bdFadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bdShimmer  { 0%{background-position:-300% center} 100%{background-position:300% center} }
  @keyframes bdDrift    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(5deg)} }
  @keyframes bdBgPulse  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes bdBarIn    { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes bdSuccess  { 0%{transform:scale(0) rotate(-15deg);opacity:0} 80%{transform:scale(1.12) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes bdRingPulse{ 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.16);opacity:.9} }

  .bd-page {
    font-family: 'Cormorant Garamond', serif;
    background:linear-gradient(-40deg,var(--color-surface),var(--color-surface),var(--color-surface-container-low),var(--color-surface));
    background-size:400% 400%;
    animation:bdBgPulse 18s ease infinite;
    min-height:100vh; color:var(--color-on-surface);
  }

  .bd-display { font-family:'Cormorant Garamond',serif; }

  .bd-shimmer-title {
    background:linear-gradient(90deg,var(--color-primary) 0%,var(--color-primary-container) 35%,var(--color-primary-container) 50%,var(--color-primary-container) 65%,var(--color-primary) 100%);
    background-size:300% auto;
    -webkit-background-clip:text; background-clip:text;
    -webkit-text-fill-color:transparent;
    animation:bdShimmer 6s linear infinite;
  }

  .bd-glass {
    background:var(--color-surface);
    backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
    border:1px solid rgba(230,175,200,0.28);
    box-shadow:0 6px 36px rgba(180,60,110,0.07), 0 1px 0 var(--color-surface) inset;
    border-radius:24px;
    transition:box-shadow .4s, transform .4s;
  }
  .bd-glass:hover { box-shadow:0 12px 52px rgba(180,60,110,0.12); }

  /* Bank detail row */
  .bd-row {
    display:flex; flex-direction:column; gap:4px;
    padding:18px 0;
    border-bottom:1px solid rgba(220,160,190,0.20);
  }
  .bd-row:last-child { border-bottom:none; }
  .bd-row-label {
    font-family: 'Cormorant Garamond', serif;
    font-size:9.5px; font-weight:700; letter-spacing:.20em; text-transform:uppercase;
    color:var(--color-primary);
  }
  .bd-row-value {
    font-family:'Cormorant Garamond',serif;
    font-size:20px; font-weight:400; color:var(--color-on-surface); letter-spacing:.02em;
  }

  /* Copy button */
  .bd-copy-btn {
    align-self:flex-start; margin-top:2px;
    font-family: 'Cormorant Garamond', serif; font-size:9px; font-weight:700;
    letter-spacing:.14em; text-transform:uppercase;
    border:1.5px solid rgba(210,155,185,0.40); border-radius:999px;
    background:var(--color-surface); color:var(--color-primary);
    padding:3px 10px; cursor:pointer; transition:all .25s;
  }
  .bd-copy-btn:hover { background:var(--color-primary); color:var(--color-on-primary); border-color:var(--color-primary); }
  .bd-copy-btn.copied { background:rgba(100,170,80,0.12); border-color:rgba(100,170,80,0.40); color:#5a9040; }

  /* Drop zone */
  .bd-dropzone {
    border:2px dashed rgba(210,155,185,0.45);
    border-radius:20px; cursor:pointer;
    transition:all .35s;
    background:var(--color-surface);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:14px; padding:52px 32px; text-align:center;
    position:relative; overflow:hidden;
  }
  .bd-dropzone:hover, .bd-dropzone.dragging {
    border-color:var(--color-primary);
    background:rgba(184,64,112,0.05);
    box-shadow:0 4px 24px rgba(184,64,112,0.10);
  }
  .bd-dropzone-icon {
    width:64px; height:64px; border-radius:50%;
    background:linear-gradient(135deg,rgba(200,120,160,0.14),rgba(240,180,210,0.10));
    border:1.5px solid rgba(210,155,185,0.30);
    display:flex; align-items:center; justify-content:center;
    font-size:26px; transition:transform .3s;
  }
  .bd-dropzone:hover .bd-dropzone-icon { transform:translateY(-4px) scale(1.08); }

  .bd-file-chip {
    display:inline-flex; align-items:center; gap:8px;
    padding:8px 16px; border-radius:999px; margin-top:14px;
    background:rgba(184,64,112,0.08); border:1.5px solid rgba(184,64,112,0.22);
    font-family: 'Cormorant Garamond', serif; font-size:12px; font-weight:500; color:var(--color-primary);
    max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }

  /* Submit button */
  .bd-submit-btn {
    width:100%; padding:18px 32px; border:none; cursor:pointer;
    border-radius:999px; font-family: 'Cormorant Garamond', serif;
    font-size:11px; font-weight:700; letter-spacing:.22em; text-transform:uppercase;
    color:var(--color-on-primary);
    background:linear-gradient(135deg,var(--color-primary-container),var(--color-primary-container),var(--color-primary-container));
    background-size:200% auto;
    box-shadow:0 8px 28px rgba(168,56,94,0.32);
    position:relative; overflow:hidden;
    transition:transform .3s, box-shadow .3s, background-position .4s;
  }
  .bd-submit-btn:hover {
    transform:translateY(-2px) scale(1.01);
    box-shadow:0 12px 36px rgba(168,56,94,0.42);
    background-position:right center;
  }
  .bd-submit-btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%);
    transform:translateX(-100%); transition:transform .6s;
  }
  .bd-submit-btn:hover::before { transform:translateX(100%); }
  .bd-submit-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  /* Success overlay */
  .bd-success-ring {
    position:absolute; inset:-4px; border-radius:50%;
    border:2px solid rgba(184,64,112,0.35);
    animation:bdRingPulse 2.4s ease-in-out infinite;
  }
  .bd-success-circle {
    width:80px; height:80px; border-radius:50%; margin:0 auto 20px;
    background:linear-gradient(135deg,var(--color-primary),var(--color-primary-container));
    display:flex; align-items:center; justify-content:center;
    font-size:32px; position:relative;
    animation:bdSuccess .65s cubic-bezier(.4,0,.2,1) both;
  }

  /* Petal */
  .bd-petal {
    position:absolute; pointer-events:none; user-select:none;
    opacity:.14; color:var(--color-primary-container);
    animation:bdDrift 5.5s ease-in-out infinite;
  }

  /* Steps */
  .bd-step {
    display:flex; gap:16px; align-items:flex-start;
    padding:14px 0; border-bottom:1px solid rgba(220,160,190,0.18);
  }
  .bd-step:last-child { border-bottom:none; }
  .bd-step-num {
    width:28px; height:28px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,var(--color-primary),var(--color-primary-container));
    display:flex; align-items:center; justify-content:center;
    font-family: 'Cormorant Garamond', serif; font-size:11px; font-weight:700; color:var(--color-on-primary);
  }

  .bd-info-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:999px;
    background:rgba(200,120,160,0.10); border:1px solid rgba(210,155,185,0.28);
    font-family: 'Cormorant Garamond', serif; font-size:10px; font-weight:600;
    letter-spacing:.10em; text-transform:uppercase; color:var(--color-outline);
  }

  .bd-fade-1 { animation:bdFadeUp .75s .05s ease both; }
  .bd-fade-2 { animation:bdFadeUp .75s .18s ease both; }
  .bd-fade-3 { animation:bdFadeUp .75s .30s ease both; }
  .bd-fade-4 { animation:bdFadeUp .75s .42s ease both; }
  .bd-fade-5 { animation:bdFadeUp .75s .54s ease both; }
`;

/* ─── Bank details ─────────────────────────────────────────────────────── */
const bankDetails = [
  { label: "Bank Name",      value: "Commercial Bank" },
  { label: "Account Name",   value: "R D Weerasinghe" },
  { label: "Account Number", value: "8004941206" },
  { label: "Branch",         value: "Maharagama" },
];

const steps = [
  { text: "Log in to your bank's app or visit a branch." },
  { text: "Transfer the exact total to the account above." },
  { text: "Download or photograph your deposit slip." },
  { text: "Upload it below and click Submit." },
  { text: "We verify within 1–2 business days and dispatch your order." },
];

/* ─── Copy button ──────────────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={`bd-copy-btn${copied ? " copied" : ""}`} onClick={copy} type="button">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
const BankDeposit = () => { 
  const navigate = useNavigate(); 
  const { clear, totalPrice, items = [], subtotal = 0, shippingCost = 0 } = useCart(); 
  const { isAuthenticated, user, updateProfile } = useAuth();
  const [customer, setCustomer] = useState(() => loadCheckoutAddress());

  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);
  const allowedProofTypes = ["image/png", "image/jpeg", "application/pdf"];
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    setCustomer(loadCheckoutAddress(isAuthenticated ? user : null));
  }, [isAuthenticated, user]);

  const selectPaymentProof = (file) => {
    if (!file) return;
    if (!allowedProofTypes.includes(file.type)) {
      showToast("Please upload a PNG, JPG, or PDF deposit slip.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Please upload a deposit slip smaller than 5 MB.");
      return;
    }
    setPaymentProofFile(file);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(0) + " KB");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    selectPaymentProof(file);
  };
  const handleDrop = (e) => { 
    e.preventDefault(); setIsDragging(false); 
    const file = e.dataTransfer.files?.[0]; 
    selectPaymentProof(file);
  }; 
  const handleCustomerChange = (e) => setCustomer(p => ({ ...p, [e.target.name]: e.target.value }));

  const toCents = (amount) => Math.round((Number(amount) || 0) * 100);
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const buildOrderPayload = async () => ({
    paymentMethod: "BankDeposit",
    promoCode: null,
    shippingCents: toCents(shippingCost),
    discountCents: 0,
    currency: "LKR",
    customer: {
      name: customer.name || null,
      email: customer.email || null,
      phone: customer.phone || null,
      addressLine1: customer.addressLine1 || null,
      addressLine2: customer.addressLine2 || null,
      city: customer.city || null,
      postalCode: customer.postalCode || null,
      country: customer.country || null,
    },
    items: (items || []).map((it) => ({
      productId: typeof it.productId === "string" ? it.productId : null,
      productName: it.name,
      unitPriceCents: toCents(it.price),
      quantity: it.qty,
      size: it.size || null,
      color: it.color || null,
    })),
    paymentProof: paymentProofFile ? {
      fileName: paymentProofFile.name,
      contentType: paymentProofFile.type,
      data: await fileToBase64(paymentProofFile),
    } : null,
  });

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if (!items?.length) return;
    if (!hasCompleteCheckoutAddress(customer)) {
      showToast("Please complete your shipping address before placing the order.");
      return;
    }

    try {
      await apiFetch("/orders", { method: "POST", body: JSON.stringify(await buildOrderPayload()) });
      if (isAuthenticated) {
        try {
          const nextUser = await updateProfile({
            phone: customer.phone || null,
            addressLine1: customer.addressLine1 || null,
            addressLine2: customer.addressLine2 || null,
            city: customer.city || null,
            postalCode: customer.postalCode || null,
            country: customer.country || null,
          });
          saveCheckoutAddress(nextUser || user, customer);
        } catch {
          saveCheckoutAddress(user, customer);
        }
      } else {
        saveCheckoutAddress(null, customer);
      }
      setSubmitted(true); 
      setTimeout(() => { clear(); navigate("/my-orders", { replace: true }); }, 3500); 
    } catch (err) {
      showToast(err?.message || "Failed to place order.");
    }
  }; 

  return (
    <div className="bd-page">
      <style>{STYLES}</style>
    {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    <NavBar />

      <main className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20 pt-[100px] pb-28">

        {/* ── Hero header ── */}
        <div className="text-center pt-14 pb-14 bd-fade-1">
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 18px", borderRadius: 999, marginBottom: 22,
              background: "rgba(200,120,160,0.10)", border: "1px solid rgba(210,155,185,0.25)",
              fontFamily: "'Cormorant Garamond', serif", fontSize: 10, fontWeight: 700,
              letterSpacing: ".20em", textTransform: "uppercase", color: "var(--color-primary)",
            }}
          >
            <span>🏦</span> Bank Deposit
          </div>

          <h1
            className="bd-display bd-shimmer-title"
            style={{ fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 300, lineHeight: 1.06, marginBottom: 14 }}
          >
            Bank Deposit Details
          </h1>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ height: 1, width: 48, background: "linear-gradient(90deg,transparent,var(--color-primary-container))" }} />
            <span style={{ color: "var(--color-primary-container)", fontSize: 15 }}>✦</span>
            <div style={{ height: 1, width: 48, background: "linear-gradient(90deg,var(--color-primary-container),transparent)" }} />
          </div>

          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "var(--color-outline)", maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>
            Transfer the total amount to the account below and upload your deposit slip — we'll take it from there.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ═══ LEFT column ═══ */}
          <div className="w-full lg:w-[58%] flex flex-col gap-6 order-2 lg:order-1">

            {/* Bank info card */}
            <div className="bd-glass p-8 md:p-10 relative overflow-hidden bd-fade-2">
              {/* Decorative petals */}
              <div className="bd-petal" style={{ top: 16, right: 22, fontSize: 22, animationDelay: "0s" }}>✿</div>
              <div className="bd-petal" style={{ bottom: 18, left: 16, fontSize: 16, animationDelay: "1.8s" }}>✿</div>

              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background:"linear-gradient(135deg,rgba(200,120,160,0.15),rgba(240,180,210,0.10))",
                  border:"1.5px solid rgba(210,155,185,0.30)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                }}>🏛️</div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:700, letterSpacing:".20em", textTransform:"uppercase", color:"var(--color-primary)" }}>
                  Account Details
                </span>
              </div>

              {bankDetails.map(({ label, value }) => (
                <div key={label} className="bd-row">
                  <span className="bd-row-label">{label}</span>
                  <span className="bd-row-value">{value}</span>
                  {(label === "Account Number" || label === "Account Name") && (
                    <CopyBtn text={value} />
                  )}
                </div>
              ))}
            </div>

            {/* Steps card */} 
            <div className="bd-glass p-8 bd-fade-3"> 
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background:"linear-gradient(135deg,rgba(200,120,160,0.15),rgba(240,180,210,0.10))",
                  border:"1.5px solid rgba(210,155,185,0.30)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                }}>📋</div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:700, letterSpacing:".20em", textTransform:"uppercase", color:"var(--color-primary)" }}>
                  How It Works
                </span>
              </div>

              {steps.map(({ text }, i) => (
                <div key={i} className="bd-step">
                  <div className="bd-step-num">{i + 1}</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:14, color:"var(--color-on-surface-variant)", lineHeight:1.65, paddingTop:3 }}>{text}</p>
                </div>
              ))}
            </div> 
 
            {/* Shipping details card */} 
            <div className="bd-glass p-8 bd-fade-4"> 
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}> 
                <div style={{ 
                  width:36, height:36, borderRadius:"50%", 
                  background:"linear-gradient(135deg,rgba(200,120,160,0.15),rgba(240,180,210,0.10))", 
                  border:"1.5px solid rgba(210,155,185,0.30)", 
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, 
                }}>🏷️</div> 
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:700, letterSpacing:".20em", textTransform:"uppercase", color:"var(--color-primary)" }}> 
                  Shipping Details 
                </span> 
              </div> 
 
              <div style={{ display:"grid", gap:12 }}> 
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}> 
                  <input 
                    className="bd-input" 
                    name="name" 
                    value={customer.name} 
                    onChange={handleCustomerChange} 
                    placeholder="Full name" 
                    style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }} 
                  /> 
                  <input 
                    className="bd-input" 
                    name="phone" 
                    value={customer.phone} 
                    onChange={handleCustomerChange} 
                    placeholder="Phone" 
                    style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }} 
                  /> 
                </div> 
                <input 
                  className="bd-input" 
                  name="email" 
                  value={customer.email} 
                  onChange={handleCustomerChange} 
                  placeholder="Email (optional)" 
                  style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }} 
                /> 
                <input
                  className="bd-input"
                  name="addressLine1"
                  value={customer.addressLine1}
                  onChange={handleCustomerChange}
                  placeholder="Address line 1"
                  required
                  style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }}
                />
                <input 
                  className="bd-input" 
                  name="addressLine2" 
                  value={customer.addressLine2} 
                  onChange={handleCustomerChange} 
                  placeholder="Address line 2 (optional)" 
                  style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }} 
                /> 
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}> 
                <input
                  className="bd-input"
                  name="city"
                  value={customer.city}
                  onChange={handleCustomerChange}
                  placeholder="City"
                  required
                  style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }}
                />
                <input
                  className="bd-input"
                  name="postalCode"
                  value={customer.postalCode}
                  onChange={handleCustomerChange}
                  placeholder="Postal code"
                  required
                  style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }}
                />
                <input
                  className="bd-input"
                  name="country"
                  value={customer.country}
                  onChange={handleCustomerChange}
                  placeholder="Country"
                  required
                  style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1.5px solid rgba(210,155,185,0.45)", padding:"10px 0", outline:"none", fontFamily: "'Cormorant Garamond', serif" }}
                />
                </div> 
              </div> 
            </div> 
 
            {/* Upload card */} 
            <div className="bd-glass p-8 bd-fade-4"> 
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background:"linear-gradient(135deg,rgba(200,120,160,0.15),rgba(240,180,210,0.10))",
                  border:"1.5px solid rgba(210,155,185,0.30)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                }}>📎</div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:700, letterSpacing:".20em", textTransform:"uppercase", color:"var(--color-primary)" }}>
                  Upload Deposit Slip
                </span>
              </div>

              {/* Drop zone */}
              <div
                className={`bd-dropzone${isDragging ? " dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {/* Decorative background circle */}
                <div style={{
                  position:"absolute", width:180, height:180, borderRadius:"50%",
                  background:"radial-gradient(circle,rgba(200,120,160,0.07),transparent 70%)",
                  pointerEvents:"none",
                }} />

                <div className="bd-dropzone-icon">☁️</div>

                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:15, fontWeight:600, color:"var(--color-on-surface)", marginBottom:4 }}>
                    {isDragging ? "Drop it here ✨" : "Drag & drop your slip"}
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:12, color:"var(--color-outline)" }}>or click to browse</p>
                </div>

                <span className="bd-info-pill">PNG · JPG · PDF · Max 5 MB</span>
              </div>

              {/* File chip */}
              {fileName && (
                <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:16 }}>
                  <div className="bd-file-chip" style={{ flex:1 }}>
                    <span>📄</span>
                    <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{fileName}</span>
                    <span style={{ opacity:.6, fontSize:11 }}>· {fileSize}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentProofFile(null);
                      setFileName(null);
                      setFileSize(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-outline)", fontSize:18, padding:4 }}
                    onMouseEnter={e => e.currentTarget.style.color="var(--color-primary-container)"}
                    onMouseLeave={e => e.currentTarget.style.color="var(--color-outline)"}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="bd-fade-5">
              {submitted ? (
                <div style={{ textAlign:"center", padding:"40px 24px" }}>
                  <div style={{ position:"relative", display:"inline-block", marginBottom:20 }}>
                    <div className="bd-success-ring" />
                    <div className="bd-success-circle">✨</div>
                  </div>
                  <p className="bd-display" style={{ fontSize:32, fontWeight:300, color:"var(--color-primary)", marginBottom:8 }}>
                    Proof Submitted!
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:14, color:"var(--color-outline)" }}>
                    We'll verify your transfer and dispatch your order within 1–2 business days. Redirecting…
                  </p>
                </div>
              ) : (
                <>
                  <button
                    className="bd-submit-btn"
                    onClick={handleSubmit}
                    disabled={!fileName}
                    title={!fileName ? "Please upload your deposit slip first" : ""}
                  >
                    Submit Payment Proof — Rs.{totalPrice.toFixed(2)}
                    <svg style={{ display:"inline", marginLeft:10, verticalAlign:"middle" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>

                  {!fileName && (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:11, color:"var(--color-outline)", textAlign:"center", marginTop:10 }}>
                      Please upload your deposit slip to continue.
                    </p>
                  )}

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:16, opacity:.65 }}>
                    <span style={{ fontSize:13 }}>🔒</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:"var(--color-outline)" }}>
                      Secure Encrypted Submission
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: Order summary ═══ */}
          <div className="w-full lg:w-[42%] order-1 lg:order-2" style={{ position: "static" }}>
            <div className="bd-glass p-8 md:p-10 flex flex-col gap-6 lg:sticky lg:top-[110px]">

              <h2 className="bd-display" style={{ fontSize:28, fontWeight:300, color:"var(--color-on-surface)", marginBottom:4 }}>
                Order Summary
              </h2>

              {/* Items */}
              {items.length === 0 ? (
                /* Fallback static preview (matches original design) */
                <div style={{ display:"flex", gap:14, paddingBottom:18, borderBottom:"1px solid rgba(220,160,190,0.20)" }}>
                  <div style={{ width:68, height:88, borderRadius:12, overflow:"hidden", background:"rgba(240,175,210,0.15)", flexShrink:0 }}>
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCvb18bi3GAqfDoYvuhw4BRsMTCwD9HAMTKjcGJt36pTMwouSZk75jnYCXWiAVsj8yyBQpdvghv-vEzvBn6omBEiy27QewP1ZF3rVma08_-A6Wr0Hn3Uobta5ZLWqN-_YT2D2QHIoN6swNBBakis02wATFX0vQKdBgypdMZSzPa_TdmTAw2JiClCY465drlnBDd9YoDIpsFxG0dbnFIdXMiU8HLoGL7X6Cv78vAB0j9PljuIZHVEB-qAYZsFWC7zV8zOeg752uzGDN"
                      alt="Rose Silk Petal Scarf"
                      style={{ width:"100%", height:"100%", objectFit:"cover" }}
                    />
                  </div>
                  <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                    <div>
                      <p className="bd-display" style={{ fontSize:17, color:"var(--color-on-surface)", lineHeight:1.3, marginBottom:4 }}>Rose Silk Petal Scarf</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--color-outline)" }}>One Size · Blush</p>
                    </div>
                    <p className="bd-display" style={{ fontSize:18, color:"var(--color-primary)", fontWeight:500 }}>Rs.350.00</p>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {items.map(it => (
                    <div key={`${it.id}-${it.size}`} style={{ display:"flex", gap:14, paddingBottom:16, borderBottom:"1px solid rgba(220,160,190,0.18)" }}>
                      <div style={{ width:68, height:88, borderRadius:12, overflow:"hidden", background:"rgba(240,175,210,0.15)", flexShrink:0 }}>
                        <img src={it.image} alt={it.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                        <div>
                          <p className="bd-display" style={{ fontSize:17, color:"var(--color-on-surface)", lineHeight:1.3, marginBottom:3 }}>{it.name}</p>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--color-outline)" }}>
                            Size: {it.size} · Qty: {it.qty}
                          </p>
                        </div>
                        <p className="bd-display" style={{ fontSize:18, color:"var(--color-primary)", fontWeight:500 }}>
                          Rs.{((Number(it.price) || 0) * it.qty).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price rows */}
              <div style={{ display:"flex", flexDirection:"column", gap:12, borderTop:"1px solid rgba(220,160,190,0.22)", paddingTop:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:14, color:"var(--color-outline)" }}>Subtotal</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:14, color:"var(--color-on-surface)" }}>
                    Rs.{items.length ? subtotal.toFixed(2) : "350.00"}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:14, color:"var(--color-outline)" }}>Shipping</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:14, color: shippingCost === 0 ? "var(--color-tertiary)" : "var(--color-on-surface)" }}>
                    {items.length
                      ? (shippingCost === 0 ? "✓ Complimentary" : `Rs.${shippingCost.toFixed(2)}`)
                      : "Rs.70.00"}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:14, borderTop:"1px solid rgba(220,160,190,0.22)" }}>
                  <span className="bd-display" style={{ fontSize:26, fontWeight:300, color:"var(--color-on-surface)" }}>Total</span>
                  <span className="bd-display" style={{ fontSize:26, fontWeight:500, color:"var(--color-primary)" }}>
                    Rs.{items.length ? totalPrice.toFixed(2) : "420.00"}
                  </span>
                </div>
              </div>

              {/* Processing note */}
              <div style={{ borderRadius:14, padding:"16px 18px", background:"rgba(184,64,112,0.05)", border:"1px solid rgba(184,64,112,0.14)", display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>ℹ️</span>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:10, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:"var(--color-primary)", marginBottom:5 }}>
                    Processing Note
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize:13, color:"var(--color-on-surface-variant)", lineHeight:1.65 }}>
                    Bank transfers typically clear in 1–2 business days. Your order will be dispatched once verification is complete.
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {["🌿 Eco Packaging", "🔒 Secure", "✈️ Swift Dispatch"].map(b => (
                  <span key={b} className="bd-info-pill">{b}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BankDeposit;
