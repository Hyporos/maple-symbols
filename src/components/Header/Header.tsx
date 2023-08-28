import "./Header.css";

function Header() {
  return (
    <section className="header">
      <div className="text-accent p-5">
        <img src="/main/logo.png" className="w-[300px] tablet:w-[350px]"></img>
      </div>
    </section>
  );
}

export default Header;
