import "./Footer.css";

function Footer() {
  //v1.0.0 Beta
  return (
    <section className="footer">
      <div className="flex items-center text-tertiary space-x-7 mt-28 p-5">
      <a
          target="_blank"
          href="https://discord.gg/FTMgy2ZKPK"
          className="text-[#7289da] hover:text-white outline-none transition-all"
        >
          <p>Discord</p>
        </a>
        <p>&copy; 2023 Maple Symbols ━ <span className="text-red-500">Test Build</span></p>

      </div>
    </section>
  );
}

export default Footer;
