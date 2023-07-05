import "./Footer.css";

function Footer() {
  return (
    <section className="footer">
      <div className="flex items-center text-tertiary space-x-8 mt-28 p-5">
        <p>&copy; 2023 Maple Symbols ━ v1.0.0 Beta</p>
        <a
          target="_blank"
          href="https://discord.gg/FTMgy2ZKPK"
          className="text-[#7289da] hover:text-white outline-none transition-all"
        >
          <p>Discord</p>
        </a>
      </div>
    </section>
  );
}

export default Footer;
