import { useState } from "react";
import "./Info.css";
import { cn } from "../../lib/utils";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Tools component is the section under the Calculator which contains the Selectors and Catalyst.
// * You can preview the functionality of both items by clicking their respective buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Info = () => {
  const [selectedInfo, setSelectedInfo] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <section className="info">
      <div className="bg-gradient-to-t from-card-tool to-card-grad rounded-lg mt-12 w-[800px] h-[700px]">
        <nav className="flex justify-between my-10 bg-dark shadow-input transition-all px-10">
          <div
            className="hover:bg-secondary transition-all py-5 cursor-pointer"
            onClick={() => setSelectedInfo(1)}
          >
            Meso Cost Table
          </div>
          <div
            className="hover:bg-secondary transition-all py-5 cursor-pointer"
            onClick={() => setSelectedInfo(2)}
          >
            Experience Table
          </div>
          <div
            className="hover:bg-secondary transition-all py-5 cursor-pointer"
            onClick={() => setSelectedInfo(3)}
          >
            Changelog
          </div>
          <div
            className="hover:bg-secondary transition-all py-5 cursor-pointer"
            onClick={() => setSelectedInfo(4)}
          >
            Credits
          </div>
        </nav>
        <div className={cn("hidden", selectedInfo === 1 && "flex")}>1</div>
        <div className={cn("hidden", selectedInfo === 2 && "flex")}>
          <div
            className={cn(
              "text-center tracking-wider",
              dropdownOpen && "shadow-input"
            )}
          >
            <div
              className="bg-light hover:bg-hover transition-all select-none rounded-lg px-4 py-3 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              v1.0
            </div>
            <div
              className={cn(
                "hidden [&>*]:px-4 [&>*]:py-2",
                dropdownOpen && "flex flex-col"
              )}
            >
              <div className="px-4 py-2 cursor-pointer hover:bg-light transition-all">
                Vanishing Journey
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn("hidden", selectedInfo === 3 && "flex")}
        >
          <div className="w-2/12 flex justify-center flex-col items-center space-y-6">
            <div>v1.0</div>
            <div>v1.1</div>
            <div>v1.1.1</div>
            <div>v1.1.2</div>
            <div>v1.1.3</div>
            <div>v1.1.4</div>
            <div>v1.2</div>
            <div>v1.2.1</div>
            <div>v1.2.2</div>
            <div>v1.3</div>
          </div>
          <div className="flex justify-center items-center">
            <div className="h-full w-px bg-gradient-to-t via-white/10"></div>
          </div>
          <div className="w-9/12 flex flex-col justify-center items-center mx-12">
            <h1 className="text-2xl font-semibold">v1.1.0</h1>
            <div className="h-px w-[500px] bg-white/10 mt-4"></div>
            <h2 className="text-lg font-semibold py-6">New Additions</h2>
            <div className="space-y-3 [&>*]:text-sm">
              <p>
                • By default, you can only enter symbol experience up to what is
                required to reach the next level. Now, when you enter that
                capped number, you can choose to unlock the restriction and
                instead enter any number up to 2679 or 4565, depending on the
                type of symbol. This will allow users who are stacking up
                symbols without leveling them up to conveniently view them with
                their updated level/experience.
              </p>
              <p>• Added a link to the GitHub repo in the footer</p>
            </div>

            <h2 className="text-lg font-semibold py-6">
              Bug Fixes / Optimizations
            </h2>
            <div className="space-y-3 [&>*]:text-sm">
              <p>
                • Prevented tab focus on the Tools section (selector/catalyst)
                when the respective symbol is disabled
              </p>
              <p>• Disabled dragging & selecting on images</p>
              <p>
                • Changed the default website description that shows on Google
              </p>
              <p>
                • Total symbols remaining in the Levels section (tables/target
                level) will now show 0 instead of a blank character when you
                have enough experience to reach level 20
              </p>
            </div>
          </div>
        </div>
        <div className={cn("hidden", selectedInfo === 4 && "flex")}>
          <div>
            <h1>Special Thanks</h1>
          </div>
          <div>
            <h1>Resources Used</h1>
          </div>
          <div>
            <h1>Contact</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
