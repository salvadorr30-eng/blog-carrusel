"use client";

import { useState } from "react";

/**
 * Formulario de suscripción. Conecta la action con tu proveedor:
 * - MailerLite, ConvertKit/Kit, Beehiiv, Buttondown...
 * La mayoría ofrece un endpoint tipo form action o una API REST.
 */
export function Newsletter({
  variant = "card"
}: {
  variant?: "card" | "inline";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      // Sustituye por el endpoint de tu proveedor
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const wrapper =
    variant === "card"
      ? "bg-ink text-paper rounded-2xl p-10 md:p-14 text-center"
      : "border border-ink/20 rounded-xl p-6 md:p-8";

  return (
    <section className={wrapper}>
      <h2 className="font-serif text-2xl md:text-3xl font-bold">
        Recibe el primer capítulo gratis
      </h2>
      <p
        className={`mt-2 ${
          variant === "card" ? "text-paper/70" : "text-ink/70"
        }`}
      >
        Novedades, extractos y un capítulo exclusivo al suscribirte.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 px-4 py-3 rounded-full text-ink"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-accent text-white px-6 py-3 rounded-full hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Enviando…" : "Suscribirme"}
        </button>
      </form>
      {status === "done" && (
        <p className="mt-3 text-sm">
          ¡Listo! Revisa tu email para confirmar.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">
          Hubo un problema. Inténtalo de nuevo.
        </p>
      )}
    </section>
  );
}
