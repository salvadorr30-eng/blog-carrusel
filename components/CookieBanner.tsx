'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

export function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted' || consent === 'rejected') {
      setStatus(consent);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setStatus('accepted');
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setStatus('rejected');
  };

  if (status !== 'pending') return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 p-4'>
      <div className='max-w-5xl mx-auto bg-white border border-ink/10 rounded-2xl shadow-xl p-6 md:p-8'>
        <div className='flex flex-col md:flex-row gap-6 md:items-center'>
          <div className='flex-1'>
            <h2 className='font-serif text-lg font-bold text-ink'>
              🍪 Uso de cookies
            </h2>
            <p className='text-sm text-ink/70 mt-1'>
              Utilizamos cookies técnicas necesarias para el funcionamiento del sitio.
              También usamos cookies analíticas (opcionales) para mejorar nuestros servicios.
              Al navegar, aceptas nuestra{' '}
              <Link href='/legal/cookies' className='text-accent hover:underline'>
                política de cookies
              </Link>
              .
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-3 shrink-0'>
            <button
              onClick={handleReject}
              className='px-5 py-2.5 text-sm font-medium text-ink/70 border border-ink/20 rounded-full hover:bg-ink/5 transition'
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className='px-5 py-2.5 text-sm font-medium bg-accent text-white rounded-full hover:bg-orange-600 transition'
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}