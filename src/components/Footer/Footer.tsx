import "./Footer.css";

function Footer() {
  return (
    <section>
      <div className="flex justify-center mt-28 p-5 text-secondary bg-card">
        <div className="flex justify-between w-2/3">
          <p>&copy; 2023 Maple Symbols</p>
          <p>
            <a href="">Donate</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Footer;
