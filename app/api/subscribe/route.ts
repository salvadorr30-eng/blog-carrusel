import { NextResponse } from "next/server";

/**
 * Suscribe un email al grupo de MailerLite configurado.
 * Requiere en .env.local:
 *   MAILERLITE_API_KEY=...
 *   MAILERLITE_GROUP_ID=...
 */
export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID;

    if (!apiKey || !groupId) {
      console.error(
        "Faltan MAILERLITE_API_KEY o MAILERLITE_GROUP_ID en .env.local"
      );
      return NextResponse.json(
        { error: "El servidor no está configurado" },
        { status: 500 }
      );
    }

    // Doc: https://developers.mailerlite.com/docs/subscribers.html#create-upsert-subscriber
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        email,
        fields: name ? { name } : undefined,
        groups: [groupId],
        status: "active" // cambia a "unconfirmed" si quieres double opt-in
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("MailerLite error:", res.status, detail);
      return NextResponse.json(
        { error: "No se pudo completar la suscripción" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
