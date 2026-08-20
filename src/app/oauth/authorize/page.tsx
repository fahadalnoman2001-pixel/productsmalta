import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveOrAutoRegisterClient } from "@/lib/oauthTrustedClients";
import { redirect } from "next/navigation";

export default async function OAuthAuthorizePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const responseType = String(searchParams.response_type || "");
  const clientId = String(searchParams.client_id || "");
  const redirectUri = String(searchParams.redirect_uri || "");
  const codeChallenge = String(searchParams.code_challenge || "");
  const codeChallengeMethod = String(searchParams.code_challenge_method || "S256");
  const state = String(searchParams.state || "");
  const scope = String(searchParams.scope || "mcp");

  if (responseType !== "code" || !clientId || !redirectUri || !codeChallenge) {
    return <ErrorPage title="Invalid request" detail="Missing or unsupported OAuth parameters." />;
  }
  if (codeChallengeMethod !== "S256") {
    return <ErrorPage title="Unsupported PKCE method" detail="Only S256 code_challenge_method is supported." />;
  }

  const client = await resolveOrAutoRegisterClient(clientId, redirectUri);
  if (!client) {
    return (
      <ErrorPage
        title="Unknown client"
        detail="This client isn't registered and its redirect_uri isn't a recognized Claude callback. Try reconnecting from Claude."
      />
    );
  }

  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "super_admin") {
    const here = `/oauth/authorize?${new URLSearchParams(searchParams as Record<string, string>).toString()}`;
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(here)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5">
        <div className="text-center">
          <img src="/logo.png" alt="YourOffer.eu" className="h-10 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Connect {client.clientName || "Claude"} to YourOffer.eu</h1>
          <p className="text-sm text-slate-500 mt-2">
            Signed in as <span className="font-medium">{session!.user!.email}</span>. This will grant full read/write
            access to products, blogs, categories, collections, banners and settings via the MCP server. Tokens issued
            this way never expire until revoked from <span className="font-mono text-xs">/admin/mcp</span>.
          </p>
        </div>
        <form method="POST" action="/api/oauth/approve" className="space-y-3">
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="hidden" name="code_challenge" value={codeChallenge} />
          <input type="hidden" name="code_challenge_method" value={codeChallengeMethod} />
          <input type="hidden" name="state" value={state} />
          <input type="hidden" name="scope" value={scope} />
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg text-sm transition"
          >
            Authorize
          </button>
          <a href="/admin" className="block text-center text-xs text-slate-400 hover:text-slate-600">
            Cancel
          </a>
        </form>
      </div>
    </div>
  );
}

function ErrorPage({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-600">{title}</h1>
        <p className="text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}
