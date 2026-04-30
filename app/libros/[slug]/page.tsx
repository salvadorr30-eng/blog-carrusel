import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBooks, getBookBySlug, getTranslations } from '@/lib/content';
import { BookSchema } from '@/components/BookSchema';
import { BuyButtons } from '@/components/BuyButtons';
import remarkGfm from 'remark-gfm';

export const revalidate = 60;

export function generateStaticParams() {
  return getAllBooks().map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const book = getBookBySlug(params.slug);
  if (!book) return {};
  return {
    title: book.metaTitle || book.title,
    description: book.metaDescription || book.summary,
    keywords: book.keywords,
    openGraph: {
      title: book.metaTitle || book.title,
      description: book.metaDescription || book.summary,
      images: book.cover ? [{
        url: book.cover.startsWith('http') ? book.cover : `https://carruseldeoportunidades.es${book.cover}`,
        width: 800,
        height: 1200,
        alt: book.title,
      }] : [],
      type: 'book',
      url: `https://carruseldeoportunidades.es/libros/${book.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: book.metaTitle || book.title,
      description: book.metaDescription || book.summary,
      images: book.cover ? [book.cover.startsWith('http') ? book.cover : `https://carruseldeoportunidades.es${book.cover}`] : [],
    }
  };
}

export default function BookPage({ params }: { params: { slug: string } }) {
  const book = getBookBySlug(params.slug);
  if (!book) notFound();

  const translations = getTranslations(book);

  return (
    <article className='grid md:grid-cols-[320px_1fr] gap-10'>
      <BookSchema book={book} />

      {/* Columna izquierda: portada + compra */}
      <aside className='space-y-6'>
        <div className='aspect-[2/3] bg-ink/5 rounded-lg overflow-hidden shadow-lg'>
          {book.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover}
              alt={`Portada de ${book.title}`}
              className='w-full h-full object-cover'
            />
          )}
        </div>

        <BuyButtons
          buyLinks={book.buyLinks}
          ebookUrl={book.ebookUrl}
          printUrl={book.printUrl}
          priceEbook={book.priceEbook}
          pricePrint={book.pricePrint}
        />

        {book.previewUrl && (
          <a
            href={book.previewUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='block w-full text-center bg-violet text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition'
          >
            📖 Ver Principio del PDF
          </a>
        )}

        <div className='text-sm text-ink/60 space-y-1 border-t border-ink/10 pt-4'>
          {book.ageRange && (
            <p>
              <strong>Edad:</strong> {book.ageRange} años
            </p>
          )}
          {book.pages && (
            <p>
              <strong>Páginas:</strong> {book.pages}
            </p>
          )}
          <p>
            <strong>Género:</strong> {book.genre}
          </p>
          {book.isbn && (
            <p>
              <strong>ISBN:</strong> {book.isbn}
            </p>
          )}
          {book.language && (
            <p>
              <strong>Idioma:</strong>{' '}
              {book.language === 'es' ? 'Español' : 'English'}
            </p>
          )}
          <p>
            <strong>Publicado:</strong> {book.publishedAt}
          </p>
        </div>

        {translations.length > 0 && (
          <div className='text-sm border-t border-ink/10 pt-4'>
            <p className='text-ink/60 mb-2'>También disponible en:</p>
            <ul className='space-y-1'>
              {translations.map((t) => {
                const flag =
                  t.language === 'en'
                    ? '🇬🇧'
                    : t.language === 'pt'
                    ? '🇵🇹'
                    : t.language === 'es'
                    ? '🇪🇸'
                    : '🌐';
                const name =
                  t.language === 'en'
                    ? 'English'
                    : t.language === 'pt'
                    ? 'Português'
                    : t.language === 'es'
                    ? 'Español'
                    : t.language;
                return (
                  <li key={t.slug}>
                    <Link
                      href={`/libros/${t.slug}`}
                      className='text-accent hover:underline'
                    >
                      {flag} {name}: {t.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>

      {/* Columna derecha: contenido */}
      <div>
        <h1 className='font-serif text-4xl md:text-5xl font-bold leading-tight'>
          {book.title}
        </h1>
        {book.subtitle && (
          <p className='text-xl text-ink/60 mt-2'>{book.subtitle}</p>
        )}
        <p className='text-sm text-ink/50 mt-3'>por {book.author}</p>

        <div className='prose prose-lg prose-stone mt-8 max-w-none'>
          <MDXRemote
            source={book.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
      </div>
    </article>
  );
}