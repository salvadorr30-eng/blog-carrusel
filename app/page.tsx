import Link from "next/link";
import { getAllBooks } from "@/lib/content";
import { Newsletter } from "@/components/Newsletter";

export default function HomePage() {
  const books = getAllBooks();

  return (
    <div className="space-y-16">
      <section className="text-center max-w-2xl mx-auto pt-10">
        <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight">
          Historias que se quedan contigo.
        </h1>
        <p className="mt-6 text-lg text-ink/70">
          Novelas, reseñas y extractos. Lee aquí, compra en la tienda.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/libros"
            className="bg-ink text-paper px-6 py-3 rounded-full hover:opacity-90"
          >
            Ver libros
          </Link>
          <Link
            href="/blog"
            className="border border-ink px-6 py-3 rounded-full hover:bg-ink hover:text-paper"
          >
            Leer el blog
          </Link>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-3xl font-bold mb-8">Mis libros</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {books.map((book) => (
            <Link
              key={book.slug}
              href={`/libros/${book.slug}`}
              className="group"
            >
              <div className="aspect-[2/3] bg-ink/5 rounded-lg overflow-hidden mb-3">
                {book.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover}
                    alt={`Portada de ${book.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                )}
              </div>
              <h3 className="font-serif text-xl font-bold">{book.title}</h3>
              <p className="text-sm text-ink/60">{book.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
