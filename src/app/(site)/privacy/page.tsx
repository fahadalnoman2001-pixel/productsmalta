import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — YourOffers.eu",
  description: "Privacy Policy for YourOffers.eu. Learn how we handle your data and our cookie policy.",
  alternates: { canonical: "/privacy" }
};

export default function Privacy() {
  return (
    <div className="container-x py-10 max-w-3xl prose">
      <h1>Privacy Policy</h1>
      <p>This Privacy Policy describes how YourOffers.eu collects, uses and protects your information.</p>
      <h2>Information We Collect</h2>
      <p>We collect anonymous analytics data (via Google Analytics and Meta Pixel) and click data on affiliate links to improve our recommendations across Europe.</p>
      <h2>Cookies</h2>
      <p>We use cookies for analytics, remarketing and to remember your preferences.</p>
      <h2>Affiliate Disclosure</h2>
      <p>Some links on this site are affiliate links. We may earn a commission at no extra cost to you when you buy through these links.</p>
      <h2>Contact</h2>
      <p>Questions about privacy? Contact us via the Contact page.</p>
    </div>
  );
}
