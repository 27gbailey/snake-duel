const MENU_SECTIONS = [
  "RED",
  "ORANGE",
  "YELLOW",
  "GREEN",
  "BLUE",
  "PURPLE",
  "PINK",
  "GRASS",
  "DIRT",
  "STONE",
] as const;

type BlockMenuProps = {
  open: boolean;
};

export default function BlockMenu({ open }: BlockMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <nav className="block-menu" aria-label="Block menu">
      {MENU_SECTIONS.map((label) => (
        <div key={label} className="block-menu__section">
          <span className="block-menu__label">{label}</span>
        </div>
      ))}
    </nav>
  );
}
