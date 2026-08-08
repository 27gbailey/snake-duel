type MenuButtonProps = {
  onClick?: () => void;
};

export default function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      className="menu-button"
      aria-label="Menu"
      onClick={onClick}
    >
      <span className="menu-button__line" />
      <span className="menu-button__line" />
      <span className="menu-button__line" />
    </button>
  );
}
