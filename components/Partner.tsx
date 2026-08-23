import RegistrationMark from "./ui/RegistrationMark";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";

export default function Partner({ t }: { t: Content["partner"] }) {
  return (
    <aside className="relative isolate on-paper border-y rule-light bg-paper">
      <SectionDots />
      <div className="shell flex items-center gap-4 py-6">
        <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
        <p className="text-sm text-ink-soft">{t.line}</p>
      </div>
    </aside>
  );
}
