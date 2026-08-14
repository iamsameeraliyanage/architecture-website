"use client";

import { useState, type FormEvent } from "react";
import type { Content } from "@/lib/content";

/*
  Front-end-only quote form: submitting composes a pre-filled email in the
  visitor's mail client. Swap handleSubmit for an API call once a backend exists.
*/
export default function ContactForm({
  t,
  toEmail,
}: {
  t: Content["contact"]["form"];
  toEmail: string;
}) {
  const [projectType, setProjectType] = useState(t.projectTypes[0]);
  const [lod, setLod] = useState(t.lodOptions[0]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      `${t.name}: ${data.get("name") ?? ""}`,
      `${t.company}: ${data.get("company") ?? ""}`,
      `${t.projectType}: ${projectType}`,
      `${t.area}: ${data.get("area") ?? ""}`,
      `${t.lod}: ${lod}`,
      "",
      `${data.get("message") ?? ""}`,
    ];
    const subject = encodeURIComponent("Scan-to-BIM quote request");
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
  }

  const field =
    "w-full border rule-dark bg-raised px-4 py-3 text-sm text-frost placeholder:text-steel focus:border-cerulean focus:outline-none";
  const label = "mono-label mb-2 block text-mist";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="cf-name" className={label}>
          {t.name} *
        </label>
        <input id="cf-name" name="name" required autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="cf-email" className={label}>
          {t.email} *
        </label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="cf-company" className={label}>
          {t.company}
        </label>
        <input id="cf-company" name="company" autoComplete="organization" className={field} />
      </div>
      <div>
        <label htmlFor="cf-type" className={label}>
          {t.projectType}
        </label>
        <select
          id="cf-type"
          name="projectType"
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className={field}
        >
          {t.projectTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="cf-area" className={label}>
          {t.area}
        </label>
        <input id="cf-area" name="area" type="number" min="0" inputMode="numeric" className={field} />
      </div>
      <div>
        <label htmlFor="cf-lod" className={label}>
          {t.lod}
        </label>
        <select
          id="cf-lod"
          name="lod"
          value={lod}
          onChange={(e) => setLod(e.target.value)}
          className={field}
        >
          {t.lodOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="cf-message" className={label}>
          {t.message}
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={4}
          placeholder={t.messagePlaceholder}
          className={field}
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="w-full bg-coral px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-coral-bright sm:w-auto"
        >
          {t.submit}
        </button>
        <p className="mt-3 text-xs text-steel">{t.hint}</p>
      </div>
    </form>
  );
}
