"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
  Cursor spotlight for a grid of cells (21st.dev spotlight-card pattern, done
  with one delegated listener instead of a component per cell): pointer coords
  are written to --sx/--sy on the hovered <li>, and the .spot-cell CSS in
  globals.css renders the faint radial pool there. Touch devices never attach
  the listener; without JS the grid is simply static.
*/
export default function SpotlightCells({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const cell = (e.target as Element | null)?.closest?.("li");
      if (!cell || !el.contains(cell)) return;
      const rect = cell.getBoundingClientRect();
      cell.style.setProperty("--sx", `${e.clientX - rect.left}px`);
      cell.style.setProperty("--sy", `${e.clientY - rect.top}px`);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
