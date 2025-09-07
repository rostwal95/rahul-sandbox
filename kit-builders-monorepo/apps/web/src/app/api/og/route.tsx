import { ImageResponse } from "@vercel/og";
import { apiBase } from "@/lib/apiBase";

export const runtime = "edge";

async function getPage(slug: string) {
  const api = apiBase();
  try {
    const r = await fetch(
      `${api}/v1/pages/slug?slug=${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const titleParam = searchParams.get("title");
  const page = slug ? await getPage(slug) : null;
  const theme = page?.theme_json || {};
  const ctaText =
    page?.page_blocks
      ?.find((b: any) => b.kind === "cta")
      ?.data_json?.html?.replace(/<[^>]+>/g, "")
      .slice(0, 60) || "";
  const title =
    titleParam ||
    page?.page_blocks
      ?.find((b: any) => b.kind === "hero")
      ?.data_json?.html?.replace(/<[^>]+>/g, "")
      .slice(0, 80) ||
    slug ||
    "Kit Page";

  const heroImg =
    page?.page_blocks?.find((b: any) => b.kind === "hero")?.data_json?.data
      ?.image || "";
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: theme?.colors?.bg || "#0a0a0a",
          color: theme?.colors?.ink || "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 40,
          border: `24px solid ${theme?.colors?.accent || "#10b981"}`,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 24, opacity: 0.7, marginTop: 16 }}>
          kit.builders
        </div>
        {ctaText && (
          <div
            style={{
              fontSize: 28,
              marginTop: 12,
              background: theme?.colors?.accent || "#10b981",
              color: "#0a0a0a",
              padding: "8px 16px",
              borderRadius: 12,
            }}
          >
            {ctaText}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
