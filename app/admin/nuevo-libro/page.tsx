'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/ +/g, '-')
    .slice(0, 80);
}

const SHOP_BASE = 'https://carruseldeoportunidades.es';

export default function NuevoLibroPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    author: '',
    isbn: '',
    pages: '',
    genre: 'Novela',
    publishedAt: new Date().toISOString().slice(0, 10),
    coverUrl: '',
    summary: '',
    synopsis: '',
    extract: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    ebookUrl: '',
    printUrl: '',
    amazonUrl: '',
    priceEbook: '',
    pricePrint: '',
    previewUrl: ''
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && (!f.slug || f.slug === slugify(f.title))) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handlePreviewFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let coverPath = form.coverUrl;
      let previewPath = form.previewUrl;

      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        fd.append('slug', form.slug || slugify(form.title));
        const upRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: fd
        });
        if (!upRes.ok) throw new Error('Fallo al subir la portada');
        const { path } = await upRes.json();
        coverPath = path;
      }

      if (previewFile) {
        const fd = new FormData();
        fd.append('file', previewFile);
        fd.append('slug', (form.slug || slugify(form.title)) + '-preview');
        const upRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: fd
        });
        if (!upRes.ok) throw new Error('Fallo al subir la previsualización');
        const { path } = await upRes.json();
        previewPath = path;
      }

      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        cover: coverPath,
        previewUrl: previewPath,
        pages: form.pages ? Number(form.pages) : undefined,
        priceEbook: form.priceEbook ? Number(form.priceEbook) : undefined,
        pricePrint: form.pricePrint ? Number(form.pricePrint) : undefined,
        keywords: form.keywords
          ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : undefined
      };

      const res = await fetch('/api/admin/libros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Error al guardar');
      }

      router.push(`/libros/${payload.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <h1 className='font-serif text-4xl font-bold mb-2'>Nuevo libro</h1>
      <p className='text-ink/60 mb-10'>
        Rellena los campos. Los marcados con * son obligatorios.
      </p>

      <form onSubmit={handleSubmit} className='space-y-10'>
        <Section title='Datos básicos'>
          <Field label='Título *' required>
            <input
              type='text'
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label='Slug (URL)' hint={`Se mostrará en /libros/${form.slug || 'tu-slug'}`}>
            <input
              type='text'
              value={form.slug}
              onChange={(e) => update('slug', slugify(e.target.value))}
              className={inputCls}
            />
          </Field>

          <Field label='Subtítulo'>
            <input
              type='text'
              value={form.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label='Autor *' required>
            <input
              type='text'
              required
              value={form.author}
              onChange={(e) => update('author', e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className='grid grid-cols-2 gap-4'>
            <Field label='Género'>
              <input
                type='text'
                value={form.genre}
                onChange={(e) => update('genre', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label='Páginas'>
              <input
                type='number'
                value={form.pages}
                onChange={(e) => update('pages', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <Field label='ISBN'>
              <input
                type='text'
                value={form.isbn}
                onChange={(e) => update('isbn', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label='Fecha de publicación'>
              <input
                type='date'
                value={form.publishedAt}
                onChange={(e) => update('publishedAt', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        <Section title='Portada'>
          <Field label='Subir imagen' hint='JPG o PNG, idealmente proporción 2:3'>
            <input
              type='file'
              accept='image/*'
              onChange={handleCoverFile}
              className='block text-sm'
            />
          </Field>

          <div className='text-center text-sm text-ink/40'>— o —</div>

          <Field label='URL de imagen'>
            <input
              type='url'
              placeholder='https://...'
              value={form.coverUrl}
              onChange={(e) => update('coverUrl', e.target.value)}
              className={inputCls}
            />
          </Field>

          {(coverPreview || form.coverUrl) && (
            <div className='mt-3'>
              <p className='text-xs text-ink/60 mb-2'>Previsualización:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview || form.coverUrl}
                alt='Previsualización portada'
                className='w-32 aspect-[2/3] object-cover rounded shadow'
              />
            </div>
          )}
        </Section>

        <Section title='Contenido'>
          <Field
            label='Resumen corto *'
            hint='2-3 frases. Aparece en listados y como descripción SEO por defecto.'
            required
          >
            <textarea
              required
              rows={3}
              value={form.summary}
              onChange={(e) => update('summary', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field
            label='Sinopsis larga'
            hint='Texto principal de la ficha. Acepta Markdown.'
          >
            <textarea
              rows={8}
              value={form.synopsis}
              onChange={(e) => update('synopsis', e.target.value)}
              className={inputCls}
              placeholder='Escribe la sinopsis completa...'
            />
          </Field>

          <Field label='Extracto / Primer párrafo (opcional)'>
            <textarea
              rows={4}
              value={form.extract}
              onChange={(e) => update('extract', e.target.value)}
              className={inputCls}
              placeholder='Una cita memorable o el primer párrafo del libro...'
            />
          </Field>
        </Section>

        <Section title='SEO' subtitle='Opcional. Si lo dejas vacío usará título y resumen.'>
          <Field label='Meta title'>
            <input
              type='text'
              maxLength={60}
              value={form.metaTitle}
              onChange={(e) => update('metaTitle', e.target.value)}
              className={inputCls}
              placeholder={form.title || 'Título para Google'}
            />
            <p className='text-xs text-ink/40 mt-1'>
              {form.metaTitle.length}/60 caracteres
            </p>
          </Field>

          <Field label='Meta description'>
            <textarea
              rows={2}
              maxLength={160}
              value={form.metaDescription}
              onChange={(e) => update('metaDescription', e.target.value)}
              className={inputCls}
              placeholder={form.summary || 'Descripción para Google'}
            />
            <p className='text-xs text-ink/40 mt-1'>
              {form.metaDescription.length}/160 caracteres
            </p>
          </Field>

          <Field label='Palabras clave' hint='Separadas por comas'>
            <input
              type='text'
              value={form.keywords}
              onChange={(e) => update('keywords', e.target.value)}
              className={inputCls}
              placeholder='novela, faro, gallega, drama familiar'
            />
          </Field>
        </Section>

        <Section
          title='Enlaces a la tienda'
          subtitle={`Tu tienda: ${SHOP_BASE}`}
        >
          <Field
            label='URL ebook'
            hint='URL completa del producto en tu tienda, o solo el handle'
          >
            <input
              type='text'
              value={form.ebookUrl}
              onChange={(e) => update('ebookUrl', e.target.value)}
              className={inputCls}
              placeholder={`${SHOP_BASE}/products/...`}
            />
          </Field>

          <Field
            label='URL PDF (tu tienda)'
            hint='URL del PDF en tu tienda LemonSqueezy'
          >
            <input
              type='text'
              value={form.printUrl}
              onChange={(e) => update('printUrl', e.target.value)}
              className={inputCls}
              placeholder='https://carruseldeoportunidades.lemonsqueezy.com/...'
            />
          </Field>

          <Field
            label='URL libro impreso (Amazon)'
            hint='URL del libro en papel en Amazon (opcional)'
          >
            <input
              type='url'
              value={form.amazonUrl}
              onChange={(e) => update('amazonUrl', e.target.value)}
              className={inputCls}
              placeholder='https://www.amazon.es/dp/...'
            />
          </Field>

          <div className='grid grid-cols-2 gap-4'>
            <Field label='Precio ebook (€)'>
              <input
                type='number'
                step='0.01'
                value={form.priceEbook}
                onChange={(e) => update('priceEbook', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label='Precio impreso (€)'>
              <input
                type='number'
                step='0.01'
                value={form.pricePrint}
                onChange={(e) => update('pricePrint', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field
            label='Previsualización PDF'
            hint='Sube el PDF de muestra del libro (opcional)'
          >
            <input
              type='file'
              accept='application/pdf'
              onChange={handlePreviewFile}
              className='block text-sm'
            />
            {previewFile && (
              <p className='text-xs text-green-600 mt-1'>✓ {previewFile.name}</p>
            )}
          </Field>

          <div className='text-center text-sm text-ink/40'>— o —</div>

          <Field label='URL del PDF'>
            <input
              type='url'
              value={form.previewUrl}
              onChange={(e) => update('previewUrl', e.target.value)}
              className={inputCls}
              placeholder='https://...'
            />
          </Field>
        </Section>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg'>
            {error}
          </div>
        )}

        <div className='flex gap-3 sticky bottom-4 bg-paper p-4 rounded-xl shadow-lg border border-ink/10'>
          <button
            type='submit'
            disabled={submitting}
            className='bg-accent text-white px-8 py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-50'
          >
            {submitting ? 'Guardando…' : 'Publicar libro'}
          </button>
          <button
            type='button'
            onClick={() => router.push('/admin')}
            className='px-6 py-3 border border-ink/20 rounded-full hover:bg-ink/5'
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-ink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white';

function Section({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className='border border-ink/10 rounded-xl p-6 space-y-4 bg-white/50'>
      <header>
        <h2 className='font-serif text-2xl font-bold'>{title}</h2>
        {subtitle && <p className='text-sm text-ink/60 mt-1'>{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className='block'>
      <span className='block text-sm font-medium mb-1'>{label}</span>
      {children}
      {hint && <p className='text-xs text-ink/50 mt-1'>{hint}</p>}
    </label>
  );
}