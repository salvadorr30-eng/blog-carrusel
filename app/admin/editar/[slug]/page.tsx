"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Parsea el frontmatter YAML básico del MDX en un objeto plano
function parseFrontmatter(raw: string): Record<string, any> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, any> = {};
  const lines = match[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // buyLinks: bloque multilinea — lo saltamos, lo preservamos tal cual
    if (line.startsWith("buyLinks:")) {
      const block: string[] = [line];
      i++;
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i].startsWith("- "))) {
        block.push(lines[i]);
        i++;
      }
      // Parseamos los items básicos
      const items: any[] = [];
      let current: any = null;
      for (const bl of block.slice(1)) {
        const m = bl.match(/^\s+-\s+(\w+):\s*"(.*)"/);
        const kv = bl.match(/^\s+(\w+):\s*"(.*)"/);
        if (m) { if (current) items.push(current); current = { [m[1]]: m[2] }; }
        else if (kv && current) current[kv[1]] = kv[2];
      }
      if (current) items.push(current);
      fm.buyLinks = items;
      continue;
    }
    // Clave: valor normal
    const kv = line.match(/^(\w+):\s*(.*)/);
    if (kv) {
      const key = kv[1];
      let val: any = kv[2].trim();
      // Quitar comillas dobles
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      // Quitar comillas simples
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      // Array inline [a, b]
      else if (val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map((s: string) => s.trim().replace(/^"|"$/g, ""));
      }
      fm[key] = val;
    }
    i++;
  }
  return fm;
}

