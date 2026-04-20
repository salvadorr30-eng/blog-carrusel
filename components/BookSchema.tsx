import type { Book } from "@/lib/content";

/**
 * JSON-LD schema para libros. Ayuda a que Google muestre rich results
 * (autor, precio, valoración) en los resultados de búsqueda.
 */
export function BookSchema({ book }: { book: Book }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    isbn: book.isbn,
    numberOfPages: book.pages,
    genre: book.genre,
    datePublished: book.publishedAt,
    image: book.cover,
    description: book.summary,
    offers: [
      book.priceEbook && {
        "@type": "Offer",
        price: book.priceEbook,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: book.ebookUrl,
        itemOffered: { "@type": "Book", bookFormat: "https://schema.org/EBook" }
      },
      book.pricePrint && {
        "@type": "Offer",
        price: book.pricePrint,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: book.printUrl,
        itemOffered: {
          "@type": "Book",
          bookFormat: "https://schema.org/Paperback"
        }
      }
    ].filter(Boolean)
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
