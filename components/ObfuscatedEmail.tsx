"use client";

import { useState } from "react";

// El email se construye en el cliente para evitar que los bots lo capturen del HTML
const USER = "ramirezhoyossalvador";
const DOMAIN = "gmail.com";

export function ObfuscatedEmail({ className }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);
  const email = `${USER}@${DOMAIN}`;

  if (!revealed) {
    return (
      <button
        onClick={() => setRevealed(true)}
        className={className}
      >
        Mostrar email de contacto
      </button>
    );
  }

  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
