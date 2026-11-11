// Fee table in JUS, edited by the maintainer. `fee: null` means "not confirmed by the lawyer": the
// UI shows "a confirmar" instead of a number, so no invented amount ever ships. The remaining nulls
// are fees the lawyer gave as a percentage or "depende el caso": "a confirmar" is her decision (T8).
// Includes/excludes were approved by the lawyer (T8).

// When the JUS changes, this is the only edit.
export const JUS_VALUE_ARS = 150062.72;

export const CONSULTATION_FEE_JUS: number | null = 0.5;

export const CASE_FILE_REVIEW_FEE_JUS: number | null = 0.5;

export type AreaId = "sucesiones" | "laboral" | "danos" | "civil";

export interface Fee {
  minJus: number;
  // null: open-ended, shown as "desde <minJus>".
  maxJus: number | null;
}

export interface Service {
  id: string;
  label: string;
  fee: Fee | null;
  includes: readonly string[];
  excludes: readonly string[];
}

export interface Area {
  id: AreaId;
  // Also the `title` in src/content/services/<id>.md; the quote island can't read astro:content,
  // so keep both in sync.
  label: string;
  services: readonly Service[];
}

export const areas: readonly Area[] = [
  {
    id: "sucesiones",
    label: "Sucesiones",
    services: [
      {
        id: "inicio",
        label: "Inicio de sucesión",
        fee: { minJus: 1, maxJus: 1 },
        includes: [
          "Análisis inicial de la documentación",
          "Redacción y presentación del escrito de inicio",
          "Seguimiento hasta la apertura del proceso",
        ],
        excludes: ["Declaratoria de herederos", "Inscripción de bienes"],
      },
      {
        id: "declaratoria",
        label: "Declaratoria de herederos",
        fee: { minJus: 6, maxJus: 6 },
        includes: [
          "Tramitación del proceso hasta la declaratoria",
          "Publicación de edictos",
          "Seguimiento del expediente",
        ],
        excludes: [
          "Inscripción de inmuebles y vehículos",
          "Conflictos entre herederos",
        ],
      },
      {
        id: "inscripcion",
        label: "Inscripción de inmuebles y vehículos",
        fee: { minJus: 1, maxJus: 1 },
        includes: [
          "Preparación de oficios y documentación registral",
          "Presentación ante los registros correspondientes",
          "Seguimiento hasta la inscripción",
        ],
        excludes: ["Tramitación de la sucesión", "Gastos y tasas registrales"],
      },
      {
        id: "adjudicacion",
        label: "Inscripción y adjudicación de bienes",
        fee: { minJus: 6, maxJus: 8 },
        includes: [
          "Propuesta de partición y adjudicación",
          "Presentación judicial",
          "Inscripción de los bienes adjudicados",
        ],
        excludes: ["Tasaciones", "Conflictos entre herederos"],
      },
      {
        id: "conflicto",
        label: "Sucesión con conflicto entre herederos",
        fee: { minJus: 6, maxJus: 10 },
        includes: [
          "Análisis de la posición de cada heredero",
          "Negociación entre las partes",
          "Representación en el proceso judicial",
        ],
        excludes: ["Tasaciones y peritajes", "Instancias de apelación"],
      },
    ],
  },
  {
    id: "laboral",
    label: "Laboral",
    services: [
      {
        id: "telegramas",
        label: "Intercambio telegráfico",
        fee: { minJus: 1.5, maxJus: 1.5 },
        includes: [
          "Análisis de la situación laboral",
          "Redacción de telegramas o cartas documento",
          "Respuesta a las comunicaciones recibidas",
        ],
        excludes: [
          "Reclamo administrativo o judicial",
          "Costo de envío de los telegramas",
        ],
      },
      {
        id: "liquidacion",
        label: "Liquidación y revisión de indemnización",
        fee: { minJus: 1, maxJus: 2 },
        includes: [
          "Revisión de recibos y documentación laboral",
          "Cálculo de la liquidación o indemnización",
          "Informe con los rubros que corresponden",
        ],
        excludes: ["Reclamo administrativo o judicial", "Gastos y aportes"],
      },
      {
        id: "acuerdo",
        label: "Revisión de acuerdo o propuesta",
        fee: null,
        includes: [
          "Análisis de la propuesta recibida",
          "Comparación con lo que corresponde por ley",
          "Recomendación para aceptar, negociar o rechazar",
        ],
        excludes: ["Negociación con la otra parte", "Homologación del acuerdo"],
      },
      {
        id: "conciliacion",
        label: "Conciliación o reclamo administrativo",
        fee: { minJus: 1, maxJus: 1 },
        includes: [
          "Preparación del reclamo",
          "Asistencia a las audiencias de conciliación",
          "Negociación de un acuerdo",
        ],
        excludes: ["Representación judicial", "Gastos y aportes"],
      },
      {
        id: "judicial",
        label: "Representación judicial",
        fee: { minJus: 1, maxJus: null },
        includes: [
          "Redacción y presentación de la demanda o contestación",
          "Representación en audiencias",
          "Seguimiento del proceso",
        ],
        excludes: ["Peritajes", "Instancias de apelación"],
      },
    ],
  },
  {
    id: "danos",
    label: "Daños y perjuicios",
    services: [
      {
        id: "aseguradora",
        label: "Reclamo ante la aseguradora",
        fee: { minJus: 1, maxJus: 3 },
        includes: [
          "Análisis de los hechos y la documentación",
          "Presentación del reclamo ante la aseguradora",
          "Seguimiento de la respuesta",
        ],
        excludes: ["Demanda judicial", "Garantía de resultado"],
      },
      {
        id: "negociacion",
        label: "Negociación de acuerdo",
        fee: { minJus: 1, maxJus: 3 },
        includes: [
          "Evaluación del daño y su reparación",
          "Negociación con la otra parte o su aseguradora",
          "Redacción del acuerdo",
        ],
        excludes: ["Demanda judicial", "Garantía de resultado"],
      },
      {
        id: "judicial",
        label: "Demanda y representación judicial",
        fee: null,
        includes: [
          "Redacción y presentación de la demanda",
          "Ofrecimiento y producción de prueba",
          "Representación en audiencias",
        ],
        excludes: ["Peritajes y gastos del proceso", "Garantía de resultado"],
      },
    ],
  },
  {
    id: "civil",
    label: "Civil y comercial",
    services: [
      {
        id: "contrato",
        label: "Revisión o redacción de contrato",
        fee: null,
        includes: [
          "Revisión de cláusulas y riesgos",
          "Redacción o propuesta de cambios",
          "Una ronda de ajustes",
        ],
        excludes: ["Negociación con la otra parte", "Certificación de firmas"],
      },
      {
        id: "intimacion",
        label: "Carta documento o intimación",
        fee: { minJus: 1.5, maxJus: 1.5 },
        includes: [
          "Análisis del caso",
          "Redacción de la carta documento o intimación",
        ],
        excludes: ["Costo de envío", "Acciones judiciales posteriores"],
      },
      {
        id: "cobro",
        label: "Cobro extrajudicial de deuda",
        fee: null,
        includes: [
          "Análisis de la documentación de la deuda",
          "Intimación de pago",
          "Negociación de un acuerdo de pago",
        ],
        excludes: ["Cobro judicial", "Garantía de cobro"],
      },
      {
        id: "informe",
        label: "Informe jurídico o segunda opinión",
        fee: { minJus: 1, maxJus: 2 },
        includes: [
          "Revisión de la documentación",
          "Informe escrito con alternativas",
        ],
        excludes: ["Representación en el caso", "Escritos o presentaciones"],
      },
      {
        id: "escrito",
        label: "Escrito o presentación puntual",
        fee: { minJus: 1, maxJus: 2 },
        includes: [
          "Análisis de lo que hay que presentar",
          "Redacción del escrito",
          "Presentación",
        ],
        excludes: ["Seguimiento posterior del expediente", "Tasas y gastos"],
      },
    ],
  },
];
