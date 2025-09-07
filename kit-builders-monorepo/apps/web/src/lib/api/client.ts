import ky from "ky";

export const api = ky.create({
  prefixUrl: "/api/app",
  headers: { "Content-Type": "application/json" },
  hooks: {
    afterResponse: [
      (_req, _opt, res) => {
        if (!res.ok) console.warn("API error", res.status);
      },
    ],
  },
});
