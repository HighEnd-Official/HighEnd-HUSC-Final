import { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Elegant exit animation starts slightly before loading finishes
    const fadeTimeout = setTimeout(() => setFade(true), 1400);
    const completeTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1800);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "radial-gradient(circle at center, #1F0D11 0%, #0C0305 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fade ? 0 : 1,
        visibility: fade ? "hidden" : "visible",
        transition: "opacity 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.45s",
        pointerEvents: fade ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <style>{`
        @keyframes loaderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loaderSpinRev {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes loaderPulse {
          0%, 100% { transform: scale(0.98); opacity: 0.85; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        @keyframes loaderShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes loaderFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        .loader-ring-out {
          animation: loaderSpin 3s linear infinite;
        }
        .loader-ring-in {
          animation: loaderSpinRev 2s linear infinite;
        }
        .loader-brand {
          animation: loaderPulse 2s ease-in-out infinite;
          background: linear-gradient(
            90deg, 
            #F9D3E3 0%, 
            #E0A5BF 25%, 
            #FFFFFF 50%, 
            #E0A5BF 75%, 
            #F9D3E3 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: loaderShimmer 4s linear infinite, loaderPulse 2s ease-in-out infinite;
        }
        .loader-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(224, 165, 191, 0.45);
          animation: loaderFloat 3s ease-in-out infinite;
        }
      `}</style>

      {/* Luxury double spinner & Logo */}
      <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyCenter: "center" }}>
        {/* Outer Gold/Rose Ring */}
        <div
          className="loader-ring-out"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid transparent",
            borderTopColor: "rgba(224, 165, 191, 0.35)",
            borderBottomColor: "rgba(224, 165, 191, 0.35)",
          }}
        />

        {/* Inner Burgundy Ring */}
        <div
          className="loader-ring-in"
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            border: "1px solid transparent",
            borderLeftColor: "rgba(111, 31, 47, 0.45)",
            borderRightColor: "rgba(111, 31, 47, 0.45)",
          }}
        />

        {/* Center Sparkle & Brand Text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: -2,
          }}
        >
          <span style={{ fontSize: 13, color: "#E0A5BF", opacity: 0.6, marginBottom: 4 }}>✦</span>
          <span
            className="loader-brand"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
              fontWeight: 300,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              paddingLeft: 4, // centering adjustments for track spacing
            }}
          >
            HUES
          </span>
        </div>
      </div>

      {/* Small loading message */}
      <div style={{ marginTop: 28 }}>
        <p className="loader-text">Curating the Atelier</p>
      </div>
    </div>
  );
}
