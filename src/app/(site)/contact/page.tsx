import { prisma } from "@/lib/db";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — YourOffers.eu",
  description: "Get in touch with the YourOffers.eu editorial and partnerships team.",
  alternates: { canonical: "/contact" }
};

export default async function ContactPage() {
  const s = Object.fromEntries((await prisma.setting.findMany()).map(x => [x.key, x.value]));
  return (
    <div className="container-x py-10 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Contact Us</h1>
      <p className="text-ink-500 mb-6">Have a question or partnership request? Reach out below.</p>
      <div className="card p-6 space-y-3">
        {s.contact_email && <div className="flex items-center gap-2 text-ink-700"><Mail size={16} className="text-brand-500"/> {s.contact_email}</div>}
        {s.contact_phone && <div className="flex items-center gap-2 text-ink-700"><Phone size={16} className="text-brand-500"/> {s.contact_phone}</div>}
      </div>
      <ContactForm />
    </div>
  );
}
