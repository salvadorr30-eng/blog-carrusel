import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const COVERS_DIR = path.join(process.cwd(), "public", "covers");

/**
 * Sube una imagen de portada y la guarda en /public/covers/.
 * Devuelve la ruta pública: /covers/<slug>-<timestamp>.<ext>
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const slug = (formData.get("slug") as string) || "portada";

    if (!file) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const filename = `${safeSlug}-${Date.now()}.${ext}`;

    await fs.mkdir(COVERS_DIR, { recursive: true });
    await fs.writeFile(path.join(COVERS_DIR, filename), buffer);

    return NextResponse.json({ ok: true, path: `/covers/${filename}` });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error al subir" },
      { status: 500 }
    );
  }
}
