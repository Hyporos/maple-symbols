import Sheet from "../ui/Sheet";
import { useMessages } from "../../i18n";

interface ComingSoonNoteProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
  anchor?: HTMLElement | null;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ComingSoonNote is the /next shell's placeholder dialog: a Sheet with one line of copy,
// * reused by the character chip, the accessibility button and the feedback button.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ComingSoonNote = ({ open, onClose, title, text, anchor }: ComingSoonNoteProps) => {
  const m = useMessages().next.shell;

  return (
    <Sheet open={open} onClose={onClose} title={title} closeLabel={m.closeNote} anchor={anchor}>
      <p className="text-sm text-secondary">{text}</p>
    </Sheet>
  );
};

export default ComingSoonNote;
