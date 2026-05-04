import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      draft: z.boolean().default(false),
      showToc: z.boolean().default(false),
      canonicalURL: z.string().url().optional(),
      originalSource: z.enum(['Medium', 'LinkedIn']).optional(),
    }),
});

export const collections = { blog };
