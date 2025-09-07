export type HeroBlock = {
  type: "hero";
  props: {
    headline: string;
    sub?: string;
    cta?: { text: string; href: string };
    imageId?: string;
    align?: "left" | "center";
  };
};
export type TestimonialBlock = {
  type: "testimonial";
  props: { quote: string; author: string; role?: string; avatarId?: string };
};
export type PricingBlock = {
  type: "pricing";
  props: {
    tiers: {
      name: string;
      price: number;
      features: string[];
      cta: { text: string; href: string };
    }[];
    highlight?: number;
  };
};
export type CTABlock = {
  type: "cta";
  props: {
    headline: string;
    sub?: string;
    cta: { text: string; href: string };
  };
};
export type SubscribeBlock = {
  type: "subscribe";
  props: {
    headline?: string;
    sub?: string;
    placeholder?: string;
    consent?: string;
    cta?: { text: string; href?: string };
  };
};
export type Block =
  | (HeroBlock & { _id?: string; _new?: boolean })
  | (TestimonialBlock & { _id?: string; _new?: boolean })
  | (PricingBlock & { _id?: string; _new?: boolean })
  | (CTABlock & { _id?: string; _new?: boolean })
  | (SubscribeBlock & { _id?: string; _new?: boolean });

export type PageDoc = {
  id: string;
  title: string;
  slug: string;
  theme: {
    primary: string;
    fontScale: number;
    spacing: "compact" | "base" | "cozy";
  };
  blocks: Block[];
  version: number;
  updatedAt: string;
  status?: string; // draft | published (optional for future publish flow)
};
