import { useState } from "react";
import { isFirefox } from "react-device-detect";
import { Dialog, Switch } from "@headlessui/react";
import "./Disclaimer.css";

const Disclaimer = () => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const [isOpen, setIsOpen] = useState(true);
  const [dismissed, setDismissed] = useState(
    JSON.parse(localStorage.getItem("disclaimer") || "false")
  );
  const [dontShow, setDontShow] = useState(false);

  /* ―――――――――――――――――――― Functions & Hooks ―――――――――――――― */

  function handleDismiss() {
    setIsOpen(false);
    if (dontShow) {
      setDismissed(true);
      try {
        localStorage.setItem("disclaimer", JSON.stringify(!dismissed));
      } catch (e) {
        console.log("Local Storage is full");
      }
    }
  }

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  if (!dismissed)
    return (
      <Dialog open={isOpen} onClose={() => handleDismiss()}>
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        <div
          className={`fixed inset-0 flex items-center justify-center p-4 ${
            isOpen && (isFirefox ? "mr-[8px]" : "mr-[15px]") // Accomodate for the thinner scroll bar width on Firefox
          }`}
        >
          <Dialog.Panel className="flex shadow-level shadow-[#b18bd0] flex-col justify-between items-center bg-card text-center rounded-lg p-10 w-[500px] h-[500px]">
            <Dialog.Title className="text-white text-2xl font-semibold">
              Welcome to <span>Maple Symbols</span>!
            </Dialog.Title>
            <hr className="bg-gradient-to-r via-white/10 border-0 h-px w-[400px]" />
            <Dialog.Description>
              This tool is currently running on a{" "}
              <span className="text-red-500">Test Build</span>, which means that
              some features may be missing or broken.
            </Dialog.Description>
            <Dialog.Description>
              If you encounter any problems or wish to submit any suggestions,
              please let me know on{" "}
              <span className="text-[#7289da]">Discord</span>.
            </Dialog.Description>
            <Dialog.Description>
              At this moment, the app is only designed to operate on a{" "}
              <span>1920x1080</span> resolution or greater.
            </Dialog.Description>
            <hr className="bg-gradient-to-r via-white/10 border-0 h-px w-[400px]" />
            <div
              className="flex items-center space-x-4 cursor-pointer select-none"
              onClick={() => setDontShow(!dontShow)}
            >
              <Switch
                checked={dontShow}
                className={`${
                  dontShow ? "bg-accent" : "bg-hover"
                } relative inline-flex h-4 w-8 items-center rounded-full focus:outline-none select-none transition-colors`}
              >
                <span className="sr-only">Don't Show Again</span>
                <span
                  className={`${
                    dontShow ? "translate-x-4" : "translate-x-1"
                  } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                />
              </Switch>
              <p>Don't Show Again</p>
            </div>
            <button
              className="bg-secondary hover:bg-hover text-secondary hover:text-primary tracking-wider border-accent outline-none select-none transition-all w-full py-1.5"
              onClick={() => handleDismiss()}
            >
              I understand
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
};

export default Disclaimer;
