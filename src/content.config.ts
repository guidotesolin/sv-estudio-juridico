import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const services = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    summary: z.string(),
    // Legal notice shown under the summary, e.g. "no result is guaranteed" on daños.
    notice: z.string().optional(),
    // Position among the home's area cards.
    order: z.number(),
    // Home area card: short title, one-line summary and SVG path data (Tabler Icons, MIT).
    card: z.object({
      title: z.string(),
      summary: z.string(),
      icon: z.array(z.string()),
    }),
    documentation: z.array(z.string()),
    notIncluded: z.array(z.string()),
  }),
});

export const collections = { services };
