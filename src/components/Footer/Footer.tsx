import "./Footer.css";

function Footer() {
  return (
    <section className="footer">
      <div className="flex flex-col-reverse text-center tablet:flex-row items-center text-tertiary tablet:space-x-10 mt-28 p-5 ">
      <a
          target="_blank"
          href="https://github.com/Hyporos/maple-symbols"
          className="text-[#b18bd0] hover:text-white outline-none transition-all select-none hidden tablet:block"
        > 
          <p className="mb-2 tablet:mb-0">GitHub</p>
        </a>
        <p>&copy; 2023 Maple Symbols ━ v1.2.2 Beta</p>
        <div className="flex space-x-6 block tablet:hidden">
        <a
          target="_blank"
          href="https://discord.gg/FTMgy2ZKPK"
          className="text-[#7289da] hover:text-white outline-none transition-all select-none"
        >
          <p className="mb-2 tablet:mb-0">Discord</p>
        </a>
        <a
          target="_blank"
          href="https://github.com/Hyporos/maple-symbols"
          className="text-[#b18bd0] hover:text-white outline-none transition-all select-none"
        > 
          <p className="mb-2 tablet:mb-0">GitHub</p>
        </a>
        </div>
        <a
          target="_blank"
          href="https://discord.gg/FTMgy2ZKPK"
          className="text-[#7289da] hover:text-white outline-none transition-all select-none hidden tablet:block"
        >
          <p className="mb-2 tablet:mb-0">Discord</p>
        </a>
      </div>
    </section>
  );
}

export default Footer;
