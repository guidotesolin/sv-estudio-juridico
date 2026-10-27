// Smoke check for the quote engine: `npm run quote:smoke`.
import assert from "node:assert/strict";
import { areas } from "../src/data/prices";
import {
  buildSummary,
  estimate,
  formatArs,
  type QuoteAnswers,
} from "../src/lib/quote";

const declaratoria: QuoteAnswers = {
  area: "sucesiones",
  service: "declaratoria",
  stage: "new",
  complexity: "simple",
  deadline: false,
  areaAnswers: [{ question: "¿Hay testamento?", answer: "No" }],
};

// Intl puts a non-breaking space between "$" and the amount.
const normalize = (s: string) => s.replace(/\u00a0/g, " ");

function check(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

check("declaratoria + sencillo → 6 JUS = $ 900.376,32", () => {
  const e = estimate(declaratoria);

  assert.ok(!e.unconfirmed);

  assert.equal(e.minJus, 6);
  assert.equal(e.maxJus, 6);
  assert.equal(normalize(formatArs(e.minArs)), "$ 900.376,32");
});

check("declaratoria + conflicto → 6 to 9 JUS", () => {
  const e = estimate({ ...declaratoria, complexity: "conflict" });

  assert.ok(!e.unconfirmed);

  assert.equal(e.minJus, 6);
  assert.equal(e.maxJus, 9);
});

check(
  "declaratoria + varias personas → 6 to 7,5 JUS, summary shows a range",
  () => {
    const answers: QuoteAnswers = { ...declaratoria, complexity: "several" };
    const e = estimate(answers);

    assert.ok(!e.unconfirmed);

    assert.equal(e.maxJus, 7.5);
    assert.match(buildSummary(answers, e), /a .* \(6 a 7,5 JUS\)/);
  },
);

check("every fee: null service → unconfirmed with includes", () => {
  for (const area of areas) {
    for (const service of area.services) {
      if (service.fee) continue;

      const e = estimate({
        ...declaratoria,
        area: area.id,
        service: service.id,
      });

      assert.equal(e.unconfirmed, true, `${area.id}/${service.id}`);
      assert.ok(e.includes.length > 0, `${area.id}/${service.id}`);
    }
  }
});

check("buildSummary has area, service label and estimate", () => {
  const summary = normalize(buildSummary(declaratoria, estimate(declaratoria)));

  assert.match(summary, /Sucesiones/);
  assert.match(summary, /Declaratoria de herederos/);
  assert.match(summary, /\$ 900\.376,32 \(6 JUS\)/);
  console.log(summary.replace(/^/gm, "    "));
});
