// Public contact and booking values; not secrets. The three event slugs must exist in the Cal.com
// account with these exact names (backlog B6).
const whatsappNumber = "5493425322212";

export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export const email = "estudiojuridicovidoni@gmail.com";

export const calUsername = "estudiovidoni";

export const calEventSlugs = [
  "consulta-inicial",
  "consulta-revision-documental",
  "revision-expediente",
] as const;

export type CalEventSlug = (typeof calEventSlugs)[number];
