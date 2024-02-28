import { FaDiscord, FaGithub, FaPaypal } from "react-icons/fa6";

function Footer() {
  return (
    <section className="flex flex-col items-center bg-gradient-to-t from-card-grad to-card gap-5 p-6 mt-16">
      <div className="flex space-x-6">
        <a
          href="https://github.com/Hyporos/maple-symbols"
          target="_blank"
          className=""
        >
          <FaGithub
            size={26}
            className="hover:scale-110 hover:fill-[#B18BD0] transition-all"
          />
        </a>
        <a href="https://discord.gg/FTMgy2ZKPK" target="_blank" className="">
          <FaDiscord
            size={26}
            className="hover:scale-110 hover:fill-[#7289DA] transition-all"
          />
        </a>
        <a
          href="https://www.paypal.com/donate/?hosted_button_id=RL3T3LA3QNVTU"
          target="_blank"
          className=""
        >
          <FaPaypal
            size={26}
            className="hover:scale-110 hover:fill-[#009CDE] transition-all"
          />
        </a>
      </div>
      <div className="h-px bg-white/10 w-full max-w-[360px]"></div>
      <p className="text-tertiary">&copy; 2024 Maple Symbols ━ v1.3 Beta</p>
    </section>
  );
}

export default Footer;
