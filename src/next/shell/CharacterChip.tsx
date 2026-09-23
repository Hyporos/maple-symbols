import { useRef, useState } from "react";
import { HiChevronDown, HiOutlineUser } from "react-icons/hi2";
import { useMessages } from "../../i18n";
import ComingSoonNote from "./ComingSoonNote";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * CharacterChip is the header's "which character" place: character profiles are a 2.0 feature,
// * so today it only opens a note saying so (spec §3). Stays in the header on every breakpoint.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CharacterChip = () => {
  const m = useMessages().next.shell;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-light px-3 py-2 text-sm text-secondary transition-colors hover:text-primary motion-reduce:transition-none"
      >
        <HiOutlineUser />
        {m.characterChip}
        <HiChevronDown />
      </button>
      <ComingSoonNote
        open={open}
        onClose={() => setOpen(false)}
        title={m.characterMenu}
        text={m.charactersSoon}
        anchor={buttonRef.current}
      />
    </>
  );
};

export default CharacterChip;
