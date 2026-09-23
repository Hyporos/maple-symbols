import type { ReactNode } from "react";

interface NextShellProps {
  children: ReactNode;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextShell is the /next redesign's page frame (header, footer, feedback button: spec §3).
// * Minimal until a later task builds the real shell; it only hosts today's page.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextShell = ({ children }: NextShellProps) => <main>{children}</main>;

export default NextShell;
