import { NextResponse } from "next/server";

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN!;
const GITHUB_REPO   = process.env.GITHUB_REPO!;   // "usuario/nombre-repo"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";

/** Escapa un string para usarlo dentro de comillas dobles en YAML */
function yamlStr(v: string): string {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Serializa un valor a YAML inline */
function toYaml(v: any): string {
  if (v === undefined || v === null || v === "") return '""';
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    return `[${v.map((x) => yamlStr(String(x))).join(", ")}]`;
  }
  return yamlStr(String(v));
}

/** Construye el bloque buyLinks en YAML si se proporcionan URLs */
function buildBuyLinks(data: any): string {
  const links: { store: string; format: string; url: string; label: string }[] = [];

  if (data.ebookUrl) {
    links.push({
      store: "own",
      format: "ebook",
      url: data.ebookUrl.startsWith("http")
        ? data.ebookUrl
        : `https://carruseldeoportunidades.lemonsqueezy.com/checkout/buy/${data.ebookUrl}`,
      label: "Ebook — Mi tienda",
    });
  }
  if (data.printUrl) {
    links.push({
      store: data.printUrl.includes("amazon") ? "amazon-es" : "own",
      format: "paperback",
      url: data.printUrl,
      label: "Impreso",
    });
  }

  if (!links.length) return "";

  const block = links
    .map(
      (l) =>
        `  - store: ${yamlStr(l.store)}\n    format: ${yamlStr(l.format)}\n    url: ${yamlStr(l.url)}\n    label: ${yamlStr(l.label)}`
    )
    .join("\n");

  return `buyLinks:\n${block}`;
}

/** Llama a la GitHub Contents API para crear un fichero */
async function commitFileToGitHub(
  filePath: string,   // ruta dentro del repo, ej: "content/libros/mi-libro.mdx"
  content: string,    // contenido del fichero en texto plano
  message: string
): Promise<void> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
  const encoded = Buffer.from(content, "utf-8").toString("base64");

  // Comprobar si ya existe (necesitaríamos el SHA para actualizar)
  const checkRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (checkRes.ok) {
    // El archivo ya existe → devolver error 409
    throw Object.assign(new Error("already_exists"), { status: 409 });
  }

  if (checkRes.status !== 404) {
    throw new Error(`GitHub API error al comprobar existencia: ${checkRes.status}`);
  }

  // Crear el fichero
  const createRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: encoded,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.json().catch(() => ({}));
    throw new Error(
      `GitHub API error ${createRes.status}: ${body.message ?? JSON.stringify(body)}`
    );
  }
}

export async function POST(req: Request) {
  try {
    // Validación de variables de entorno
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta (GITHUB_TOKEN / GITHUB_REPO)" },
        { status: 500 }
      );
    }

    const data = await req.json();

    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: "Título y slug son obligatorios" },
        { status: 400 }
      );
    }

    // ── Construir frontmatter ────────────────────────────────────────────────
    const fmFields: [string, any][] = [
      ["title",           data.title],
      ["subtitle",        data.subtitle],
      ["author",          data.author],
      ["language",        data.language],
      ["translationOf",   data.translationOf],
      ["summary",         data.summary],
      ["cover",           data.cover],        // URL pública, nunca ruta local
      ["genre",           data.genre],
      ["ageRange",        data.ageRange],
      ["pages",           data.pages],
      ["isbn",            data.isbn],
      ["publishedAt",     data.publishedAt],
      ["metaTitle",       data.metaTitle],
      ["metaDescription", data.metaDescription],
      ["keywords",        data.keywords],
    ];

    const fmLines = fmFields
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k}: ${toYaml(v)}`)
      .join("\n");

    const buyLinksBlock = buildBuyLinks(data);

    const frontmatter = [fmLines, buyLinksBlock].filter(Boolean).join("\n");

    // ── Construir cuerpo MDX ─────────────────────────────────────────────────
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

    const mdx = `---\n${frontmatter}\n---\n\n${body}`;

    // ── Commit a GitHub ──────────────────────────────────────────────────────
    const filePath = `content/libros/${data.slug}.mdx`;

    try {
      await commitFileToGitHub(
        filePath,
        mdx,
        `feat(libros): añadir "${data.title}"`
      );
    } catch (err: any) {
      if (err.message === "already_exists") {
        return NextResponse.json(
          { error: `Ya existe un libro con slug "${data.slug}"` },
          { status: 409 }
        );
      }
      throw err;
    }

    return NextResponse.json({ ok: true, slug: data.slug });
  } catch (err: any) {
    console.error("[POST /api/admin/libros]", err);
    return NextResponse.json(
      { error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
