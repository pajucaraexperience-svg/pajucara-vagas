import { NextRequest, NextResponse } from "next/server";

export function checkApiKey(req: NextRequest): NextResponse | null {
  const key = req.headers.get("x-api-key");
  if (!key || key !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  return null;
}
