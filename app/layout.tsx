import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CookieBanner } from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: {
    default: 'Carrusel de Oportunidades',
    template: '%s | Carrusel de Oportunidades'
  },
  description:
    'Cómics ilustrados y libros en PDF, ebook y tapa blanda. Historias para niños, jóvenes y familias.',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Carrusel de Oportunidades'
  },
  twitter: {
    card: 'summary_large_image'
  },
  metadataBase: new URL('https://carruseldeoportunidades.es')
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <body className='min-h-screen flex flex-col'>
        <header className='border-b border-ink/5 bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
          <nav className='max-w-5xl mx-auto px-6 py-4 flex items-center justify-between'>
            <Link href='/' className='font-serif text-xl font-bold text-gradient'>
              🎠 Carrusel de Oportunidades
            </Link>
            <ul className='flex gap-6 text-sm font-medium items-center'>
              <li>
                <Link href='/libros' className='text-ink/70 hover:text-accent transition'>
                  Libros
                </Link>
              </li>
              <li>
                <Link href='/blog' className='text-ink/70 hover:text-accent transition'>
                  Blog
                </Link>
              </li>

              <li>
                <a
                  href='https://carruseldeoportunidades.es'
                  target='_blank'
                  rel='noopener'
                  className='bg-accent text-white px-5 py-2 rounded-full hover:bg-orange-600 transition shadow-sm shadow-accent/30'
                >
                  Tienda →
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <main className='flex-1 max-w-5xl w-full mx-auto px-6 py-10'>
          {children}
        </main>

        <footer className='border-t border-ink/10 mt-20'>
          <div className='max-w-5xl mx-auto px-6 py-10 text-sm text-ink/60'>
            <div className='grid md:grid-cols-4 gap-8 mb-8'>
              <div>
                <p className='font-serif text-base font-bold text-ink mb-2'>
                  Carrusel de Oportunidades
                </p>
                <p className='text-xs leading-relaxed'>
                  Cómics ilustrados y libros para toda la familia.
                </p>
                <p className='text-xs mt-3 opacity-80'>
                  OtoCoMatic LLC — Surtrading Series 147
                  <br />
                  Wyoming, EEUU
                </p>
              </div>

              <div>
                <p className='font-bold text-ink mb-3'>Explora</p>
                <ul className='space-y-2'>
                  <li>
                    <Link href='/libros' className='hover:text-accent'>
                      Libros
                    </Link>
                  </li>
                  <li>
                    <Link href='/blog' className='hover:text-accent'>
                      Blog
                    </Link>
                  </li>

                  <li>
                    <Link href='/sobre-mi' className='hover:text-accent'>
                      Sobre mí
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className='font-bold text-ink mb-3'>Legal</p>
                <ul className='space-y-2'>
                  <li>
                    <Link
                      href='/legal/aviso-legal'
                      className='hover:text-accent'
                    >
                      Aviso legal
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/legal/privacidad'
                      className='hover:text-accent'
                    >
                      Política de privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href='/legal/cookies' className='hover:text-accent'>
                      Política de cookies
                    </Link>
                  </li>
                  <li>
                    <Link href='/legal/terminos' className='hover:text-accent'>
                      Términos de venta
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/legal/devoluciones'
                      className='hover:text-accent'
                    >
                      Devoluciones
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className='font-bold text-ink mb-3'>Contacto</p>
                <ul className='space-y-2'>
                  <li>
                    <a
                      href='mailto:info@carruseldeoportunidades.es'
                      className='hover:text-accent'
                    >
                      info@carruseldeoportunidades.es
                    </a>
                  </li>
                  <li>
                    <a
                      href='mailto:legal@carruseldeoportunidades.es'
                      className='hover:text-accent'
                    >
                      legal@carruseldeoportunidades.es
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className='border-t border-ink/10 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs'>
              <p>
                © {new Date().getFullYear()} OtoCoMatic LLC — Surtrading
                Series 147. Todos los derechos reservados.
              </p>
              <Link href='/admin' className='opacity-40 hover:opacity-100'>
                Admin
              </Link>
            </div>
          </div>
        </footer>

        <CookieBanner />
      </body>
    </html>
  );
}