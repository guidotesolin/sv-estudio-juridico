import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const services = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    summary: z.string(),
    order: z.number(),
    documentation: z.array(z.string()),
    notIncluded: z.array(z.string()),
  }),
});

export const collections = { services };
