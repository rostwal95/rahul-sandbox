import { z } from "zod";

// Theme Tokens
export const ThemeToken = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.object({
    bg: z.string(),
    fg: z.string(),
    muted: z.string(),
    primary: z.string(),
    primaryFg: z.string(),
    accent: z.string(),
  }),
  radius: z.enum(["sm", "md", "lg", "xl"]).default("xl"),
  spacing: z.enum(["compact", "cozy", "roomy"]).default("cozy"),
  font: z.enum(["inter", "system", "serif"]).default("inter"),
});
export type ThemeTokenType = z.infer<typeof ThemeToken>;

// Blocks
export const HeroBlock = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  type: z.literal("hero"),
  heading: z.string(),
  sub: z.string().optional(),
  cta: z.string().optional(),
  mediaUrl: z.string().optional(),
});
export const CtaBlock = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  type: z.literal("cta"),
  heading: z.string(),
  button: z.string(),
  target: z.string().url().optional(),
});
export const TestimonialBlock = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  type: z.literal("testimonial"),
  quote: z.string(),
  author: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export const PricingBlock = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  type: z.literal("pricing"),
  plans: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
    })
  ),
});
export const Block = z.discriminatedUnion("type", [
  HeroBlock,
  CtaBlock,
  TestimonialBlock,
  PricingBlock,
]);
export type BlockType = z.infer<typeof Block>;

// Landing Page
export const LandingPage = z.object({
  id: z.string(),
  title: z.string(),
  theme: ThemeToken,
  blocks: z.array(Block),
  seo: z
    .object({
      title: z.string().optional(),
      desc: z.string().optional(),
      og: z.string().url().optional(),
    })
    .optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type LandingPageType = z.infer<typeof LandingPage>;

// Email Document
export const EmailDoc = z.object({
  id: z.string(),
  name: z.string(),
  template: z.enum(["welcome", "newsletter"]).default("welcome"),
  html: z.string().optional(),
  json: z.any().optional(),
  darkPreview: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type EmailDocType = z.infer<typeof EmailDoc>;

// Events
export const Event = z.object({
  id: z.string(),
  type: z.enum([
    "onboarding:start",
    "onboarding:completeProfile",
    "create:page",
    "create:email",
    "publish:page",
    "export:email",
    "activate",
  ]),
  payload: z.record(z.any()).optional(),
  ts: z.number(),
});
export type EventType = z.infer<typeof Event>;

// Helper factories
export function createLandingPage(
  partial: Partial<LandingPageType> = {}
): LandingPageType {
  const now = Date.now();
  const baseTheme: ThemeTokenType = partial.theme ?? {
    id: crypto.randomUUID(),
    name: "Default",
    colors: {
      bg: "#ffffff",
      fg: "#0a0a0a",
      muted: "#6b7280",
      primary: "#0ea5e9",
      primaryFg: "#020617",
      accent: "#6366f1",
    },
    radius: "xl",
    spacing: "cozy",
    font: "inter",
  };
  return LandingPage.parse({
    id: crypto.randomUUID(),
    title: "Untitled Page",
    blocks: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
    theme: baseTheme,
  });
}

export function createEmail(partial: Partial<EmailDocType> = {}): EmailDocType {
  const now = Date.now();
  return EmailDoc.parse({
    id: crypto.randomUUID(),
    name: "Untitled Email",
    createdAt: now,
    updatedAt: now,
    ...partial,
  });
}

export function createEvent(
  type: EventType["type"],
  payload?: Record<string, any>
): EventType {
  return Event.parse({
    id: crypto.randomUUID(),
    type,
    payload,
    ts: Date.now(),
  });
}
