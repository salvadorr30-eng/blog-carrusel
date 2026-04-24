import { NextResponse } from "next/server";

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN!;
const GITHUB_REPO   = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";

function yamlStr(v: string): string {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function toYaml(v: any): string {
  if (v === undefined || v === null || v === "") return '""';
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return `[${v.map((x) => yamlStr(String(x))).join(", ")}]`;
  return yamlStr(String(v));
}
function buildBuyLinks(data: any): string {
  // Si vienen buyLinks completos, usarlos directamente
  if (Array.isArray(data.buyLinks) && data.buyLinks.length > 0) {
    const block = data.buyLinks
      .map((l: any) =>
        `  - store: ${yamlStr(l.store)}\n    format: ${yamlStr(l.format)}\n    url: ${yamlStr(l.url)}\n    label: ${yamlStr(l.label)}`
      ).join("\n");
    return `buyLinks:\n${block}`;
  }
  // Fallback: construir desde ebookUrl / printUrl
  const links: any[] = [];
  if (data.ebookUrl) links.push({ store: "own", format: "ebook", url: data.ebookUrl, label: "Ebook — Mi tienda" });
  if (data.printUrl) links.push({ store: data.printUrl.includes("amazon") ? "amazon-es" : "own", format: "paperback", url: data.printUrl, label: "Impreso" });
  if (!links.length) return "";
  const block = links.map((l) =>
    `  - store: ${yamlStr(l.store)}\n    format: ${yamlStr(l.format)}\n    url: ${yamlStr(l.url)}\n    label: ${yamlStr(l.label)}`
  ).join("\n");
  return `buyLinks:\n${block}`;
}

async function ghFetch(filePath: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" }, cache: "no-store" }
  );
  return res;
}

async function commitFile(filePath: string, content: string, message: string, sha: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message, content: Buffer.from(content, "utf-8").toString("base64"), branch: GITHUB_BRANCH, sha }),
    }
  );
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(`GitHub ${res.status}: ${d.message ?? JSON.stringify(d)}`);
  }
}

// GET — devuelve el MDX raw para precargar el formulario
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  if (!GITHUB_TOKEN || !GITHUB_REPO)
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });

  const res = await ghFetch(`content/libros/${params.slug}.mdx`);
  if (!res.ok) return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });

  const data = await res.json();
  const raw = Buffer.from(data.content, "base64").toString("utf-8");
  return NextResponse.json({ ok: true, raw, sha: data.sha });
}

// PUT — actualiza el MDX en GitHub
export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  if (!GITHUB_TOKEN || !GITHUB_REPO)
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });

  const data = await req.json();
  if (!data.title) return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });

  const filePath = `content/libros/${params.slug}.mdx`;
  const checkRes = await ghFetch(filePath);
  if (!checkRes.ok) return NextResponse.json({ error: `Libro "${params.slug}" no encontrado` }, { status: 404 });
  const { sha } = await checkRes.json();

  const fmFields: [string, any][] = [
    ["title", data.title], ["subtitle", data.subtitle], ["author", data.author],
    ["language", data.language], ["translationOf", data.translationOf],
    ["summary", data.summary], ["cover", data.cover], ["genre", data.genre],
    ["ageRange", data.ageRange], ["pages", data.pages], ["isbn", data.isbn],
    ["publishedAt", data.publishedAt], ["metaTitle", data.metaTitle],
    ["metaDescription", data.metaDescription], ["keywords", data.keywords],
    ["previewUrl", data.previewUrl],
  ];

  const fmLines = fmFields
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${toYaml(v)}`).join("\n");

  const buyLinksBlock = buildBuyLinks(data);
  const frontmatter = [fmLines, buyLinksBlock].filter(Boolean).join("\n");

  let body = "";
  if (data.synopsis?.trim()) body += `## Sinopsis\n\n${data.synopsis.trim()}\n\n`;
  if (data.extract?.trim()) body += `## Extracto\n\n> ${data.extract.trim().split("\n").join("\n> ")}\n\n`;
  if (!body) body = `## Sinopsis\n\n${data.summary}\n\n`;

  const mdx = `---\n${frontmatter}\n---\n\n${body}`;

  try {
    await commitFile(filePath, mdx, `fix(libros): actualizar "${data.title}"`, sha);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: params.slug });
}

// DELETE — elimina el libro de GitHub
export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  if (!GITHUB_TOKEN || !GITHUB_REPO)
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });

  const filePath = `content/libros/${params.slug}.mdx`;
  const checkRes = await ghFetch(filePath);
  if (!checkRes.ok) return NextResponse.json({ error: `Libro "${params.slug}" no encontrado` }, { status: 404 });
  const { sha } = await checkRes.json();

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message: `feat(libros): eliminar "${params.slug}"`, branch: GITHUB_BRANCH, sha }),
    }
  );

  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    return NextResponse.json({ error: `GitHub ${res.status}: ${d.message ?? JSON.stringify(d)}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: params.slug });
}
