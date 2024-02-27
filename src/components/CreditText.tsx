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
// * It will include an image and a label. Optionally, social media and other links could be added.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CreditText = ({
  label,
  img,
  link,
  twitch,
  youtube,
  x,
}: CreditTextProps) => {
  return (
    <div className="flex justify-center items-center space-x-2 [&>a]:transition-all">
      <img src={img} width={18} />

      <a
        href={link}
        target="_blank"
        className={cn("text-sm", link && "text-accent hover:text-white")}
      >
        {label}
      </a>

      {twitch && (
        <a href={twitch} target="_blank">
          <FaTwitch className="hover:fill-[#6441a5]" />
        </a>
      )}

      {youtube && (
        <a href={youtube} target="_blank">
          <FaYoutube className="hover:fill-[#e00000]" />
        </a>
      )}

      {x && (
        <a href={x} target="_blank">
          <FaXTwitter className="hover:fill-white" />
        </a>
      )}
    </div>
  );
};

export default CreditText;
