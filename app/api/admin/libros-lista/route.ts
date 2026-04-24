import { NextResponse } from "next/server";
import { getAllBooks } from "@/lib/content";

export async function GET() {
  const books = getAllBooks();
  return NextResponse.json({ ok: true, books });
}
