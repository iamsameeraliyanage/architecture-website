"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

/*
  Shared GSAP setup for the scroll/hover layer. Framer Motion keeps the quiet
  section reveals; GSAP owns everything scrubbed, split, or cursor-driven.
  Tokens mirror the ERA reference (docs/era-residence-animations.md) scaled
  to this site's restrained register.
*/

export const durS = 0.4;
export const durM = 0.8;
export const durL = 1.2;
export const lineStagger = 0.09;

let registered = false;

export function registerGsap() {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // same curve as --ease-authored in globals.css, so both engines feel identical
  CustomEase.create("authored", "0.22,1,0.36,1");
}

export { gsap, ScrollTrigger, SplitText };
