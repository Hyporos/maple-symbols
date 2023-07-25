import { useMediaQuery } from "react-responsive";
import "./Header.css";

function Header() {
  const isMobile = useMediaQuery({ query: `(max-width: 799px)` });
  return (
    <section className="header">
      <div className="text-accent p-5 flex-shrink-0">
            <img src="/main/logo.png" width={isMobile ? 300 : 350}></img>
      </div>
    </section>
  );
}

export default Header;
