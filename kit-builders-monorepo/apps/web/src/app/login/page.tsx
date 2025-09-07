"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("demo@kit.test");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/session/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      try {
        const json = await res.json();
        if (json.demo) {
          // Provide a quick UI hint about demo mode
          alert("Signed in with demo fallback (upstream API offline).");
        }
      } catch {}
      location.href = "/dashboard";
    } else setError("Login failed");
  };

  return (
    <main className="grid place-items-center min-h-dvh">
      <form onSubmit={submit} className="card p-6 min-w-[320px]">
        <h1 className="text-xl font-semibold mb-3">Sign in</h1>
        <input
          className="input mb-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input mb-3"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-solid w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
    </main>
  );
}
