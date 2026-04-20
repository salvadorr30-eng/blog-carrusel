import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const BOOKS_DIR = path.join(process.cwd(), "content", "libros");

/**
 * Convierte un valor a YAML básico (string, number, array de strings, fecha).
 */
function toYamlValue(v: any): string {
  if (v === undefined || v === null || v === "") return '""';
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    return `[${v.map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(", ")}]`;
  }
  // string
  return `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: "Título y slug son obligatorios" },
        { status: 400 }
      );
    }

    await fs.mkdir(BOOKS_DIR, { recursive: true });
    const filePath = path.join(BOOKS_DIR, `${data.slug}.mdx`);

    // Evitar sobrescribir
    try {
      await fs.access(filePath);
      return NextResponse.json(
        { error: `Ya existe un libro con slug "${data.slug}"` },
        { status: 409 }
      );
    } catch {
      // no existe, perfecto
    }

    // Construir frontmatter
    const fm: Record<string, any> = {
      title: data.title,
      subtitle: data.subtitle,
      author: data.author,
      summary: data.summary,
      cover: data.cover,
      isbn: data.isbn,
      pages: data.pages,
      genre: data.genre,
      publishedAt: data.publishedAt,
      priceEbook: data.priceEbook,
      pricePrint: data.pricePrint,
      ebookUrl: data.ebookUrl,
      printUrl: data.printUrl,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      keywords: data.keywords
    };

    const fmLines = Object.entries(fm)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k}: ${toYamlValue(v)}`)
      .join("\n");

    // Construir cuerpo MDX
    let body = "";
    if (data.synopsis?.trim()) {
      body += `## Sinopsis\n\n${data.synopsis.trim()}\n\n`;
    }
    if (data.extract?.trim()) {
      body += `## Extracto\n\n> ${data.extract.trim().split("\n").join("\n> ")}\n\n`;
    }
    if (!body) {
      body = `## Sinopsis\n\n${data.summary}\n\n`;
    }

    const mdx = `---\n${fmLines}\n---\n\n${body}`;

    await fs.writeFile(filePath, mdx, "utf-8");

    return NextResponse.json({ ok: true, slug: data.slug });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
