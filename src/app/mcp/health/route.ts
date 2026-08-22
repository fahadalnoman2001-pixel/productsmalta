import { NextResponse } from "next/server";
import { tools } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "youroffers-mcp",
    tools: tools.length
  });
}
