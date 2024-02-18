import { Dispatch, SetStateAction } from "react";
import { FaCalculator, FaBook } from "react-icons/fa";
import { cn } from "../../lib/utils";
import "./Header.css";

interface Props {
  selectedPage: number;
  setSelectedPage: Dispatch<SetStateAction<number>>;
}

const Header = ({ selectedPage, setSelectedPage }: Props) => {
  return (
    <section className="header">
      <div className="flex items-center space-x-10 max-w-[1200px] mx-auto">
        <img src="/main/favicon.png" className="w-[50px] tablet:w-[50px]"></img>
        <button
          className={cn(
            "page-select group",
            selectedPage === 1 && "bg-secondary border-accent"
          )}
          onClick={() => setSelectedPage(1)}
        >
          <FaCalculator
            size={22}
            className={cn(
              "fill-basic group-hover:fill-hover transition-all",
              selectedPage === 1 && "fill-hover"
            )}
          />
        </button>
        <button
          className={cn(
            "page-select group",
            selectedPage === 2 && "bg-secondary border-accent"
          )}
          onClick={() => setSelectedPage(2)}
        >
          <FaBook
            size={22}
            className={cn(
              "fill-basic group-hover:fill-hover transition-all",
              selectedPage === 2 && "fill-hover"
            )}
          />
        </button>
      </div>
    </section>
  );
};

export default Header;
