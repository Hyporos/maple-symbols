import { Fragment, useEffect, useState } from "react";
import { isFirefox } from "react-device-detect";
import { Dialog, Transition } from "@headlessui/react";
import "./Disclaimer.css";

const Disclaimer = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("disclaimer")
  );

  useEffect(() => {
    try {
      localStorage.setItem("disclaimer", JSON.stringify(dismissed));
      console.log("Disclaimer Set");
    } catch (e) {
      console.log("Local Storage is full");
    }
  }, [dismissed]);

  if (!dismissed)
    return (
      <Transition
        show={isOpen}
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        as={Fragment}
      >
        <Dialog
          onClose={() => {
            setIsOpen(false);
            setDismissed(String(true));
          }}
        >
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

          <div
            className={`fixed inset-0 flex items-center justify-center p-4 ${
              isOpen && (isFirefox ? "mr-[8px]" : "mr-[15px]")
            }`}
          >
            <Dialog.Panel className="flex shadow-level shadow-[#b18bd0] flex-col justify-between items-center bg-card text-center rounded-lg p-10 w-[500px] h-[475px]">
              <Dialog.Title className="text-white text-2xl font-semibold">
                Welcome to <span>Maple Symbols</span>!
              </Dialog.Title>
              <hr className="bg-gradient-to-r via-white/10 border-0 h-px w-[400px]" />
              <Dialog.Description>
                This tool is currently in a{" "}
                <span className="text-red-500">testing</span> state which means
                that some features may not be present or broken.
              </Dialog.Description>
              <Dialog.Description>
                If you encounter any problems or wish to submit any suggestions,
                please let me know on {" "}
                <span
                >
                  Discord
                </span>.
              </Dialog.Description>
              <Dialog.Description>
                The app is currently only meant to operate on a <span>1920x1080</span> resolution or greater.
              </Dialog.Description>
              <hr className="bg-gradient-to-r via-white/10 border-0 h-px w-[400px]" />
              <button
                className="bg-secondary hover:bg-hover text-secondary hover:text-primary tracking-wider border-accent outline-none select-none transition-all w-full py-1.5"
                onClick={() => {
                  setIsOpen(false);
                  setDismissed(String(true));
                }}
              >
                Don't Show Again
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    );
};

export default Disclaimer;
