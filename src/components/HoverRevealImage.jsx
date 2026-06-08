import { useState } from "react";

export default function HoverRevealImage({
  src,
  alt = "",
  wrapperClassName = "",
  imgClassName = "",
  zoom = 1.18,
  fit = "cover",
  style = {},
  imgStyle = {},
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState("50% 50%");

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPosition(`${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`);
  };

  return (
    <div
      className={wrapperClassName}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        setHovered(false);
        setPosition("50% 50%");
      }}
      onClick={onClick}
      style={{ cursor: hovered ? "move" : "zoom-in", ...style }}
    >
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        style={{
          objectFit: fit,
          objectPosition: hovered ? position : "50% 50%",
          transform: hovered ? `scale(${zoom})` : "scale(1)",
          transformOrigin: hovered ? position : "center",
          transition: "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), object-position 0.2s ease",
          willChange: "transform, object-position",
          ...imgStyle,
        }}
      />
    </div>
  );
}
