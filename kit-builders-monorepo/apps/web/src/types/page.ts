export type Block = { id: number; kind: 'hero'|'cta'|'testimonial'|'pricing'|'custom'; order: number; data_json: any };
export type Page = { id: number; org_id: number; slug: string; status: string; theme_json: any; published_at?: string };
