import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import sharp from "sharp";

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

  // Rasmni compress qilish
  const compressed = await sharp(buffer)
    .resize(1200, 1200, { 
      fit: "inside",        // proporsiyani saqlaydi
      withoutEnlargement: true // kichik rasmni kattalashtirmaydi
    })
    .webp({ quality: 82 }) // WebP format — JPEG/PNG dan 2-3x kichik
    .toBuffer();

  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}.webp`;

  const { error } = await supabase.storage
    .from("Buyuk-karavan-app-admin")
    .upload(fileName, compressed, { contentType: "image/webp" });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage
    .from("Buyuk-karavan-app-admin")
    .getPublicUrl(fileName);

  return Response.json({ url: data.publicUrl });
}