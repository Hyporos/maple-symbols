import { Dispatch, SetStateAction } from "react";
import { cn } from "../../../lib/utils";

interface NavbarProps {
  selectedInfo: number;
  setSelectedInfo: Dispatch<SetStateAction<number>>;
}

const Navbar = ({ selectedInfo, setSelectedInfo }: NavbarProps) => {
  return (
    <nav className="flex text-center bg-dark shadow-input transition-all">
      <div
        className={cn(
          "group flex flex-col hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
          selectedInfo === 1 && "bg-light text-white"
        )}
        onClick={() => setSelectedInfo(1)}
      >
        <h1>Experience Table</h1>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
            selectedInfo === 1 ? "w-full" : "group-hover:w-1/4"
          )}
        ></div>
      </div>
      <div
        className={cn(
          "group flex flex-col hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
          selectedInfo === 2 && "bg-light text-white"
        )}
        onClick={() => setSelectedInfo(2)}
      >
        <h1>Meso Cost Table</h1>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
            selectedInfo === 2 ? "w-full" : "group-hover:w-1/4"
          )}
        ></div>
      </div>
      <div
        className={cn(
          "group flex flex-col hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
          selectedInfo === 3 && "bg-light text-white"
        )}
        onClick={() => setSelectedInfo(3)}
      >
        <h1>Damage Ratios</h1>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
            selectedInfo === 3 ? "w-full" : "group-hover:w-1/4"
          )}
        ></div>
      </div>
      <div
        className={cn(
          "group flex flex-col hover:bg-light hover:text-white transition-colors py-5 cursor-pointer w-1/4 relative px-2",
          selectedInfo === 4 && "bg-light text-white"
        )}
        onClick={() => setSelectedInfo(4)}
      >
        <h1>Credits</h1>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 mx-auto h-px w-0 bg-accent transition-all",
            selectedInfo === 4 ? "w-full" : "group-hover:w-1/4"
          )}
        ></div>
      </div>
    </nav>
  );
};

export default Navbar;
