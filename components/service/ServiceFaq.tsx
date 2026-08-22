import Faq from "../Faq";

/** Thin adapter: service FAQs arrive as loose fields, Faq wants one object. */
export default function ServiceFaq({
  kicker,
  title,
  items,
  dim,
}: {
  kicker: string;
  title: string;
  items: Array<{ q: string; a: string }>;
  dim: boolean;
}) {
  return <Faq t={{ kicker, title, items }} dim={dim} />;
}
