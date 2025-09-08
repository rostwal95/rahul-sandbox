import { z } from "zod";

export const EventSchema = z.object({
  id: z.number().optional(),
  ts: z.number(),
  type: z.string(),
  message: z.string(),
  meta: z.any().optional(),
});

export const ThemeTokenSchema = z.object({
  brand: z.string().regex(/^#/),
  radius: z.number().min(0).max(32),
});

export type Event = z.infer<typeof EventSchema>;
