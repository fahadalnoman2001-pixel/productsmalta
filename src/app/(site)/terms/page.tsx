import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — YourOffers.eu",
  description: "Terms of Service for YourOffers.eu. Read our site usage terms and affiliate disclosure.",
  alternates: { canonical: "/terms" }
};

export default function Terms() {
  return (
    <div className="container-x py-10 max-w-3xl prose">
      <h1>Terms of Service</h1>
      <p>By using YourOffers.eu you agree to these terms.</p>
      <h2>Use of Site</h2>
      <p>Content is provided for informational purposes. Product availability and prices are subject to change on the retailer's site.</p>
      <h2>Affiliate Links</h2>
      <p>We participate in affiliate programs and may receive commissions from qualifying purchases.</p>
      <h2>Limitation of Liability</h2>
      <p>We are not responsible for products purchased through affiliate links; those are handled by the respective retailers.</p>
    </div>
  );
}
