import { MdOutlineSwapVert } from "react-icons/md";
import { GoSettings } from "react-icons/go";
import { Dispatch, SetStateAction } from "react";
import "./Selector.css";

interface Props {
  swapped: boolean;
  setSwapped: Dispatch<SetStateAction<boolean>>;
}

const Selector = ({ swapped, setSwapped }: Props) => {

    const handleSettings = () => { 
        
    }

  return (
    <section>
      <div className="selector flex flex-col justify-center pt-16 z-10 mt-40">
        <div className="flex justify-between items-center px-6">
          <div>
            <GoSettings
              size={40}
              color={"#bfbfbf"}
              cursor="pointer"
              onClick={() => handleSettings()}
            />
          </div>
          <div className={`flex space-x-10 ${swapped ? "hidden" : "block"}`}>
            <div className="selector-level">
              <img src="/symbols/vj-symbol.webp" alt="VJ Symbol" />
              <p>Lv. 17</p>
            </div>
            <div className="selector-level">
              <img src="/symbols/chuchu-symbol.webp" alt="Chu Chu Symbol" />
              <p>Lv. 16</p>
            </div>
            <div className="selector-level">
              <img src="/symbols/lach-symbol.webp" alt="Lachelein Symbol" />
              <p>Lv. 16</p>
            </div>
            <div className="selector-level">
              <img src="/symbols/arcana-symbol.webp" alt="Arcana Symbol" />
              <p>Lv. 15</p>
            </div>
            <div className="selector-level">
              <img src="/symbols/morass-symbol.webp" alt="Morass Symbol" />
              <p>Lv. 14</p>
            </div>
            <div className="selector-level">
              <img src="/symbols/esfera-symbol.webp" alt="Esfera Symbol" />
              <p>Lv. 14</p>
            </div>
          </div>
          <div className={`flex space-x-10 ${swapped ? "block" : "hidden"}`}>
            <div className="selector-level">
              <img src="/symbols/cern-symbol.webp" alt="Cernium Symbol" />
              <p>Lv. 4</p>
            </div>
            <div className="selector-level">
              <img src="/symbols/arcus-symbol.webp" alt="Arcus Symbol" />
              <p>Lv. 1</p>
            </div>
            <div className="selector-level">
              <img src="/symbols/odium-symbol.webp" alt="Odium Symbol" />
              <p>Lv. 1</p>
            </div>
          </div>
          <div>
            <MdOutlineSwapVert
              size={40}
              color={"#bfbfbf"}
              cursor="pointer"
              onClick={() => setSwapped(!swapped)}
            />
          </div>
        </div>
        <hr className="horizontal-divider" />
      </div>
    </section>
  );
};

export default Selector;
