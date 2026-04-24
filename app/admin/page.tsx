import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllBooks } from "@/lib/content";

export default function AdminDashboard() {
  const router = useRouter();
  const books = getAllBooks();

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      const res = await fetch(`/api/admin/libros/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error || "No se pudo eliminar"}`);
        return;
      }
      alert("Libro eliminado. Recarga la página para ver los cambios.");
      router.refresh();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-4xl font-bold">Panel de administración</h1>
        <Link
          href="/admin/nuevo-libro"
          className="bg-accent text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90"
        >
          + Añadir libro
        </Link>
      </header>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4">
          Libros publicados ({books.length})
        </h2>
        <div className="border border-ink/10 rounded-xl divide-y divide-ink/10">
          {books.length === 0 && (
            <p className="p-6 text-ink/60">Aún no hay libros. Empieza añadiendo uno.</p>
          )}
          {books.map((book) => (
            <div key={book.slug} className="flex items-center gap-4 p-4 hover:bg-ink/5">
              <div className="w-14 h-20 bg-ink/10 rounded overflow-hidden flex-shrink-0">
                {book.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.cover} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif font-bold truncate">{book.title}</p>
                <p className="text-sm text-ink/60 truncate">
                  {book.author} · {book.genre} · {book.publishedAt}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <Link
                  href={`/admin/editar/${book.slug}`}
                  className="px-3 py-1.5 bg-accent text-white rounded-full hover:opacity-90"
                >
                  Editar
                </Link>
                <Link
                  href={`/libros/${book.slug}`}
                  className="px-3 py-1.5 border border-ink/20 rounded-full hover:bg-ink hover:text-paper"
                  target="_blank"
                >
                  Ver
                </Link>
                <button
                  onClick={() => handleDelete(book.slug, book.title)}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-full hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink/5 rounded-xl p-6 text-sm text-ink/70 space-y-2">
        <p>
          <strong>¿Cómo funciona?</strong> El formulario crea o edita archivos{" "}
          <code>.mdx</code> directamente en GitHub. Vercel redespliega automáticamente en ~1 minuto.
        </p>
      </section>
    </div>
  );
}
