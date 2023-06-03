import "./Header.css";
import Button from "../Button/Button";

function Header() {
  return (
    <section>
      <div className="flex justify-center p-5 mb-12 bg-card text-accent select-none">
          <h1 className="font-semibold text-4xl">
            maple symbols
          </h1>
      </div>
    </section>
  );
}

export default Header;
