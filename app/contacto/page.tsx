import type { Metadata } from 'next';
import { ObfuscatedEmail } from '@/components/ObfuscatedEmail';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto con Carrusel de Oportunidades para consultas, soporte o cualquier cuestión.'
};

export default function ContactoPage() {
  return (
    <div className='max-w-2xl mx-auto py-10'>
      <h1 className='font-serif text-4xl md:text-5xl font-bold mb-6'>
        Contacto
      </h1>
      <p className='text-ink/70 text-lg mb-8'>
        ¿Tienes alguna pregunta o necesitas ayuda? Escríbenos y te responderemos lo antes posible.
      </p>

      <div className='bg-white border border-ink/10 rounded-2xl p-8 space-y-8'>
        <ContactForm />

        <div className='border-t border-ink/10 pt-6'>
          <h2 className='font-serif text-xl font-bold mb-2'>O escríbenos directamente</h2>
          <p className='text-ink/60 text-sm mb-3'>
            Soporte, información sobre productos o dudas sobre compras.
          </p>
          <ObfuscatedEmail className='inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition cursor-pointer' />
        </div>

        <div className='border-t border-ink/10 pt-6'>
          <h2 className='font-serif text-xl font-bold mb-2'>Tiempo de respuesta</h2>
          <p className='text-ink/60'>
            Respondemos a todas las consultas en un plazo máximo de <strong>5 días hábiles</strong>.
          </p>
        </div>

        <div className='border-t border-ink/10 pt-6'>
          <h2 className='font-serif text-xl font-bold mb-2'>Dirección postal</h2>
          <address className='text-ink/60 not-italic text-sm leading-relaxed'>
            OtoCoMatic LLC — Surtrading Series 147<br />
            390 NE 191st St, Ste 8558<br />
            Miami, FL 33179-3899<br />
            Estados Unidos
          </address>
        </div>
      </div>
    </div>
  );
}