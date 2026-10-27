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

// Draft from ARCHITECTURE.md "Area questions". None asks for names, ID numbers, amounts or
// documents, and answers only ever carry these option labels (never free text): they end up in the
// booking URL's notes.
export interface AreaQuestion {
  question: string;
  options: readonly string[];
  multiple?: boolean;
}

export const areaQuestions: Record<AreaId, readonly AreaQuestion[]> = {
  sucesiones: [
    {
      question: "¿Cuántas personas fallecieron?",
      options: ["Una", "Más de una"],
    },
    {
      question: "¿Cuántos herederos hay?",
      options: ["1 a 3", "4 o más", "No sé"],
    },
    { question: "¿Hay testamento?", options: ["Sí", "No", "No sé"] },
    { question: "¿Hay desacuerdo entre herederos?", options: ["Sí", "No"] },
    {
      question: "¿Qué bienes hay?",
      options: ["Inmuebles", "Vehículos", "Cuentas o dinero", "Otros"],
      multiple: true,
    },
    { question: "¿Dónde están?", options: ["Santa Fe", "Otra provincia"] },
  ],
  laboral: [
    {
      question: "¿Consultás como trabajador o empleador?",
      options: ["Trabajador", "Empleador"],
    },
    {
      question: "¿Cómo estaba registrada la relación?",
      options: ["Registrada", "No registrada", "Registrada en parte"],
    },
    { question: "¿Hubo despido o desvinculación?", options: ["Sí", "No"] },
    {
      question: "¿Hubo telegramas, acuerdos o reclamos previos?",
      options: ["Sí", "No"],
    },
  ],
  danos: [
    {
      question: "¿Qué pasó?",
      options: ["Accidente de tránsito", "Otro hecho"],
    },
    { question: "¿Hubo lesiones?", options: ["Sí", "No"] },
    { question: "¿Hubo daños materiales?", options: ["Sí", "No"] },
    {
      question: "¿Interviene una aseguradora?",
      options: ["Sí", "No", "No sé"],
    },
    {
      question: "¿Ya hay denuncia, reclamo o expediente?",
      options: ["Sí", "No"],
    },
    {
      question: "¿Tenés fotos, presupuestos o informes?",
      options: ["Sí", "Algunos", "No"],
    },
  ],
  civil: [
    {
      question: "¿Hay otra parte involucrada?",
      options: ["Persona", "Empresa", "Organismo"],
    },
    { question: "¿Ya hubo intimaciones o reclamos?", options: ["Sí", "No"] },
  ],
};

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
      includes: readonly string[];
      excludes: readonly string[];
    }
  | {
      unconfirmed: true;
      includes: readonly string[];
      excludes: readonly string[];
    };

const arsFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const jusFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

export function formatArs(n: number): string {
  return arsFormat.format(n);
}

export function formatJus(n: number): string {
  return jusFormat.format(n);
}

// Fixed fees (consultation, case-file review): `null` is not confirmed by the lawyer yet.
export function feeText(jus: number | null): string {
  return jus === null
    ? "a confirmar"
    : `${formatArs(toArs(jus))} (${formatJus(jus)} JUS)`;
}

// Guards external input (`?area=`, DOM values): `estimate` throws on an unknown area.
export function isAreaId(s: string): s is AreaId {
  return areas.some((a) => a.id === s);
}

export function toArs(jus: number): number {
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

// Display text shared by the result screen and the booking notes, so both say the same thing.
// `jus` is empty when the fee is unconfirmed; one amount when min = max.
export function estimateText(e: Estimate) {
  if (e.unconfirmed) {
    return { amount: "Honorarios a confirmar en la consulta", jus: "" };
  }

  if (e.minJus === e.maxJus) {
    return { amount: formatArs(e.minArs), jus: `${formatJus(e.minJus)} JUS` };
  }

  return {
    amount: `${formatArs(e.minArs)} a ${formatArs(e.maxArs)}`,
    jus: `${formatJus(e.minJus)} a ${formatJus(e.maxJus)} JUS`,
  };
}

function describeEstimate(e: Estimate): string {
  const { amount, jus } = estimateText(e);

  return jus ? `${amount} (${jus})` : amount;
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
