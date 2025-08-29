import { useMediaQuery } from "react-responsive";
import { FaDiscord, FaGithub, FaPaypal } from "react-icons/fa6";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Footer component is the bottom most component of the page which includes links and copyright.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

function Footer() {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });

  return (
    <section className="mt-auto">
      <section className="flex flex-col items-center bg-gradient-to-t from-card-grad to-card gap-4 md:gap-5 p-6 mt-16">
        <div className="flex gap-6">
          <a href="https://github.com/Hyporos/maple-symbols" target="_blank">
            <FaGithub
              size={!isMobile ? 26 : 22}
              className="hover:scale-110 hover:fill-[#B18BD0] transition-all"
            />
          </a>
          <a href="https://discord.gg/FTMgy2ZKPK" target="_blank">
            <FaDiscord
              size={!isMobile ? 26 : 22}
              className="hover:scale-110 hover:fill-[#7289DA] transition-all"
            />
          </a>
          <a
            href="https://www.paypal.com/donate/?hosted_button_id=RL3T3LA3QNVTU"
            target="_blank"
          >
            <FaPaypal
              size={!isMobile ? 26 : 22}
              className="hover:scale-110 hover:fill-[#009CDE] transition-all"
            />
          </a>
        </div>
        <div className="h-px bg-white/10 w-full max-w-[260px] md:max-w-[360px]"></div>
        <p className="text-sm md:text-base text-tertiary">
          &copy; 2025 Maple Symbols ━ v1.3.0.1 Beta
        </p>
      </section>
    </section>
  );
}

export default Footer;
