/*
  Survey registration target — the recurring coral mark of the page.
  Colored via currentColor so it inherits from its context.
*/
export default function RegistrationMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="0" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="19.5" x2="12" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="12" x2="4.5" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="19.5" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    </svg>
  );
}
