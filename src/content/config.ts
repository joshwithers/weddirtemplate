import { defineCollection, z } from 'astro:content';
import { image } from 'astro:assets';

const directoryCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.union([
      image(),
      z.string().url()
    ]).optional(),
    logo: z.union([
      image(),
      z.string().url()
    ]).optional(),
    category: z.array(z.string()),
    location: z.array(z.string()),
    featured: z.boolean().optional(),
    website: z.string().optional(),
  })
});

export const collections = {
  'directory': directoryCollection
};