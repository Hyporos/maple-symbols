import { FaTwitch, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { cn } from "../lib/utils";
import { useMediaQuery } from "react-responsive";

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

const CreditText = ({
  label,
  img,
  link,
  twitch,
  youtube,
  x,
}: CreditTextProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });

  return (
    <div className="flex justify-center items-center gap-2">
      {/* LABEL */}
      <a
        href={link}
        target="_blank"
        className={cn(
          "flex justify-center items-center gap-2",
          link && "text-accent hover:text-white"
        )}
      >
        <img src={img} width={!isMobile ? 18 : 16} />
        <p className="text-xs md:text-sm transition-all">{label}</p>
      </a>

      {/* SOCIAL MEDIA */}
      {twitch && (
        <a href={twitch} target="_blank">
          <FaTwitch
            size={!isMobile ? 16 : 14}
            className="hover:fill-[#6441a5] hover:scale-110 transition-all "
          />
        </a>
      )}

      {youtube && (
        <a href={youtube} target="_blank">
          <FaYoutube
            size={!isMobile ? 16 : 14}
            className="hover:fill-[#e00000] hover:scale-110 transition-all"
          />
        </a>
      )}

      {x && (
        <a href={x} target="_blank">
          <FaXTwitter
            size={!isMobile ? 16 : 14}
            className="hover:fill-white hover:scale-110 transition-all"
          />
        </a>
      )}
    </div>
  );
};

export default CreditText;
