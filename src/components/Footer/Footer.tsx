import "./Footer.css";

function Footer() {
  return (
    <section className="footer">
      <div className="text-tertiary mt-28 p-5">
        <div className="flex text-center space-x-96">
          <p className="">&copy; 2023 Maple Symbols</p>
          <p className="">v1.0.0 Beta</p>
          <a className="" href="">Donate</a>
        </div>
      </div>
    </section>
  );
}

export default Footer;
