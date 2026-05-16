import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return Response.json({ error: "Fayl yo'q" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

  const { error } = await supabase.storage
    .from("Buyuk-karavan-app-admin")
    .upload(fileName, buffer, { contentType: file.type });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage
    .from("Buyuk-karavan-app-admin")
    .getPublicUrl(fileName);

  return Response.json({ url: data.publicUrl });
}