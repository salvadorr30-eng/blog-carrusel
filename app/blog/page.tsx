import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Reseñas, extractos y detrás del libro."
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div>
      <h1 className="font-serif text-4xl font-bold mb-10">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-ink/10 pb-8">
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="font-serif text-2xl font-bold group-hover:text-accent">
                {post.title}
              </h2>
              <p className="text-sm text-ink/50 mt-1">
                {new Date(post.publishedAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
              <p className="mt-3 text-ink/80">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
