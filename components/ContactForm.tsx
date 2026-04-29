"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const token = await window.grecaptcha.execute(SITE_KEY, { action: "contact" });

      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");

      setStatus("ok");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  const inputCls = "w-full px-4 py-3 border border-ink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputCls}
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputCls}
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mensaje</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={inputCls}
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>

      {/* Honeypot anti-bot: campo oculto que los bots rellenan */}
      <input type="text" name="_trap" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      {status === "ok" && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          ✅ Mensaje enviado. Te responderemos en un plazo máximo de 5 días hábiles.
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          Error: {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-accent text-white px-6 py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-50 transition"
      >
        {status === "sending" ? "Enviando…" : "Enviar mensaje"}
      </button>
      <p className="text-xs text-ink/40 text-center">
        Protegido por reCAPTCHA. Se aplican la{" "}
        <a href="https://policies.google.com/privacy" target="_blank" className="underline">Política de privacidad</a>{" "}
        y los{" "}
        <a href="https://policies.google.com/terms" target="_blank" className="underline">Términos del servicio</a>{" "}
        de Google.
      </p>
    </form>
  );
}
