import RegistrationMark from "./ui/RegistrationMark";
import type { Content } from "@/lib/content";

export default function Partner({ t }: { t: Content["partner"] }) {
  return (
    <aside className="border-y rule-light bg-paper">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-6 md:px-8">
        <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
        <p className="text-sm text-ink-soft">{t.line}</p>
      </div>
    </aside>
  );
}
