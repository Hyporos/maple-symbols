import { FaDiscord, FaGithub, FaPaypal } from "react-icons/fa6";
import packageJson from "../../package.json";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Footer component is the bottom most component of the page which includes links and copyright.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

function Footer() {
  return (
    <section className="mt-auto">
      <section className="mt-16 flex flex-col items-center gap-4 bg-gradient-to-t from-card-grad to-card p-6 md:gap-5">
        <div className="flex gap-6">
          <a
            href="https://github.com/Hyporos/maple-symbols"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <FaGithub className="h-[22px] w-[22px] transition-all hover:scale-110 hover:fill-[#B18BD0] md:h-[26px] md:w-[26px]" />
          </a>
          <a
            href="https://discord.gg/FTMgy2ZKPK"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord server"
          >
            <FaDiscord className="h-[22px] w-[22px] transition-all hover:scale-110 hover:fill-[#7289DA] md:h-[26px] md:w-[26px]" />
          </a>
          <a
            href="https://www.paypal.com/donate/?hosted_button_id=RL3T3LA3QNVTU"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Donate via PayPal"
          >
            <FaPaypal className="h-[22px] w-[22px] transition-all hover:scale-110 hover:fill-[#009CDE] md:h-[26px] md:w-[26px]" />
          </a>
        </div>
        <div className="h-px w-full max-w-[260px] bg-white/10 md:max-w-[360px]"></div>
        <p className="text-sm text-tertiary md:text-base">
          &copy; {new Date().getFullYear()} Maple Symbols ━ v{packageJson.version} Beta
        </p>
      </section>
    </section>
  );
}

export default Footer;
