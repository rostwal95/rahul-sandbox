"use client";
import TopBar from "@/components/TopBar";
import { useState } from "react";
import {
  ShadInput as Input,
  ShadButton as Button,
  ShadCard as Card,
} from "@/components/ui";

// Simple placeholder; Unsplash proxy route could be added at /api/unsplash
export default function MediaLibrary() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const search = async () => {
    // Placeholder search (would call /api/unsplash?q=...)
    setResults(
      Array.from(
        { length: 6 },
        (_, i) =>
          `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/300/180`
      )
    );
  };
  return (
    <div>
      <TopBar />
      <main className="container-wide px-6 py-8 space-y-8">
        {/* Hero */}
        <section className="card p-6 md:p-7 surface-glow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-[28px] font-semibold gradient-text">
                Media Library
              </h1>
              <p className="text-sm text-muted mt-1">
                Search & collect assets to reuse across pages and emails.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                Clear
              </Button>
              <Button size="sm" onClick={search}>
                Search
              </Button>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Input
              placeholder="Search Unsplash..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={search}>Go</Button>
          </div>
        </section>

        {/* Results */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((src) => (
            <Card key={src} className="p-0 overflow-hidden">
              <img src={src} alt="" className="w-full h-auto" />
            </Card>
          ))}
          {results.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted py-10 border border-dashed rounded-xl">
              Enter a keyword above to load sample images.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
