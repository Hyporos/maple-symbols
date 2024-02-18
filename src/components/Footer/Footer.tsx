import "./Footer.css";

function Footer() {
  return (
    <section className="footer">
      <div className="flex flex-col-reverse text-center tablet:flex-row items-center text-tertiary tablet:space-x-10">
        <p>&copy; 2024 Maple Symbols ━ v1.3 Beta</p>
      </div>
    </section>
  );
}

export default Footer;
