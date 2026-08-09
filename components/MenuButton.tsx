type MenuButtonProps = {
  onClick?: () => void;
  "aria-expanded"?: boolean;
};

export default function MenuButton({
  onClick,
  "aria-expanded": ariaExpanded,
}: MenuButtonProps) {
  return (
    <button
      type="button"
      className="menu-button"
      aria-label="Menu"
      aria-expanded={ariaExpanded}
      onClick={onClick}
    >
      <span className="menu-button__line" />
      <span className="menu-button__line" />
      <span className="menu-button__line" />
    </button>
  );
}
