import "./Footer.css";

function Footer() {
  return (
    <section className="footer">
      <div className="flex justify-center text-tertiary mt-28 p-5">
        <div className="flex justify-between w-2/3">
          <p>&copy; 2023 Maple Symbols</p>
          <a href="">Donate</a>
        </div>
      </div>
    </section>
  );
}

export default Footer;
