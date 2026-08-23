// author: Khoa Phan <https://www.pldkhoa.dev>
//
// Adapted for this project:
//  - imports from `framer-motion` (v12, already a dependency) instead of the
//    `motion` package; same library, same API, no second animation runtime.
//  - the scroll-linked scale is held at 1 under prefers-reduced-motion, so the
//    stack still stacks but nothing scrubs. Matches Reveal's degradation.
//  - the item's default `h-full` is gone. It only ever collided with the height
//    the caller has to pass anyway, and which of the two won came down to
//    Tailwind's class ordering rather than the call site — with `h-full`
//    winning, the item had no definite height and the card's `h-[80%]`
//    silently fell back to auto. Height is the caller's job now.

"use client";

import {
  createContext,
  useContext,
  useRef,
  type HTMLAttributes,
  type PropsWithChildren,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type UseScrollOptions,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface StackingCardsProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  scrollOptions?: UseScrollOptions;
  scaleMultiplier?: number;
  totalCards: number;
}

interface StackingCardItemProps extends HTMLAttributes<HTMLDivElement>, PropsWithChildren {
  index: number;
  topPosition?: string;
}

export default function StackingCards({
  children,
  className,
  scrollOptions,
  scaleMultiplier,
  totalCards,
  ...props
}: StackingCardsProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
    ...scrollOptions,
    target: targetRef,
  });

  return (
    <StackingCardsContext.Provider
      value={{ progress: scrollYProgress, scaleMultiplier, totalCards }}
    >
      <div className={cn(className)} ref={targetRef} {...props}>
        {children}
      </div>
    </StackingCardsContext.Provider>
  );
}

const StackingCardItem = ({
  index,
  topPosition,
  className,
  children,
  ...props
}: StackingCardItemProps) => {
  const { progress, scaleMultiplier, totalCards = 0 } = useStackingCardsContext();
  const reduced = useReducedMotion();
  const scaleTo = 1 - (totalCards - index) * (scaleMultiplier ?? 0.03);
  const rangeScale = [index * (1 / totalCards), 1];
  const scale = useTransform(progress, rangeScale, reduced ? [1, 1] : [1, scaleTo]);
  const top = topPosition ?? `${5 + index * 3}%`;

  return (
    <div className={cn("sticky top-0", className)} {...props}>
      <motion.div className={"origin-top relative h-full"} style={{ top, scale }}>
        {children}
      </motion.div>
    </div>
  );
};

const StackingCardsContext = createContext<{
  progress: MotionValue<number>;
  scaleMultiplier?: number;
  totalCards?: number;
} | null>(null);

export const useStackingCardsContext = () => {
  const context = useContext(StackingCardsContext);
  if (!context) throw new Error("StackingCardItem must be used within StackingCards");
  return context;
};

export { StackingCardItem };
