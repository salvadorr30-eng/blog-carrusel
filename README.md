# Mi Blog de Libros

Blog + catálogo de libros en Next.js 14 (App Router) con MDX, Tailwind, SEO y schema.org para libros. Pensado para desplegar en Vercel y enlazar la compra a una tienda Shopify.

## Qué incluye

- **Next.js 14 (App Router) + TypeScript**.
- **MDX** para libros y posts (`content/libros` y `content/blog`).
- **Tailwind CSS** + tipografía.
- **SEO**: metadatos, Open Graph, sitemap y robots automáticos.
- **Schema.org Book** (JSON-LD) con precios y formatos → rich results en Google.
- **Ficha de libro de ejemplo** (`/libros/el-ultimo-faro`) con botones de compra a Shopify.
- **Post de blog de ejemplo** (`/blog/como-escribi-el-ultimo-faro`).
- **Newsletter** con formulario y endpoint `/api/subscribe` listo para conectar con MailerLite, ConvertKit, Beehiiv, etc.

## Cómo arrancarlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura

```
app/
  layout.tsx          # Layout global, header y footer
  page.tsx            # Home
  libros/page.tsx     # Listado de libros
  libros/[slug]/page.tsx  # Ficha de libro (con schema Book)
  blog/page.tsx       # Listado de posts
  blog/[slug]/page.tsx    # Post individual
  newsletter/page.tsx # Landing de suscripción
  api/subscribe/route.ts  # Endpoint para el formulario
  sitemap.ts          # Sitemap automático
  robots.ts           # robots.txt
components/
  BookSchema.tsx      # JSON-LD schema.org/Book
  BuyButtons.tsx      # Botones a Shopify
  Newsletter.tsx      # Formulario de suscripción
content/
  libros/*.mdx        # Un archivo por libro
  blog/*.mdx          # Un archivo por post
lib/
  content.ts          # Lectura de MDX con gray-matter
```

## Añadir un libro nuevo

Crea `content/libros/mi-nuevo-libro.mdx`:

```mdx
---
title: "Título"
subtitle: "Subtítulo"
author: "Tu Nombre"
summary: "Resumen corto para SEO."
cover: "https://..."
isbn: "978-..."
pages: 250
genre: "Novela"
publishedAt: "2026-05-01"
priceEbook: 5.99
pricePrint: 16.90
ebookUrl: "https://tu-tienda.myshopify.com/products/..."
printUrl: "https://tu-tienda.myshopify.com/products/..."
---

## Sinopsis
...
```

La URL se genera automáticamente: `/libros/mi-nuevo-libro`.

## Conectar con Shopify

Tres niveles de integración, de menos a más:

1. **Enlaces directos** (lo que ya hace el ejemplo): `ebookUrl` y `printUrl` apuntan a la página del producto en tu tienda. Simple y efectivo.
2. **Shopify Buy Button**: embeber un botón JS con checkout en un modal, sin salir del blog.
3. **Shopify Storefront API**: traer productos, precios y stock dentro de Next.js y mantener el checkout en Shopify. Ideal si quieres una experiencia totalmente personalizada.

## Newsletter

El endpoint `app/api/subscribe/route.ts` trae un ejemplo comentado con MailerLite. Para activarlo:

1. Crea cuenta en MailerLite (o ConvertKit/Beehiiv).
2. Pon la API key en `.env.local` (ver `.env.example`).
3. Descomenta el bloque de fetch en `route.ts`.

## Deploy en Vercel

1. Sube el repo a GitHub.
2. En Vercel, *Import Project* → selecciona el repo.
3. Añade las variables de entorno.
4. Deploy. Cada push a `main` redeploy automático.

## Próximos pasos sugeridos

- Añadir un componente `<Review />` para reseñas estructuradas con schema.org/Review.
- Conectar Shopify Storefront API para mostrar precio y stock en tiempo real.
- Crear un lead magnet real (PDF del primer capítulo) y entregarlo por email automático.
- Integrar analytics (Vercel Analytics o Plausible).
