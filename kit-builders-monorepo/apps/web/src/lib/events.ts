export async function track(event: string, data?: Record<string, any>) {
  try {
    await fetch("/api/app/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data, at: new Date().toISOString() }),
    });
  } catch (e) {
    /* non-blocking */
  }
}
