import { NextRequest } from "next/server";

// Returns static HTML export for an email
// Next.js route handlers accept (request, context) where context.params is inferred.
// Using an explicit inline type for context to avoid the build error about invalid second argument.
export async function GET(_req: NextRequest, context: any) {
  const { emailId } = context.params || {};
  const html = `<html><body><h1>Email ${emailId}</h1><p>Export placeholder (HTML only for now).</p></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
