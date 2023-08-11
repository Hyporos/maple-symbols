import "./Footer.css";

function Footer() {
  // <span className="text-red-500">Test Build</span>
  return (
    <section className="footer">
      <div className="flex flex-col-reverse text-center tablet:flex-row items-center text-tertiary tablet:space-x-7 mt-28 p-5 ">
        <p>&copy; 2023 Maple Symbols ━ v1.0.2 Beta</p>
        <a
          target="_blank"
          href="https://discord.gg/FTMgy2ZKPK"
          className="text-[#7289da] hover:text-white outline-none transition-all"
        >
          <p className="mb-2 tablet:mb-0">Discord</p>
        </a>
      </div>
    </section>
  );
}

export default Footer;
