import { useState } from "react";

export default function HoverRevealImage({
  src,
  alt = "",
  wrapperClassName = "",
  imgClassName = "",
  zoom = 1,
  fit = "cover",
  style = {},
  imgStyle = {},
  onClick,
  showTooltip = false,
  tooltipText = "Quick View",
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative ${wrapperClassName}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
    >
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        style={{
          objectFit: fit,
          width: "100%",
          height: "100%",
          display: "block",
          ...imgStyle,
        }}
      />
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.12)",
            opacity: hovered ? 1 : 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: "none",
            borderRadius: "inherit",
          }}
        >
          <span
            style={{
              transform: hovered ? "translateY(0)" : "translateY(6px)",
              opacity: hovered ? 1 : 0,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s",
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(8px)",
              color: "var(--color-primary)",
              fontSize: "10px",
              fontWeight: "750",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              padding: "7px 14px",
              borderRadius: "999px",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <i className="ti ti-eye" style={{ fontSize: "11px" }}></i>
            {tooltipText}
          </span>
        </div>
      )}
    </div>
  );
}

