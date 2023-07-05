import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import "./Disclaimer.css";

const Disclaimer = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Transition
      show={isOpen}
      enter="transition duration-100 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
      as={Fragment}
    >
      <Dialog
        onClose={() => setIsOpen(false)}
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="flex shadow-level shadow-[#b18bd0] flex-col justify-between items-center bg-card text-center rounded-lg p-10 w-[500px] h-[425px]">
            <Dialog.Title className="text-white text-2xl font-semibold mb-4">
              Welcome to <span>Maple Symbols</span>!
              <hr className="bg-gradient-to-r via-white/10 border-0 h-px mt-7 w-[400px]" />
            </Dialog.Title>
            <Dialog.Description>
              This tool is currently in a <span>beta</span> state which makes it
              prone to bugs and other issues.
            </Dialog.Description>
            <Dialog.Description>
              If you encounter any problems or wish to submit any suggestions,
              please let me know on the{" "}
              <a
                className="text-[#7289DA] hover:text-white focus:outline-0 transition-all"
                target="_blank"
                href="https://discord.gg/FTMgy2ZKPK"
              >
                Discord
              </a>{" "}
              server.
            </Dialog.Description>
            <Dialog.Description>
              Updates will be consistent and big things are planned such as{" "}
              <span>graphs</span> and <span>guides</span>.
            </Dialog.Description>
            <button
              className="bg-secondary hover:bg-hover text-secondary hover:text-primary tracking-wider border-accent focus:outline-0 select-none transition-all w-full py-1.5 mt-4"
              onClick={() => setIsOpen(false)}
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
