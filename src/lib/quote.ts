// Quote engine from ARCHITECTURE.md "Quote model". Factors and labels are drafts the lawyer
// reviews (backlog B9).
import { areas, JUS_VALUE_ARS, type AreaId } from "../data/prices";

export const stages = [
  { id: "new", label: "No inicié nada" },
  { id: "ongoing", label: "Ya hay un expediente en curso" },
  { id: "specific", label: "Necesito una etapa puntual" },
] as const;

// Complexity only raises the max; the service's minJus is the legal floor.
export const complexities = [
  { id: "simple", label: "Sencillo, con documentación", factor: 1 },
  { id: "several", label: "Varias personas o reclamos", factor: 1.25 },
  {
    id: "conflict",
    label: "Conflicto, oposición o cuestiones técnicas",
    factor: 1.5,
  },
  { id: "unknown", label: "No sé", factor: 1.5 },
] as const;

export type StageId = (typeof stages)[number]["id"];

export type ComplexityId = (typeof complexities)[number]["id"];

// Area questions arrive already labeled; they go into the booking notes and don't move the price
// (backlog B13).
export interface AreaAnswer {
  question: string;
  answer: string;
}

export interface QuoteAnswers {
  area: AreaId;
  service: string;
  stage: StageId;
  complexity: ComplexityId;
  deadline: boolean;
  areaAnswers: AreaAnswer[];
}

export type Estimate =
  | {
      unconfirmed: false;
      minJus: number;
      maxJus: number;
      minArs: number;
      maxArs: number;
      includes: string[];
      excludes: string[];
    }
  | { unconfirmed: true; includes: string[]; excludes: string[] };

const arsFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const jusFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

export function formatArs(n: number): string {
  return arsFormat.format(n);
}

function toArs(jus: number): number {
  return Math.round(jus * JUS_VALUE_ARS * 100) / 100;
}

function findSelection(answers: QuoteAnswers) {
  const area = areas.find((a) => a.id === answers.area);
  const service = area?.services.find((s) => s.id === answers.service);

  if (!area || !service) {
    throw new Error(`Unknown service: ${answers.area}/${answers.service}`);
  }

  return { area, service };
}

function findStage(id: StageId) {
  const stage = stages.find((s) => s.id === id);

  if (!stage) throw new Error(`Unknown stage: ${id}`);

  return stage;
}

function findComplexity(id: ComplexityId) {
  const complexity = complexities.find((c) => c.id === id);

  if (!complexity) throw new Error(`Unknown complexity: ${id}`);

  return complexity;
}

export function estimate(answers: QuoteAnswers): Estimate {
  const { service } = findSelection(answers);
  const { fee, includes, excludes } = service;

  if (!fee) return { unconfirmed: true, includes, excludes };

  const minJus = fee.minJus;
  const maxJus = fee.maxJus * findComplexity(answers.complexity).factor;

  return {
    unconfirmed: false,
    minJus,
    maxJus,
    minArs: toArs(minJus),
    maxArs: toArs(maxJus),
    includes,
    excludes,
  };
}

function describeEstimate(e: Estimate): string {
  if (e.unconfirmed) return "Honorarios a confirmar en la consulta";

  if (e.minJus === e.maxJus) {
    return `${formatArs(e.minArs)} (${jusFormat.format(e.minJus)} JUS)`;
  }

  return `${formatArs(e.minArs)} a ${formatArs(e.maxArs)} (${jusFormat.format(e.minJus)} a ${jusFormat.format(e.maxJus)} JUS)`;
}

// Plain-text summary for the booking notes. No personal data: answers are option labels only.
export function buildSummary(answers: QuoteAnswers, e: Estimate): string {
  const { area, service } = findSelection(answers);

  return [
    `Área: ${area.label}`,
    `Servicio: ${service.label}`,
    `Etapa: ${findStage(answers.stage).label}`,
    `Complejidad: ${findComplexity(answers.complexity).label}`,
    `Plazo próximo: ${answers.deadline ? "Sí" : "No"}`,
    ...answers.areaAnswers.map((a) => `${a.question}: ${a.answer}`),
    `Estimación: ${describeEstimate(e)}`,
  ].join("\n");
}
