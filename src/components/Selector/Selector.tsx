import { MdOutlineSwapVert } from "react-icons/md";
import { GoSettings } from "react-icons/go";
import { Dispatch, SetStateAction } from "react";
import "./Selector.css";

interface Props {
  swapped: boolean;
  setSwapped: Dispatch<SetStateAction<boolean>>;
  selectedSymbol: string;
  setSelectedSymbol: Dispatch<SetStateAction<string>>;
  locked: boolean;
}

const Selector = ({ swapped, setSwapped, selectedSymbol, setSelectedSymbol, locked }: Props) => {

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
            <div className={`selector-level ${selectedSymbol === 'VJ' && 'text-primary'}`} onClick={() => setSelectedSymbol('VJ')}>
              <img src="/symbols/vj-symbol.webp" alt="VJ Symbol" className={`${selectedSymbol === 'VJ' && 'translate-y-symbol'}`} />
              <p>Lv. 17</p>
            </div>
            <div className={`selector-level ${selectedSymbol === 'ChuChu' && 'text-primary'}`} onClick={() => setSelectedSymbol('ChuChu')}>
              <img src="/symbols/chuchu-symbol.webp" alt="Chu Chu Symbol" className={`${selectedSymbol === 'ChuChu' && 'translate-y-symbol'}`}/>
              <p>Lv. 16</p>
            </div>
            <div className={`selector-level ${selectedSymbol === 'Lach' && 'text-primary'}`} onClick={() => setSelectedSymbol('Lach')}>
              <img src="/symbols/lach-symbol.webp" alt="Lachelein Symbol" className={`${selectedSymbol === 'Lach' && 'translate-y-symbol'}`}/>
              <p>Lv. 16</p>
            </div>
            <div className={`selector-level ${selectedSymbol === 'Arcana' && 'text-primary'}`} onClick={() => setSelectedSymbol('Arcana')}>
              <img src="/symbols/arcana-symbol.webp" alt="Arcana Symbol" className={`${selectedSymbol === 'Arcana' && 'translate-y-symbol'}`}/>
              <p>Lv. 15</p>
            </div>
            <div className={`selector-level ${selectedSymbol === 'Morass' && 'text-primary'}`} onClick={() => setSelectedSymbol('Morass')}>
              <img src="/symbols/morass-symbol.webp" alt="Morass Symbol" className={`${selectedSymbol === 'Morass' && 'translate-y-symbol'}`}/>
              <p>Lv. 14</p>
            </div>
            <div className={`selector-level ${selectedSymbol === 'Esfera' && 'text-primary'}`} onClick={() => setSelectedSymbol('Esfera')}>
              <img src="/symbols/esfera-symbol.webp" alt="Esfera Symbol" className={`${selectedSymbol === 'Esfera' && 'translate-y-symbol'}`}/>
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
