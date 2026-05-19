import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkApiKey } from "@/lib/api-auth";

const VALID_STAGES = [
  "received", "screening", "preselected", "interview_scheduled",
  "interviewed", "approved", "rejected", "talent_pool",
];

export async function GET(req: NextRequest) {
  const denied = checkApiKey(req);
  if (denied) return denied;

  const { searchParams } = req.nextUrl;

  const jobId    = searchParams.get("job_id");
  const stage    = searchParams.get("stage");
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit    = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
  const from     = (page - 1) * limit;
  const to       = from + limit - 1;

  if (stage && !VALID_STAGES.includes(stage)) {
    return NextResponse.json(
      { message: `Etapa inválida. Valores aceitos: ${VALID_STAGES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("applications")
    .select(
      `id, job_id, is_talent_pool, full_name, email, phone_whatsapp,
       city, state, education, experience_years, hotel_experience,
       schedule_availability, start_availability, stage, created_at,
       jobs(title, slug)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (jobId)  query = query.eq("job_id", jobId);
  if (stage)  query = query.eq("stage", stage);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      pages: Math.ceil((count ?? 0) / limit),
    },
  });
}
