import Link from 'next/link';
import { getAllBooks } from '@/lib/content';

export default function HomePage() {
  const books = getAllBooks();

  return (
    <div className='space-y-20'>

      {/* ── HERO ── */}
      <section className='relative rounded-3xl bg-hero overflow-hidden px-8 py-16 md:py-24 text-center'>
        {/* Decorative blobs */}
        <div className='absolute top-6 left-6 w-20 h-20 rounded-full bg-sunshine/40 blur-xl' />
        <div className='absolute top-10 right-10 w-28 h-28 rounded-full bg-violet/20 blur-2xl' />
        <div className='absolute bottom-8 left-1/3 w-24 h-24 rounded-full bg-teal/20 blur-xl' />
        <div className='absolute bottom-6 right-8 w-16 h-16 rounded-full bg-coral/30 blur-xl' />

        <div className='relative max-w-2xl mx-auto'>
          <span className='inline-block bg-sunshine text-ink text-sm font-semibold px-4 py-1.5 rounded-full mb-6'>
            📚 Cómics · Novelas · Cuentos
          </span>
          <h1 className='font-serif text-5xl md:text-7xl font-bold leading-tight'>
            Historias que{' '}
            <span className='text-gradient'>se quedan</span>{' '}
            contigo.
          </h1>
          <p className='mt-6 text-lg text-ink/70 max-w-lg mx-auto'>
            Libros ilustrados y novelas para niños, jóvenes y familias.
            Lee aquí, compra en la tienda.
          </p>
          <div className='mt-8 flex gap-4 justify-center flex-wrap'>
            <Link
              href='/libros'
              className='bg-accent text-white px-8 py-3.5 rounded-full font-semibold hover:bg-orange-600 transition shadow-lg shadow-accent/30'
            >
              Ver libros →
            </Link>
            <Link
              href='/blog'
              className='bg-white text-ink px-8 py-3.5 rounded-full font-semibold border-2 border-ink/10 hover:border-accent hover:text-accent transition'
            >
              Leer el blog
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIBROS ── */}
      <section>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='font-serif text-3xl md:text-4xl font-bold'>
              Mis libros
            </h2>
            <div className='mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-sunshine' />
          </div>
          <Link
            href='/libros'
            className='text-sm font-semibold text-accent hover:underline'
          >
            Ver todos →
          </Link>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {books.map((book, i) => {
            const colors = [
              'from-sunshine/30 to-coral/20',
              'from-teal/20 to-sky/20',
              'from-violet/20 to-coral/20',
            ];
            return (
              <Link
                key={book.slug}
                href={`/libros/${book.slug}`}
                className='group rounded-2xl overflow-hidden border border-ink/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white'
              >
                <div className={`aspect-[2/3] bg-gradient-to-br ${colors[i % 3]} overflow-hidden`}>
                  {book.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover}
                      alt={`Portada de ${book.title}`}
                      className='w-full h-full object-cover group-hover:scale-105 transition duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-5xl'>
                      📖
                    </div>
                  )}
                </div>
                <div className='p-4'>
                  <h3 className='font-serif text-lg font-bold leading-snug group-hover:text-accent transition'>
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className='text-sm text-ink/50 mt-1'>{book.subtitle}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}