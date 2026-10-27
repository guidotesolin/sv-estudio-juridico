// Public contact and booking values; not secrets. Placeholders until the client provides them
// (backlog B4: WhatsApp and email, B6: Cal.com account).
const whatsappNumber = "5490000000000";

export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export const email = "contacto@example.com";

export const calUsername = "sv-estudio";

export const calEventSlugs = [
  "consulta-inicial",
  "consulta-revision-documental",
  "revision-expediente",
] as const;

export type CalEventSlug = (typeof calEventSlugs)[number];
