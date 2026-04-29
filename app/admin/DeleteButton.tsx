"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/libros/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Error al eliminar");
        return;
      }
      router.refresh();
    } catch {
      alert("Error de red al eliminar");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-1 items-center">
        <span className="text-xs text-red-700 mr-1">¿Seguro?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 text-xs"
        >
          {deleting ? "…" : "Sí, eliminar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 border border-ink/20 rounded-full hover:bg-ink/5 text-xs"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 border border-red-200 text-red-600 rounded-full hover:bg-red-50"
    >
      Eliminar
    </button>
  );
}
