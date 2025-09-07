import { test, expect, Page } from "@playwright/test";

// Ensures A/B assignment event (ab_assign) is emitted when variants exist

async function upsertExperiment(page: Page) {
  const fd = new FormData();
  fd.append("key", "hero");
  fd.append("slug", "welcome");
  fd.append("variants[]", "A");
  fd.append("variants[]", "B");
  fd.append("alloc[A]", "50");
  fd.append("alloc[B]", "50");
  await page.request.post("http://localhost:4000/v1/dev/upsert_experiment", {
    form: fd,
  });
}

async function fetchEvents(page: Page) {
  const res = await page.request.get(
    "http://localhost:4000/v1/dev/events?kind=ab_assign&limit=5"
  );
  return await res.json();
}

test.describe("Experiment hero variant assignment", () => {
  test("emits ab_assign event on public page load with variants", async ({
    page,
  }) => {
    await upsertExperiment(page);
    await page.goto("http://localhost:3000/p/welcome");
    // Poll for ab_assign event
    let events: any[] = [];
    for (let i = 0; i < 10; i++) {
      events = await fetchEvents(page);
      if (events.some((e) => e.variant)) break;
      await page.waitForTimeout(250);
    }
    expect(events.some((e) => e.kind === "ab_assign")).toBeTruthy();
  });
});
