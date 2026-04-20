import Link from "next/link";
import { getAllBooks } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Libros",
  description: "Catálogo de libros: impreso y ebook."
};

export default function LibrosPage() {
  const books = getAllBooks();
  return (
    <div>
      <h1 className="font-serif text-4xl font-bold mb-10">Libros</h1>
      <div className="grid md:grid-cols-2 gap-10">
        {books.map((book) => (
          <Link
            key={book.slug}
            href={`/libros/${book.slug}`}
            className="flex gap-5 group"
          >
            <div className="w-32 aspect-[2/3] bg-ink/5 rounded overflow-hidden flex-shrink-0">
              {book.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover}
                  alt={`Portada de ${book.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              )}
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold group-hover:text-accent">
                {book.title}
              </h2>
              <p className="text-ink/60">{book.subtitle}</p>
              <p className="text-sm text-ink/50 mt-2">
                {book.pages} páginas · {book.genre}
              </p>
              <p className="mt-3 text-sm">{book.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
