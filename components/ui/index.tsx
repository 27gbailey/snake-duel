import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`.trim()}>
      {title && <h2 className="panel__title">{title}</h2>}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}

export function NavBar({
  items,
}: {
  items: { label: string; screen: string; onClick: () => void }[];
}) {
  return (
    <nav className="nav-bar">
      {items.map((item) => (
        <button
          key={item.screen}
          type="button"
          className="nav-bar__btn"
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
