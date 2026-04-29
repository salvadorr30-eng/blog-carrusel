import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BOOKS_DIR = path.join(process.cwd(), "content", "libros");
const POSTS_DIR = path.join(process.cwd(), "content", "blog");
const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

export type BuyLink = {
  label?: string;
  store: "amazon-es" | "amazon-com" | "amazon-uk" | "kobo" | "own" | "other";
  format: "ebook" | "paperback" | "hardcover" | "kindle" | "epub" | "pdf";
  url: string;
  price?: number;
  currency?: string;
};

export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  summary: string;
  cover?: string;
  isbn?: string;
  pages: number;
  genre: string;
  ageRange?: string; // ej. "6-9"
  language?: "es" | "en" | "pt";
  translationOf?: string; // slug de la versión en otro idioma
  publishedAt: string;
  // Nuevo sistema: lista de enlaces de compra
  buyLinks?: BuyLink[];
  // Compatibilidad con el modelo antiguo
  priceEbook?: number;
  pricePrint?: number;
  ebookUrl?: string;
  printUrl?: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  // Preview
  previewUrl?: string;
  content: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  content: string;
};

export type LegalPage = {
  slug: string;
  title: string;
  updatedAt: string;
  description?: string;
  content: string;
};

function readMdxDir<T>(
  dir: string,
  mapper: (slug: string, data: any, content: string) => T
): T[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      return mapper(slug, data, content);
    });
}

export function getAllBooks(): Book[] {
  return readMdxDir<Book>(BOOKS_DIR, (slug, data, content) => ({
    slug,
    title: data.title,
    subtitle: data.subtitle,
    author: data.author,
    summary: data.summary,
    cover: data.cover,
    isbn: data.isbn,
    pages: data.pages,
    genre: data.genre,
    ageRange: data.ageRange,
    language: data.language,
    translationOf: data.translationOf,
    publishedAt: data.publishedAt,
    buyLinks: data.buyLinks,
    priceEbook: data.priceEbook,
    pricePrint: data.pricePrint,
    ebookUrl: data.ebookUrl,
    printUrl: data.printUrl,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    keywords: data.keywords,
    previewUrl: data.previewUrl,
    content
  })).sort(
    (a, b) =>
      new Date(b.publishedAt || 0).getTime() -
      new Date(a.publishedAt || 0).getTime()
  );
}

export function getBookBySlug(slug: string): Book | null {
  return getAllBooks().find((b) => b.slug === slug) ?? null;
}

/**
 * Devuelve todas las traducciones/versiones del mismo libro (excluyéndose a sí mismo).
 * Considera como "mismo libro" los que comparten el mismo "rootSlug":
 *  - un libro raíz es aquel sin translationOf (o su propio slug)
 *  - sus traducciones apuntan a él vía translationOf
 */
export function getTranslations(book: Book): Book[] {
  const rootSlug = book.translationOf || book.slug;
  return getAllBooks().filter(
    (b) =>
      b.slug !== book.slug &&
      (b.slug === rootSlug || b.translationOf === rootSlug)
  );
}

export function getAllPosts(): Post[] {
  return readMdxDir<Post>(POSTS_DIR, (slug, data, content) => ({
    slug,
    title: data.title,
    excerpt: data.excerpt,
    publishedAt: data.publishedAt,
    content
  })).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

export function getAllLegalPages(): LegalPage[] {
  return readMdxDir<LegalPage>(LEGAL_DIR, (slug, data, content) => ({
    slug,
    title: data.title,
    updatedAt: data.updatedAt,
    description: data.description,
    content
  }));
}

export function getLegalPageBySlug(slug: string): LegalPage | null {
  return getAllLegalPages().find((p) => p.slug === slug) ?? null;
}
