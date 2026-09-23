import { FaDiscord, FaGithub, FaPaypal } from "react-icons/fa6";
import packageJson from "../../../package.json";
import { interpolate, useMessages } from "../../i18n";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextFooter is the redesign's footer: the current Footer's links and copyright, restyled
// * to a plain hairline-topped strip instead of the gradient panel (spec §3).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextFooter = () => {
  const m = useMessages().shell;

  return (
    <footer className="border-t border-white/6 py-8 text-center text-sm text-tertiary">
      <div className="mb-4 flex justify-center gap-6">
        <a
          href="https://github.com/Hyporos/maple-symbols"
          data-umami-event="outbound"
          data-umami-event-destination="github"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={m.githubRepository}
        >
          <FaGithub className="h-5 w-5 transition-colors hover:text-accent motion-reduce:transition-none" />
        </a>
        <a
          href="https://discord.gg/FTMgy2ZKPK"
          data-umami-event="outbound"
          data-umami-event-destination="discord"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={m.discordServer}
        >
          <FaDiscord className="h-5 w-5 transition-colors hover:text-accent motion-reduce:transition-none" />
        </a>
        <a
          href="https://www.paypal.com/donate/?hosted_button_id=RL3T3LA3QNVTU"
          data-umami-event="outbound"
          data-umami-event-destination="donate"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={m.donate}
        >
          <FaPaypal className="h-5 w-5 transition-colors hover:text-accent motion-reduce:transition-none" />
        </a>
      </div>
      <p>
        {interpolate(m.copyright, {
          // A string, so the year is not digit-grouped like a quantity ("2,026").
          year: String(new Date().getFullYear()),
          version: packageJson.version,
        })}
      </p>
    </footer>
  );
};

export default NextFooter;
