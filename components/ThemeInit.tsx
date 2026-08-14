"use client";

import { useServerInsertedHTML } from "next/navigation";

/*
  Applies the stored theme before first paint to avoid a flash.

  useServerInsertedHTML streams the script into the server-rendered HTML only —
  it never appears in the client React tree, so client-side navigations (e.g.
  the language switcher re-rendering the locale layout) don't trip React's
  "encountered a script tag" error.
*/
export default function ThemeInit() {
  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{
        __html: `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`,
      }}
    />
  ));
  return null;
}
