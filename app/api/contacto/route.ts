import { NextResponse } from "next/server";

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY!;
const CONTACT_EMAIL = "ramirezhoyossalvador@gmail.com";

export async function POST(req: Request) {
  try {
    const { name, email, message, token, _trap } = await req.json();

    // Honeypot: si el campo oculto viene relleno, es un bot
    if (_trap) {
      return NextResponse.json({ ok: true }); // respuesta falsa
    }

    // Validar campos
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar reCAPTCHA
    if (!token) {
      return NextResponse.json({ error: "Token reCAPTCHA requerido" }, { status: 400 });
    }

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${SECRET_KEY}&response=${token}`,
    });
    const verifyData = await verifyRes.json();

    // Score < 0.5 = probable bot (0.0 bot, 1.0 humano)
    if (!verifyData.success || verifyData.score < 0.5) {
      return NextResponse.json({ error: "Verificación anti-spam fallida" }, { status: 403 });
    }

    // Enviar email vía Resend (o fallback a mailto log)
    // Si tienes RESEND_API_KEY configurada, usamos Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Carrusel de Oportunidades <noreply@send.carruseldeoportunidades.es>",
          to: CONTACT_EMAIL,
          reply_to: email,
          subject: `Contacto web: ${name}`,
          text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
          html: `<p><strong>Nombre:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><hr/><p>${message.replace(/\n/g, "<br>")}</p>`,
        }),
      });
      if (!emailRes.ok) {
        const err = await emailRes.json().catch(() => ({}));
        console.error("[contacto] Resend error:", err);
        return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 });
      }
    } else {
      // Sin Resend: solo log (útil para desarrollo)
      console.log(`[contacto] Mensaje de ${name} <${email}>: ${message}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[contacto] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
