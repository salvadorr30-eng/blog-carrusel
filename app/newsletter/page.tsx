import { Newsletter } from "@/components/Newsletter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Suscríbete y recibe un capítulo gratis, además de novedades y extractos exclusivos."
};

export default function NewsletterPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 text-center">
      <h1 className="font-serif text-4xl md:text-5xl font-bold">
        Recibe el primer capítulo gratis
      </h1>
      <p className="mt-4 text-ink/70">
        Suscríbete y te envío el primer capítulo de mi último libro, más
        novedades y extractos exclusivos cada mes. Sin spam.
      </p>
      <div className="mt-10">
        <Newsletter variant="inline" />
      </div>
    </div>
  );
}
