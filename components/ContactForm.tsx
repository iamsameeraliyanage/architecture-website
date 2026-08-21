"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { Content } from "@/lib/content";

/*
  Front-end-only quote form: react-hook-form validates on blur, then submitting
  composes a pre-filled email in the visitor's mail client. Swap `onValid` for an
  API call once a backend exists — the validated `values` object is the payload.
*/

type Values = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  area: string;
  lod: string;
  message: string;
};

// Deliberately permissive: catches typos and pasted junk without rejecting the
// long or unusual addresses a stricter pattern would.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm({
  t,
  toEmail,
}: {
  t: Content["contact"]["form"];
  toEmail: string;
}) {
  const [sent, setSent] = useState<Values | null>(null);
  const e = t.errors;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted, isValid },
  } = useForm<Values>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      company: "",
      projectType: t.projectTypes[0],
      area: "",
      lod: t.lodOptions[0],
      message: "",
    },
  });

  const onValid: SubmitHandler<Values> = (values) => {
    const lines = [
      `${t.name}: ${values.name}`,
      `${t.email}: ${values.email}`,
      `${t.company}: ${values.company || "—"}`,
      `${t.projectType}: ${values.projectType}`,
      `${t.area}: ${values.area || "—"}`,
      `${t.lod}: ${values.lod}`,
      "",
      values.message,
    ];
    const subject = encodeURIComponent("Scan-to-BIM quote request");
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    setSent(values);
  };

  const field =
    "w-full border bg-raised px-4 py-3 text-sm text-frost placeholder:text-steel focus:outline-none";
  const fieldState = (invalid: boolean) =>
    `${field} ${invalid ? "border-coral focus:border-coral" : "rule-dark focus:border-cerulean"}`;
  const label = "mono-label mb-2 flex items-baseline justify-between gap-3 text-mist";

  /* "optional" rides the right end of the label row so long labels stay on one line */
  const Optional = () => <span className="mono-label shrink-0 text-steel">{t.optional}</span>;

  /* Errors sit under the field, are announced live, and are pointed at by
     aria-describedby so screen readers reach them from the input. */
  const FieldError = ({ id, message }: { id: string; message?: string }) =>
    message ? (
      <p id={id} role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-coral">
        <span aria-hidden="true">↳</span>
        {message}
      </p>
    ) : null;

  if (sent) {
    return (
      <div className="border rule-dark bg-raised px-6 py-8 md:px-8">
        <p className="mono-label text-cerulean">{t.submit}</p>
        <p className="display-tight mt-3 text-xl text-frost">{t.sent.title}</p>
        <p className="mt-3 text-sm leading-relaxed text-mist">{t.sent.body}</p>

        <dl className="mt-6 space-y-2 border-t rule-dark pt-5">
          {[
            [t.name, sent.name],
            [t.email, sent.email],
            [t.projectType, sent.projectType],
            [t.lod, sent.lod],
          ].map(([key, value]) => (
            <div key={key} className="flex flex-wrap gap-x-3">
              <dt className="mono-label w-28 shrink-0 text-steel">{key}</dt>
              <dd className="font-mono text-sm text-frost">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => setSent(null)}
          className="mono-label mt-7 border rule-dark px-4 py-2.5 text-mist transition-colors hover:border-cerulean hover:text-frost"
        >
          {t.sent.again}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="cf-name" className={label}>
          {t.name} *
        </label>
        <input
          id="cf-name"
          autoComplete="name"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "cf-name-error" : undefined}
          className={fieldState(Boolean(errors.name))}
          {...register("name", {
            required: e.nameRequired,
            minLength: { value: 2, message: e.nameShort },
            setValueAs: (v: string) => v.trim(),
          })}
        />
        <FieldError id="cf-name-error" message={errors.name?.message} />
      </div>

      <div>
        <label htmlFor="cf-email" className={label}>
          {t.email} *
        </label>
        <input
          id="cf-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "cf-email-error" : undefined}
          className={fieldState(Boolean(errors.email))}
          {...register("email", {
            required: e.emailRequired,
            pattern: { value: EMAIL_PATTERN, message: e.emailInvalid },
            setValueAs: (v: string) => v.trim(),
          })}
        />
        <FieldError id="cf-email-error" message={errors.email?.message} />
      </div>

      <div>
        <label htmlFor="cf-company" className={label}>
          {t.company}
          <Optional />
        </label>
        <input
          id="cf-company"
          autoComplete="organization"
          className={fieldState(false)}
          {...register("company")}
        />
      </div>

      <div>
        <label htmlFor="cf-type" className={label}>
          {t.projectType}
        </label>
        <select id="cf-type" className={fieldState(false)} {...register("projectType")}>
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
          <Optional />
        </label>
        <input
          id="cf-area"
          inputMode="numeric"
          aria-invalid={errors.area ? "true" : "false"}
          aria-describedby={errors.area ? "cf-area-error" : undefined}
          className={fieldState(Boolean(errors.area))}
          {...register("area", {
            setValueAs: (v: string) => v.trim(),
            validate: (value) => {
              if (!value) return true;
              if (!/^\d+(\.\d+)?$/.test(value)) return e.areaInvalid;
              const n = Number(value);
              return n >= 1 && n <= 1_000_000 ? true : e.areaRange;
            },
          })}
        />
        <FieldError id="cf-area-error" message={errors.area?.message} />
      </div>

      <div>
        <label htmlFor="cf-lod" className={label}>
          {t.lod}
        </label>
        <select id="cf-lod" className={fieldState(false)} {...register("lod")}>
          {t.lodOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="cf-message" className={label}>
          {t.message} *
        </label>
        <textarea
          id="cf-message"
          rows={4}
          placeholder={t.messagePlaceholder}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "cf-message-error" : undefined}
          className={fieldState(Boolean(errors.message))}
          {...register("message", {
            required: e.messageRequired,
            minLength: { value: 10, message: e.messageShort },
            setValueAs: (v: string) => v.trim(),
          })}
        />
        <FieldError id="cf-message-error" message={errors.message?.message} />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-coral px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-coral-bright disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
        {/* only after a failed submit, so the summary never fires on first load */}
        {isSubmitted && !isValid ? (
          <p role="alert" className="mt-3 text-xs text-coral">
            {t.errors.summary}
          </p>
        ) : null}
      </div>
    </form>
  );
}
