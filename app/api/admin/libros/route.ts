import { NextResponse } from 'next/server';

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN ?? '';
const GITHUB_REPO   = process.env.GITHUB_REPO ?? '';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? 'main';

function yamlStr(v: string): string {
  return `\"${v.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"')}\"`;
}

function toYaml(v: any): string {
  if (v === undefined || v === null || v === '') return '\"\"';
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return `[${v.map((x) => yamlStr(String(x))).join(', ')}]`;
  return yamlStr(String(v));
}

async function ghFetch(filePath: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, cache: 'no-store' }
  );
  return res;
}

async function commitFile(filePath: string, content: string, message: string, sha?: string) {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(`GitHub ${res.status}: ${d.message ?? JSON.stringify(d)}`);
  }
}

function buildBuyLinks(data: any): string {
  if (Array.isArray(data.buyLinks) && data.buyLinks.length > 0) {
    const block = data.buyLinks
      .map((l: any) =>
        `  - store: ${yamlStr(l.store)}\n    format: ${yamlStr(l.format)}\n    url: ${yamlStr(l.url)}\n    label: ${yamlStr(l.label)}`
      ).join('\n');
    return `buyLinks:\n${block}`;
  }
  const links: any[] = [];
  if (data.ebookUrl) links.push({ store: 'own', format: 'ebook', url: data.ebookUrl, label: 'Ebook — Mi tienda' });
  if (data.printUrl) links.push({ store: data.printUrl.includes('amazon') ? 'amazon-es' : 'own', format: 'pdf', url: data.printUrl, label: 'Comprar PDF ⭐' });
  if (!links.length) return '';
  const block = links.map((l) =>
    `  - store: ${yamlStr(l.store)}\n    format: ${yamlStr(l.format)}\n    url: ${yamlStr(l.url)}\n    label: ${yamlStr(l.label)}`
  ).join('\n');
  return `buyLinks:\n${block}`;
}

// POST — crear nuevo libro
export async function POST(req: Request) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
  }

  try {
    const data = await req.json();
    if (!data.title) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });

    const slug = data.slug || data.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '-').replace(/\/+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

    const filePath = `content/libros/${slug}.mdx`;

    const fmFields: [string, any][] = [
      ['title', data.title], ['subtitle', data.subtitle], ['author', data.author],
      ['language', data.language], ['translationOf', data.translationOf],
      ['summary', data.summary], ['cover', data.cover], ['genre', data.genre],
      ['ageRange', data.ageRange], ['pages', data.pages], ['isbn', data.isbn],
      ['publishedAt', data.publishedAt], ['metaTitle', data.metaTitle],
      ['metaDescription', data.metaDescription], ['keywords', data.keywords],
      ['priceEbook', data.priceEbook], ['pricePrint', data.pricePrint],
      ['previewUrl', data.previewUrl],
    ];

    const fmLines = fmFields
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${toYaml(v)}`).join('\n');

    const buyLinksBlock = buildBuyLinks(data);
    const frontmatter = [fmLines, buyLinksBlock].filter(Boolean).join('\n');

    let body = '';
    if (data.synopsis?.trim()) body += `## Sinopsis\n\n${data.synopsis.trim()}\n\n`;
    if (data.extract?.trim()) body += `## Extracto\n\n> ${data.extract.trim().split('\n').join('\n> ')}\n\n`;
    if (!body) body = `## Sinopsis\n\n${data.summary || ''}\n\n`;

    const mdx = `---\n${frontmatter}\n---\n\n${body}`;

    await commitFile(filePath, mdx, `feat(libros): añadir libro ${data.title}`);

    return NextResponse.json({ ok: true, slug });
  } catch (err: any) {
    console.error('[POST /api/admin/libros] Error:', err);
    return NextResponse.json({ error: err.message || 'Error al guardar' }, { status: 500 });
  }
}