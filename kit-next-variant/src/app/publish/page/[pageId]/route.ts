import { NextRequest } from "next/server";

// Returns static HTML & JSON mock export for a landing page
export async function GET(_req: NextRequest, context: any) {
  const { pageId } = context.params || {};
  const html = `<html><body><h1>Landing Page ${pageId}</h1><p>Static export placeholder.</p></body></html>`;
  const json = {
    id: pageId,
    headline: "Landing Page " + pageId,
    bullets: ["One", "Two", "Three"],
  };
  return Response.json({ html, data: json });
}
