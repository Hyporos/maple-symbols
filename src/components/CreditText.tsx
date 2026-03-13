import { FaTwitch, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { cn } from "../lib/utils";

interface CreditTextProps {
  label: string;
  img: string;
  link?: string;
  twitch?: string;
  youtube?: string;
  x?: string;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The CreditText component is a small line of mention or acknowledgement given in the credits page.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CreditText = ({ label, img, link, twitch, youtube, x }: CreditTextProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {/* LABEL */}
      <a
        href={link}
        target="_blank"
        className={cn(
          "flex items-center justify-center gap-2",
          link && "text-accent hover:text-white"
        )}
      >
        <img src={img} className="w-4 md:w-[18px]" />
        <p className="text-xs transition-all md:text-sm">{label}</p>
      </a>

      {/* SOCIAL MEDIA */}
      {twitch && (
        <a href={twitch} target="_blank">
          <FaTwitch className="h-3.5 w-3.5 transition-all hover:scale-110 hover:fill-[#6441a5] md:h-4 md:w-4 " />
        </a>
      )}

      {youtube && (
        <a href={youtube} target="_blank">
          <FaYoutube className="h-3.5 w-3.5 transition-all hover:scale-110 hover:fill-[#e00000] md:h-4 md:w-4" />
        </a>
      )}

      {x && (
        <a href={x} target="_blank">
          <FaXTwitter className="h-3.5 w-3.5 transition-all hover:scale-110 hover:fill-white md:h-4 md:w-4" />
        </a>
      )}
    </div>
  );
};

export default CreditText;
