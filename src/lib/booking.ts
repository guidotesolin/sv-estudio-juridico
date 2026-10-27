import { calUsername, type CalEventSlug } from "../data/site";
import { buildSummary, type Estimate, type QuoteAnswers } from "./quote";

// Only `notes` is ever prefilled; name and email never go in the URL (history, logs, referrers).
// `notes` fills the booking form's notes field: https://cal.com/docs/core-features/bookings/prefill-fields
export function calUrl(eventSlug: CalEventSlug, notes?: string): string {
  const url = new URL(`https://cal.com/${calUsername}/${eventSlug}`);

  if (notes) url.searchParams.set("notes", notes);

  return url.href;
}

// Having documentation ready sends the visitor to the document-review consultation.
export function quoteBookingUrl(answers: QuoteAnswers, e: Estimate): string {
  const slug =
    answers.complexity === "simple"
      ? "consulta-revision-documental"
      : "consulta-inicial";

  return calUrl(slug, buildSummary(answers, e));
}
