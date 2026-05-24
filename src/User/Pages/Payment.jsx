import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  ::selection { background: #f4b8cc; color: #3a0f28; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer  { 0%{ background-position:-300% center; } 100%{ background-position:300% center; } }
  @keyframes lineIn   { from { transform:scaleX(0); } to { transform:scaleX(1); } }
  @keyframes bgDrift  { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
  @keyframes pulse    { 0%,100%{ opacity:.6; transform:scale(1); } 50%{ opacity:1; transform:scale(1.08); } }
  @keyframes checkIn  { 0%{ transform:scale(0) rotate(-20deg); opacity:0; } 80%{ transform:scale(1.1) rotate(3deg); } 100%{ transform:scale(1) rotate(0); opacity:1; } }

  .pay-body {
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(-40deg, #fff0f5, #fffafc, #fce8f2, #fdf5f9);
    background-size: 400% 400%;
    animation: bgDrift 18s ease infinite;
    min-height: 100vh;
    color: #1e1018;
  }

  .pay-display { font-family: 'Cormorant Garamond', serif; }

  /* shimmer heading */
  .pay-shimmer {
    background: linear-gradient(90deg, #a83860 0%, #d86090 35%, #f4b0cc 50%, #d86090 65%, #a83860 100%);
    background-size: 300% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 6s linear infinite;
  }

  /* glass panels */
  .pay-glass {
    background: rgba(255,255,255,0.76);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(230,175,200,0.28);
    box-shadow: 0 6px 36px rgba(180,60,110,0.07), 0 1px 0 rgba(255,255,255,0.85) inset;
    transition: box-shadow .4s, transform .4s;
    border-radius: 24px;
  }
  .pay-glass:hover { box-shadow: 0 12px 52px rgba(180,60,110,0.12); }

  /* underline input */
  .pay-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid rgba(210,155,185,0.45);
    outline: none;
    padding: 10px 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #1e1018;
    transition: border-color .3s;
  }
  .pay-input::placeholder { color: rgba(190,150,170,0.60); }
  .pay-input:focus { border-bottom-color: #c07098; }

  /* focus underline glow bar */
  .pay-field { position: relative; }
  .pay-field-bar {
    position: absolute; bottom: 0; left: 0; height: 2px;
    background: linear-gradient(90deg, #b84070, #e898c0);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .42s cubic-bezier(.4,0,.2,1);
    border-radius: 2px;
  }
  .pay-input:focus ~ .pay-field-bar { transform: scaleX(1); }

  /* method tabs */
  .pay-tab {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: .14em; text-transform: uppercase;
    padding: 14px 0; border: none; background: transparent;
    cursor: pointer; transition: color .3s;
    position: relative; color: #9a7088;
  }
  .pay-tab.active { color: #b84070; }
  .pay-tab.active::after {
    content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg,#b84070,#e898c0);
    border-radius: 2px; animation: lineIn .35s ease both;
  }

  /* submit button */
  .pay-btn {
    width: 100%; padding: 18px 32px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
    border: none; cursor: pointer; border-radius: 999px;
    background: linear-gradient(135deg, #9a2850, #c85888, #e090b8);
    background-size: 200% auto;
    color: #fff;
    box-shadow: 0 8px 28px rgba(168,56,94,0.32);
    position: relative; overflow: hidden;
    transition: transform .3s, box-shadow .3s, background-position .4s;
  }
  .pay-btn:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 12px 36px rgba(168,56,94,0.42);
    background-position: right center;
  }
  .pay-btn::before {
    content:'';
    position:absolute; inset:0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform .6s;
  }
  .pay-btn:hover::before { transform: translateX(100%); }

  /* bank outline btn */
  .pay-btn-outline {
    width: 100%; padding: 18px 32px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
    border: 2px solid #b84070; cursor: pointer; border-radius: 999px;
    background: transparent; color: #b84070;
    transition: all .3s;
  }
  .pay-btn-outline:hover { background: #b84070; color: #fff; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,56,94,0.28); }

  /* shipping radio card */
  .ship-card {
    flex: 1; display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-radius: 12px; cursor: pointer;
    border: 1.5px solid rgba(210,155,185,0.35);
    transition: all .3s;
    background: rgba(255,255,255,0.55);
  }
  .ship-card.selected {
    border-color: #b84070;
    background: rgba(184,64,112,0.05);
    box-shadow: 0 2px 12px rgba(184,64,112,0.12);
  }

  /* quantity control */
  .qty-btn {
    width: 28px; height: 28px; border: none; background: transparent; cursor: pointer;
    font-size: 14px; color: #9a7088; display: flex; align-items: center; justify-content: center;
    transition: color .2s, background .2s; border-radius: 50%;
  }
  .qty-btn:hover:not(:disabled) { background: rgba(184,64,112,0.10); color: #b84070; }
  .qty-btn:disabled { opacity: .35; cursor: default; }

  /* promo input */
  .promo-input {
    flex: 1; background: rgba(255,255,255,0.70); border: 1.5px solid rgba(210,155,185,0.35);
    border-radius: 10px; padding: 10px 14px; font-family:'DM Sans',sans-serif;
    font-size: 13px; color: #1e1018; outline: none; transition: border-color .3s;
    letter-spacing: .08em; text-transform: uppercase;
  }
  .promo-input:focus { border-color: #b84070; }
  .promo-input::placeholder { color: rgba(190,150,170,0.55); text-transform: none; letter-spacing: normal; }

  .promo-apply-btn {
    background: #1e1018; color: #fff; border: none; border-radius: 10px;
    padding: 10px 18px; font-family:'DM Sans',sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
    cursor: pointer; transition: background .3s;
  }
  .promo-apply-btn:hover { background: #b84070; }

  /* success state */
  .pay-success {
    text-align: center; padding: 60px 24px;
  }
  .success-circle {
    width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 24px;
    background: linear-gradient(135deg, #b84070, #e090b8);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    animation: checkIn .6s cubic-bezier(.4,0,.2,1) both;
  }

  /* bank card rows */
  .bank-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid rgba(210,155,185,0.20);
  }
  .bank-row:last-child { border-bottom: none; padding-bottom: 0; }

  /* decorative petal */
  @keyframes driftPetal { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-10px) rotate(6deg); } }
  .petal { animation: driftPetal 5s ease-in-out infinite; pointer-events:none; user-select:none; }

  .fade-1 { animation: fadeUp .7s .05s ease both; }
  .fade-2 { animation: fadeUp .7s .15s ease both; }
  .fade-3 { animation: fadeUp .7s .25s ease both; }
  .fade-4 { animation: fadeUp .7s .35s ease both; }
  .fade-5 { animation: fadeUp .7s .45s ease both; }
`;

/* ─── Bank details ────────────────────────────────────────────────────────── */
const bankDetails = [
  { label: "Account Name",   value: "HUES ATELIER LTD" },
  { label: "Bank Name",      value: "SANTANDER RESERVE" },
  { label: "Account Number", value: "8842 1190 2234" },
  { label: "Reference",      value: "ORD-HUES-9821" },
];

/* ─── Underline Field ─────────────────────────────────────────────────────── */
function Field({ label, name, type = "text", placeholder, value, onChange, maxLength, half }) {
  return (
    <div className={`flex flex-col gap-2${half ? "" : ""}`}>
      <label
        style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#9a7088" }}
      >
        {label}
      </label>
      <div className="pay-field">
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pay-input"
          maxLength={maxLength}
          autoComplete="off"
        />
        <div className="pay-field-bar" />
      </div>
    </div>
  );
}

/* ─── Decorative petal ────────────────────────────────────────────────────── */
function Petal({ style }) {
  return <div className="petal absolute" style={{ fontSize: 20, color: "rgba(200,120,160,0.18)", ...style }} aria-hidden="true">✿</div>;
}

/* ─── Main Payment Component ─────────────────────────────────────────────── */
const Payment = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ cardholderName: "", cardNumber: "", expiry: "", cvc: "" });

  // — Cart context (replace with real hook in your project) —
  const {
  items = [],
  removeItem = () => {},
  changeQuantity = () => {},
  subtotal = 0,
  shippingCost = 0,
  shippingMethod = "standard",
  setShippingMethod = () => {},
  promoCode = "",
  discountAmount = 0,
  applyPromoCode = () => ({ success: false, message: "Invalid code" }),
  removePromoCode = () => {},
  totalPrice = 0,
  clear = () => {},
} = useCart();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.cardholderName && form.cardNumber && form.expiry && form.cvc) {
      setSubmitted(true);
      setTimeout(() => { clear(); navigate("/", { replace: true }); }, 3200);
    }
  };

  return (
    <div className="pay-body">
      <style>{STYLES}</style>
      <NavBar />

      <main className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20 pt-[100px] pb-24">
        {/* ── Page header ── */}
        <div className="text-center pt-14 pb-12 fade-1">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
            style={{ background: "rgba(200,120,160,0.10)", border: "1px solid rgba(200,120,160,0.22)", fontSize: 11, fontWeight: 700, letterSpacing: ".20em", textTransform: "uppercase", color: "#b84070", fontFamily: "'DM Sans',sans-serif" }}
          >
            <span>💳</span> Secure Checkout
          </div>
          <h1 className="pay-display pay-shimmer" style={{ fontSize: "clamp(44px,6vw,72px)", fontWeight: 300, lineHeight: 1.05, marginBottom: 12 }}>
            Complete Your Order
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div style={{ height: 1, width: 48, background: "linear-gradient(90deg,transparent,#c07098)" }} />
            <span style={{ color: "#c07098", fontSize: 16 }}>✦</span>
            <div style={{ height: 1, width: 48, background: "linear-gradient(90deg,#c07098,transparent)" }} />
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ═══ LEFT: Payment form ═══ */}
          <div className="w-full lg:w-[58%] fade-2">
            <div className="pay-glass p-8 md:p-12 relative overflow-hidden">
              <Petal style={{ top: 18, right: 24, animationDelay: "0s" }} />
              <Petal style={{ bottom: 20, left: 18, fontSize: 15, animationDelay: "1.8s" }} />

              {submitted ? (
                <div className="pay-success">
                  <div className="success-circle">✨</div>
                  <p className="pay-display" style={{ fontSize: 34, fontWeight: 300, color: "#b84070", marginBottom: 10 }}>
                    Order Placed!
                  </p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#9a7088" }}>
                    Thank you for shopping with HUES. Redirecting you home…
                  </p>
                </div>
              ) : (
                <>
                  {/* Method tabs */}
                  <div className="flex gap-8 border-b mb-10" style={{ borderColor: "rgba(210,155,185,0.28)" }}>
                    {[{ k: "card", label: "Card Payment" }, { k: "bank", label: "Bank Deposit" }].map(({ k, label }) => (
                      <button key={k} className={`pay-tab${paymentMethod === k ? " active" : ""}`} onClick={() => setPaymentMethod(k)}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* ── Card form ── */}
                  {paymentMethod === "card" && (
                    <form onSubmit={handleSubmit}>
                      <div className="flex flex-col gap-8">
                        <Field label="Cardholder Name"  name="cardholderName" placeholder="Sofia Valentini"     value={form.cardholderName} onChange={handleChange} />
                        <Field label="Card Number"       name="cardNumber"     placeholder="0000  0000  0000  0000" value={form.cardNumber}     onChange={handleChange} maxLength={19} />
                        <div className="grid grid-cols-2 gap-8">
                          <Field label="Expiry Date" name="expiry" placeholder="MM / YY" value={form.expiry} onChange={handleChange} maxLength={5} />
                          <Field label="CVC"         name="cvc"    placeholder="•••"     value={form.cvc}    onChange={handleChange} maxLength={4} />
                        </div>

                        {/* Card brand icons (decorative) */}
                        <div className="flex items-center gap-3 pt-1">
                          {["VISA","MC","AMEX"].map(b => (
                            <span key={b} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: ".10em", color: "#c0a0b4", border: "1.5px solid rgba(210,155,185,0.35)", borderRadius: 6, padding: "3px 8px" }}>
                              {b}
                            </span>
                          ))}
                          <span style={{ fontSize: 10, color: "#c0a0b4", marginLeft: "auto", fontFamily: "'DM Sans',sans-serif" }}>🔒 256-bit SSL</span>
                        </div>

                        <button type="submit" className="pay-btn mt-2">
                          Pay Now — Rs.{totalPrice.toFixed(2)}
                          <svg style={{ display:"inline", marginLeft:10, verticalAlign:"middle" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ── Bank deposit ── */}
                  {paymentMethod === "bank" && (
                    <div className="flex flex-col gap-8">
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#9a7088", lineHeight: 1.7 }}>
                        Transfer the total amount to the account below. Your order will be processed once funds are cleared.
                      </p>
                      <div style={{ background: "rgba(240,175,210,0.09)", border: "1px solid rgba(210,155,185,0.28)", borderRadius: 16, padding: "24px 28px" }}>
                        {bankDetails.map(({ label, value }) => (
                          <div key={label} className="bank-row">
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#9a7088" }}>{label}</span>
                            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#1e1018" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => navigate("/bank-deposit")} className="pay-btn-outline">
                        Confirm — Bank Deposit
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: Order summary ═══ */}
          <div className="w-full lg:w-[42%] fade-3" style={{ position: "sticky", top: 120 }}>
            <div className="pay-glass p-8 md:p-10 flex flex-col gap-6">
              <h2 className="pay-display" style={{ fontSize: 28, fontWeight: 300, color: "#1e1018", marginBottom: 4 }}>
                Order Summary
              </h2>

              {/* Items */}
              {items.length === 0 ? (
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#9a7088" }}>Your bag is empty.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {items.map((it) => (
                    <div key={`${it.id}-${it.size}`} className="flex gap-4 pb-5" style={{ borderBottom:"1px solid rgba(210,155,185,0.20)" }}>
                      <div style={{ width:70, height:92, borderRadius:12, overflow:"hidden", background:"rgba(240,175,210,0.15)", flexShrink:0 }}>
                        <img src={it.image} alt={it.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:"#1e1018", lineHeight:1.3, marginBottom:3 }}>{it.name}</p>
                            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"#b0909a" }}>
                              Size: {it.size}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(it.id, it.size)}
                            style={{ background:"none", border:"none", cursor:"pointer", color:"#c0a0b4", padding:4, borderRadius:6, transition:"color .2s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#e05070"}
                            onMouseLeave={e => e.currentTarget.style.color = "#c0a0b4"}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-1" style={{ border:"1px solid rgba(210,155,185,0.35)", borderRadius:8, overflow:"hidden" }}>
                            <button className="qty-btn" onClick={() => changeQuantity(it.id, it.size, it.qty - 1)} disabled={it.qty <= 1}>−</button>
                            <span style={{ width:28, textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#1e1018" }}>{it.qty}</span>
                            <button className="qty-btn" onClick={() => changeQuantity(it.id, it.size, it.qty + 1)}>+</button>
                          </div>
                          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#b84070", fontWeight:500 }}>
                            Rs.{((Number(it.price) || 0) * it.qty).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Promo code */}
              {items.length > 0 && (
                <div style={{ borderTop:"1px solid rgba(210,155,185,0.22)", paddingTop:18 }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#9a7088", marginBottom:10 }}>
                    Promo Code
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const code = e.target.elements.promoCodeInput.value;
                      const res = applyPromoCode(code);
                      alert(res.message);
                      if (res.success) e.target.reset();
                    }}
                    style={{ display:"flex", gap:8 }}
                  >
                    <input name="promoCodeInput" type="text" placeholder="e.g. HUES10" className="promo-input" />
                    <button type="submit" className="promo-apply-btn">Apply</button>
                  </form>
                  {promoCode && (
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, padding:"8px 14px", borderRadius:10, background:"rgba(184,64,112,0.07)", border:"1px solid rgba(184,64,112,0.18)" }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:".12em", color:"#b84070" }}>✓ {promoCode}</span>
                      <button onClick={removePromoCode} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#9a7088", textDecoration:"underline" }}>Remove</button>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping */}
              {items.length > 0 && (
                <div style={{ borderTop:"1px solid rgba(210,155,185,0.22)", paddingTop:18 }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".16em", textTransform:"uppercase", color:"#9a7088", marginBottom:12 }}>
                    Shipping Method
                  </p>
                  <div style={{ display:"flex", gap:10 }}>
                    {[{ k:"standard", label:"Standard", price: subtotal >= 8000 ? "Free" : "Rs. 350" }, { k:"express", label:"Express", price:"Rs. 750" }].map(({ k, label, price }) => (
                      <label key={k} className={`ship-card${shippingMethod === k ? " selected" : ""}`} onClick={() => setShippingMethod(k)}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <input type="radio" name="ship" checked={shippingMethod === k} onChange={() => setShippingMethod(k)} style={{ accentColor:"#b84070" }} />
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:"#1e1018" }}>{label}</span>
                        </div>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#9a7088" }}>{price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              <div style={{ borderTop:"1px solid rgba(210,155,185,0.22)", paddingTop:20, display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#9a7088" }}>Subtotal</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#1e1018" }}>Rs.{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#b84070" }}>Discount</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:"#b84070" }}>–Rs.{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#9a7088" }}>Shipping</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color: shippingCost === 0 ? "#6a9050" : "#1e1018" }}>
                    {shippingCost === 0 ? "✓ Complimentary" : `Rs.${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:14, borderTop:"1px solid rgba(210,155,185,0.22)" }}>
                  <span className="pay-display" style={{ fontSize:26, fontWeight:300, color:"#1e1018" }}>Total</span>
                  <span className="pay-display" style={{ fontSize:26, fontWeight:500, color:"#b84070" }}>Rs.{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Eco note */}
              <div style={{ borderRadius:14, padding:"16px 20px", background:"rgba(184,64,112,0.05)", border:"1px solid rgba(184,64,112,0.14)", display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:18 }}>🌿</span>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6a4050", lineHeight:1.6 }}>
                  <strong>Sustainable:</strong> Shipped in 100% biodegradable artisan packaging.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;