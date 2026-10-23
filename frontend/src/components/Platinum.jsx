import "./Platinum.css";

export default function Platinum({ as: Tag = "div", className = "", children, ...props }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const leave = (e) => {
    e.currentTarget.style.setProperty("--mx", "50%");
    e.currentTarget.style.setProperty("--my", "0%");
  };

  return (
    <Tag
      className={`platinum ${className}`}
      onPointerMove={move}
      onPointerLeave={leave}
      {...props}
    >
      {children}
    </Tag>
  );
}