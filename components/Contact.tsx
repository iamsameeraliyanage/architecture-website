import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import ContactForm from "./ContactForm";
import type { Content } from "@/lib/content";

export default function Contact({ t }: { t: Content["contact"] }) {
  const d = t.details;
  const rows = [
    { label: d.emailLabel, value: d.email, note: d.emailNote, href: `mailto:${d.email}` },
    { label: d.phoneLabel, value: d.phone, note: d.phoneNote, href: `tel:${d.phone.replace(/\s/g, "")}` },
    { label: d.addressLabel, value: d.address, note: d.addressNote },
  ];

  return (
    <section id="contact" className="scroll-mt-20 bg-ground" aria-labelledby="contact-title">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeader
                id="contact-title"
                kicker={t.kicker}
                title={t.title}
                intro={t.body}
                tone="dark"
                className="mb-10"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="border-t rule-dark">
                <p className="mono-label mt-5 text-steel">{t.detailsLabel}</p>
                <dl className="mt-4 space-y-4">
                  {rows.map((row) => (
                    <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <dt className="mono-label w-16 shrink-0 text-steel">{row.label}</dt>
                      <dd className="font-mono text-sm text-frost">
                        {row.href ? (
                          <a href={row.href} className="transition-colors hover:text-cerulean-soft">
                            {row.value}
                          </a>
                        ) : (
                          row.value
                        )}
                        <span className="ml-2 border rule-dark px-1.5 py-0.5 text-[0.6rem] uppercase tracking-widest text-steel">
                          {row.note}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.15}>
              <ContactForm t={t.form} toEmail={d.email} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
