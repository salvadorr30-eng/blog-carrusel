import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { getAllLegalPages, getLegalPageBySlug } from "@/lib/content";
import remarkGfm from "remark-gfm";

export function generateStaticParams() {
  return getAllLegalPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = getLegalPageBySlug(params.slug);
  if (!page) return {};
  return {
    title: `${page.title} — Carrusel de Oportunidades`,
    description: page.description,
    robots: { index: true, follow: true }
  };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const page = getLegalPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8 border-b border-ink/10 pb-6">
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
          {page.title}
        </h1>
        {page.updatedAt && (
          <p className="text-sm text-ink/60 mt-3">
            Última actualización: {page.updatedAt}
          </p>
        )}
      </header>

      <div className="prose prose-stone prose-lg max-w-none">
        <MDXRemote
          source={page.content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </article>
  );
}
