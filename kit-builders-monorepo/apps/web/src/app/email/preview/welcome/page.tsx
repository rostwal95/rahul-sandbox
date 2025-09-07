import * as React from "react";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@kit/email-templates";

export const dynamic = "force-dynamic";

export default async function Preview() {
  if (process.env.NODE_ENV !== "development") {
    return <main className="p-6">Email previews are dev-only.</main>;
  }
  const html = await render(
    React.createElement(WelcomeEmail, { name: "Creator" }),
  );
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Welcome Email (Preview)</h1>
      <iframe srcDoc={html} className="w-full h-[70vh] border rounded-xl" />
    </main>
  );
}
