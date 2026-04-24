import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN ?? '';
const GITHUB_REPO   = process.env.GITHUB_REPO ?? '';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? 'main';
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN ?? '';

// Subir a GitHub (para imágenes pequeñas ≤5MB)
async function commitImageToGitHub(
  filePath: string,
  base64Content: string,
  message: string
): Promise<void> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(filePath)}`;

  let sha: string | undefined;
  const checkRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });

  if (checkRes.status === 404) {
    sha = undefined;
  } else if (checkRes.ok) {
    const existing = await checkRes.json();
    sha = existing.sha;
  } else {
    const errData = await checkRes.text();
    throw new Error(`GitHub check error ${checkRes.status}: ${errData}`);
  }

  const body: Record<string, unknown> = {
    message,
    content: base64Content,
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`GitHub API error ${res.status}: ${data.message ?? JSON.stringify(data)}`);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slug = (formData.get('slug') as string) || 'portada';

    if (!file) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const filename = `${safeSlug}-${Date.now()}.${ext}`;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    console.log(`[upload] Archivo: ${file.name}, tamaño: ${fileSizeMB}MB, ext: ${ext}`);

    // PDFs grandes van a Vercel Blob
    if (ext === 'pdf' || file.size > 5 * 1024 * 1024) {
      console.log(`[upload] Usando Vercel Blob para ${filename}`);
      
      if (!BLOB_READ_WRITE_TOKEN) {
        console.error('[upload] BLOB_READ_WRITE_TOKEN no está configurado');
        return NextResponse.json(
          { error: 'BLOB_READ_WRITE_TOKEN no configurado' },
          { status: 500 }
        );
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log(`[upload] Buffer creado, tamaño: ${buffer.length}`);
        
        const blobResult = await put(filename, buffer, {
          access: 'public',
          token: BLOB_READ_WRITE_TOKEN,
        });
        
        console.log(`[upload] Upload a Blob exitoso: ${blobResult.url}`);
        return NextResponse.json({ ok: true, path: blobResult.url });
      } catch (blobErr: any) {
        console.error('[upload] Error en Vercel Blob:', blobErr);
        throw new Error(`Vercel Blob error: ${blobErr.message}`);
      }
    }

    // Imágenes pequeñas van a GitHub
    console.log(`[upload] Usando GitHub para ${filename}`);
    
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta (GITHUB_TOKEN / GITHUB_REPO)' },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Content = buffer.toString('base64');
    const filePath = `public/covers/${filename}`;

    await commitImageToGitHub(
      filePath,
      base64Content,
      `feat(covers): añadir portada ${filename}`
    );

    return NextResponse.json({ ok: true, path: `/covers/${filename}` });
  } catch (err: any) {
    console.error('[POST /api/admin/upload] Error completo:', err);
    return NextResponse.json(
      { error: err.message || 'Error al subir' },
      { status: 500 }
    );
  }
}