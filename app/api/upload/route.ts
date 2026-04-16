import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ACCEPTED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Arquivo ausente" }, { status: 400 });
    }
    if (!ACCEPTED.includes(file.type)) {
      return NextResponse.json({ message: "Formato inválido" }, { status: 400 });
    }
    if (file.size > MAX) {
      return NextResponse.json({ message: "Arquivo maior que 10MB" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const safeName = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 80);
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;

    const arrayBuf = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from("resumes")
      .upload(path, arrayBuf, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: path, name: file.name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
