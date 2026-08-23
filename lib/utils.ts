/*
  Minimal `cn` in the shadcn shape, so drop-in ui/ components that expect it
  compile unchanged. The project has no clsx/tailwind-merge dependency and no
  conflicting-utility problem to solve, so this stays a filter-and-join —
  callers are responsible for not passing two utilities from the same family.
*/

export type ClassValue = string | number | null | undefined | false;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
