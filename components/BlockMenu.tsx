import {
  BLOCK_TYPES,
  BLOCK_TYPE_LIST,
  type BlockType,
} from "@/lib/blockTypes";

type BlockMenuProps = {
  open: boolean;
  selected: BlockType | null;
  onSelect: (blockType: BlockType) => void;
};

export default function BlockMenu({ open, selected, onSelect }: BlockMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <nav className="block-menu" aria-label="Block menu">
      {BLOCK_TYPE_LIST.map((blockType) => {
        const isSelected = selected === blockType;

        return (
          <button
            key={blockType}
            type="button"
            className={`block-menu__section${isSelected ? " block-menu__section--selected" : ""}`}
            onClick={() => onSelect(blockType)}
          >
            <span className="block-menu__label">{BLOCK_TYPES[blockType].label}</span>
          </button>
        );
      })}
    </nav>
  );
}
