import type { MetadataRoute } from 'next';
import { getAllBooks, getAllPosts } from '@/lib/content';

const BASE_URL = 'https://tu-dominio.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/libros', '/blog', '/contacto'].map((p) => ({
    url: `${BASE_URL}${p}`,
    lastModified: new Date()
  }));

  const bookRoutes = getAllBooks().map((b) => ({
    url: `${BASE_URL}/libros/${b.slug}`,
    lastModified: new Date(b.publishedAt)
  }));

  const postRoutes = getAllPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt)
  }));

  return [...staticRoutes, ...bookRoutes, ...postRoutes];
}