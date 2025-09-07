export type LandingTemplate = { id: string; name: string; blocks: Array<{ kind: string; data_json: any }>; thumbnail?: string };
export const templates: LandingTemplate[] = [
  { id: 'lp-simple', name: 'Simple Hero + CTA', blocks: [
    { kind: 'hero', data_json: { html: '<h1>Join my newsletter</h1><p>Get weekly insights</p>' } },
    { kind: 'cta', data_json: { html: '<p><a href="#">Subscribe</a></p>' } }
  ]},
  { id: 'lp-product', name: 'Product Launch', blocks: [
    { kind: 'hero', data_json: { html: '<h1>Launching Soon</h1><p>Be the first to know</p>' } },
    { kind: 'cta', data_json: { html: '<p><a href="#">Notify me</a></p>' } }
  ]}
];
