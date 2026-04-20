import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { Newsletter } from "@/components/Newsletter";
import remarkGfm from "remark-gfm";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt
    }
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto">
      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
          {post.title}
        </h1>
        <p className="text-sm text-ink/50 mt-3">
          {new Date(post.publishedAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </p>
      </header>

      <div className="prose prose-lg prose-stone max-w-none">
        <MDXRemote
          source={post.content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>

      <div className="mt-16">
        <Newsletter variant="inline" />
      </div>
    </article>
  );
}
