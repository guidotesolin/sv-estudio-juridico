// Smoke check for the booking link: `npm run booking:smoke`.
import assert from "node:assert/strict";
import { calUrl, quoteBookingUrl } from "../src/lib/booking";
import { buildSummary, estimate, type QuoteAnswers } from "../src/lib/quote";

const answers: QuoteAnswers = {
  area: "sucesiones",
  service: "declaratoria",
  stage: "new",
  complexity: "simple",
  deadline: true,
  areaAnswers: [
    { question: "¿Qué bienes hay?", answer: "Inmuebles, Vehículos" },
    { question: "¿Dónde están?", answer: "Santa Fe" },
  ],
};

const summary = buildSummary(answers, estimate(answers));
const href = calUrl("consulta-revision-documental", summary);
const url = new URL(href);

function check(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

check("URL carries notes, never name or email", () => {
  assert.match(href, /[?&]notes=/);
  assert.doesNotMatch(href, /[?&](name|email)=/);
  assert.deepEqual([...url.searchParams.keys()], ["notes"]);
});

check("notes round-trip a summary with accents and newlines", () => {
  assert.match(summary, /Área.*\n/);
  assert.equal(url.searchParams.get("notes"), summary);
});

check("no notes → bare event URL", () => {
  const bare = new URL(calUrl("consulta-inicial"));

  assert.equal(bare.search, "");
  assert.match(bare.pathname, /\/consulta-inicial$/);
});

check("documentation ready → consulta-revision-documental", () => {
  const withDocs = new URL(quoteBookingUrl(answers, estimate(answers)));

  const conflict: QuoteAnswers = { ...answers, complexity: "conflict" };
  const withoutDocs = new URL(quoteBookingUrl(conflict, estimate(conflict)));

  assert.match(withDocs.pathname, /\/consulta-revision-documental$/);
  assert.equal(withDocs.searchParams.get("notes"), summary);
  assert.match(withoutDocs.pathname, /\/consulta-inicial$/);
});
