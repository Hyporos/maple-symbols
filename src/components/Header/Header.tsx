import "./Header.css";
import Button from "../Button/Button";

function Header() {
  return (
    <section>
      <div className="flex justify-between items-center px-60 flex-row">
        <div className="flex justify-center py-10">
          <h1 className="font-bold text-4xl text-primary font-maven-pro tracking-wider">
            Maple Symbols
          </h1>
        </div>
        <div className="flex flex-row space-x-4">
          <div>
            <Button name="Donate" variant="tertiary"></Button>
          </div>
          <div>
            <Button name="Documentation" variant="secondary"></Button>
          </div>
          <div>
            <Button name="Documentation" variant="primary"></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Header;
