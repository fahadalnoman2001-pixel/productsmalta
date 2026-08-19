import { NextRequest, NextResponse } from "next/server";

// Receives contact form submissions. For now it validates and logs the message.
// To deliver to your inbox, connect an email provider (Resend/SendGrid/SMTP)
// or store submissions in the database — hook that in here.
export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  console.log(`[contact] ${name} <${email}>: ${message}`);
  return NextResponse.json({ ok: true });
}