function parseSynopsis(raw: string): string {
  const body = raw.replace(/^---[\s\S]*?---\n/, "");
  const m = body.match(/## Sinopsis\n\n([\s\S]*?)(?=\n##|$)/);
  return m ? m[1].trim() : "";
}

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

export default function EditarLibroPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", subtitle: "", author: "", language: "", translationOf: "",
    isbn: "", pages: "", genre: "", ageRange: "", publishedAt: "",
    coverUrl: "", summary: "", synopsis: "", extract: "",
    metaTitle: "", metaDescription: "", keywords: "",
    ebookUrl: "", printUrl: "", priceEbook: "", pricePrint: "",
  });

  useEffect(() => {
    fetch(`/api/admin/libros/${slug}`)
      .then((r) => r.json())
      .then(({ raw }) => {
        if (!raw) return;
        const fm = parseFrontmatter(raw);
        const synopsis = parseSynopsis(raw);
        setForm({
          title:           fm.title || "",
          subtitle:        fm.subtitle || "",
          author:          fm.author || "",
          language:        fm.language || "",
          translationOf:   fm.translationOf || "",
          isbn:            fm.isbn || "",
          pages:           fm.pages ? String(fm.pages) : "",
          genre:           fm.genre || "",
          ageRange:        fm.ageRange || "",
          publishedAt:     fm.publishedAt || "",
          coverUrl:        fm.cover || "",
          summary:         fm.summary || "",
          synopsis,
          extract:         "",
          metaTitle:       fm.metaTitle || "",
          metaDescription: fm.metaDescription || "",
          keywords:        Array.isArray(fm.keywords) ? fm.keywords.join(", ") : (fm.keywords || ""),
          ebookUrl:        fm.ebookUrl || "",
          printUrl:        fm.printUrl || "",
          priceEbook:      fm.priceEbook ? String(fm.priceEbook) : "",
          pricePrint:      fm.pricePrint ? String(fm.pricePrint) : "",
        });
      })
      .catch(() => setError("No se pudo cargar el libro"))
      .finally(() => setLoading(false));
  }, [slug]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let coverPath = form.coverUrl;

      if (coverFile) {
        const fd = new FormData();
        fd.append("file", coverFile);
        fd.append("slug", slug);
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!upRes.ok) throw new Error("Fallo al subir la portada");
        const { path } = await upRes.json();
        coverPath = path;
      }

      const payload = {
        ...form,
        cover: coverPath,
        pages: form.pages ? Number(form.pages) : undefined,
        priceEbook: form.priceEbook ? Number(form.priceEbook) : undefined,
        pricePrint: form.pricePrint ? Number(form.pricePrint) : undefined,
        keywords: form.keywords ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
      };

      const res = await fetch(`/api/admin/libros/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error al guardar");
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-ink/50">Cargando libro…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-serif text-4xl font-bold mb-2">Editar libro</h1>
      <p className="text-ink/60 mb-2 font-mono text-sm">/libros/{slug}</p>
      <p className="text-ink/60 mb-10">Los cambios se guardarán directamente en el repositorio.</p>

      <form onSubmit={handleSubmit} className="space-y-10">
        <Section title="Datos básicos">
          <Field label="Título *" required>
            <input type="text" required value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Subtítulo">
            <input type="text" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Autor *" required>
            <input type="text" required value={form.author} onChange={(e) => update("author", e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Género">
              <input type="text" value={form.genre} onChange={(e) => update("genre", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Páginas">
              <input type="number" value={form.pages} onChange={(e) => update("pages", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rango de edad" hint='Ej: "4-10"'>
              <input type="text" value={form.ageRange} onChange={(e) => update("ageRange", e.target.value)} className={inputCls} placeholder="4-10" />
            </Field>
            <Field label="Idioma">
              <select value={form.language} onChange={(e) => update("language", e.target.value)} className={inputCls}>
                <option value="">— sin especificar —</option>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISBN">
              <input type="text" value={form.isbn} onChange={(e) => update("isbn", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Fecha de publicación">
              <input type="date" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Es traducción de (slug)" hint="Slug del libro original si este es una traducción">
            <input type="text" value={form.translationOf} onChange={(e) => update("translationOf", e.target.value)} className={inputCls} placeholder="la-gran-familia-de-los-suricatos" />
          </Field>
        </Section>

        <Section title="Portada">
          <Field label="Portada actual">
            {form.coverUrl && (
              <img src={coverPreview || form.coverUrl} alt="Portada actual" className="w-24 aspect-[2/3] object-cover rounded shadow mb-3" />
            )}
          </Field>
          <Field label="Subir nueva imagen" hint="JPG o PNG, proporción 2:3">
            <input type="file" accept="image/*" onChange={handleCoverFile} className="block text-sm" />
          </Field>
          <div className="text-center text-sm text-ink/40">— o cambiar URL —</div>
          <Field label="URL de imagen">
            <input type="url" placeholder="https://..." value={form.coverUrl} onChange={(e) => update("coverUrl", e.target.value)} className={inputCls} />
          </Field>
        </Section>

        <Section title="Contenido">
          <Field label="Resumen corto *" hint="2-3 frases. Aparece en listados." required>
            <textarea required rows={3} value={form.summary} onChange={(e) => update("summary", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Sinopsis larga" hint="Texto principal de la ficha. Acepta Markdown.">
            <textarea rows={8} value={form.synopsis} onChange={(e) => update("synopsis", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Extracto (opcional)">
            <textarea rows={4} value={form.extract} onChange={(e) => update("extract", e.target.value)} className={inputCls} />
          </Field>
        </Section>

        <Section title="SEO">
          <Field label="Meta title">
            <input type="text" maxLength={60} value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className={inputCls} />
            <p className="text-xs text-ink/40 mt-1">{form.metaTitle.length}/60</p>
          </Field>
          <Field label="Meta description">
            <textarea rows={2} maxLength={160} value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className={inputCls} />
            <p className="text-xs text-ink/40 mt-1">{form.metaDescription.length}/160</p>
          </Field>
          <Field label="Palabras clave" hint="Separadas por comas">
            <input type="text" value={form.keywords} onChange={(e) => update("keywords", e.target.value)} className={inputCls} />
          </Field>
        </Section>

        <Section title="Enlaces a la tienda">
          <Field label="URL ebook">
            <input type="text" value={form.ebookUrl} onChange={(e) => update("ebookUrl", e.target.value)} className={inputCls} placeholder="https://carruseldeoportunidades.lemonsqueezy.com/..." />
          </Field>
          <Field label="URL impreso">
            <input type="text" value={form.printUrl} onChange={(e) => update("printUrl", e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio ebook (€)">
              <input type="number" step="0.01" value={form.priceEbook} onChange={(e) => update("priceEbook", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Precio impreso (€)">
              <input type="number" step="0.01" value={form.pricePrint} onChange={(e) => update("pricePrint", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            ✅ Libro actualizado. Redirigiendo al panel…
          </div>
        )}

        <div className="flex gap-3 sticky bottom-4 bg-paper p-4 rounded-xl shadow-lg border border-ink/10">
          <button type="submit" disabled={submitting}
            className="bg-accent text-white px-8 py-3 rounded-full font-medium hover:opacity-90 disabled:opacity-50">
            {submitting ? "Guardando…" : "Guardar cambios"}
          </button>
          <button type="button" onClick={() => router.push("/admin")}
            className="px-6 py-3 border border-ink/20 rounded-full hover:bg-ink/5">
            Cancelar
          </button>
          <a href={`/libros/${slug}`} target="_blank"
            className="px-6 py-3 border border-ink/20 rounded-full hover:bg-ink/5 text-sm flex items-center">
            Ver libro ↗
          </a>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-ink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink/10 rounded-xl p-6 space-y-4 bg-white/50">
      <header>
        <h2 className="font-serif text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-ink/60 mt-1">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint && <p className="text-xs text-ink/50 mt-1">{hint}</p>}
    </label>
  );
}
