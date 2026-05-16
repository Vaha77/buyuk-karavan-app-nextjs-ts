import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json();

  // Rasmni fetch qilish
  const imageRes = await fetch(imageUrl);
  const imageBlob = await imageRes.blob();

  // Remove.bg ga yuborish
  const formData = new FormData();
  formData.append("image_file", imageBlob, "image.png");
  formData.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": process.env.REMOVE_BG_API_KEY!,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }

  // PNG natijasini Supabase ga yuklash
  const resultBlob = await res.blob();
  const buffer = Buffer.from(await resultBlob.arrayBuffer());
  const fileName = `nobg-${Date.now()}.png`;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.storage
    .from("Buyuk-karavan-app-admin")
    .upload(fileName, buffer, { contentType: "image/png" });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage
    .from("Buyuk-karavan-app-admin")
    .getPublicUrl(fileName);

  return Response.json({ url: data.publicUrl });
}