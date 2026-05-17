import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    const imageRes = await fetch(imageUrl);
    const imageArrayBuffer = await imageRes.arrayBuffer();

    // sharp bilan compress
    const compressed = await sharp(Buffer.from(imageArrayBuffer))
      .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // FormData uchun Blob
    const formData = new FormData();
    formData.append("image", new Blob([compressed], { type: "image/jpeg" }), "image.jpg");
    formData.append("bg.color", "ffffff");

    const res = await fetch("https://api.pixian.ai/api/v2/remove-background", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(
          `${process.env.PIXIAN_API_ID}:${process.env.PIXIAN_API_SECRET}`
        ),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: 500 });
    }

    const resultBuffer = await res.arrayBuffer();
    const fileName = `nobg-${Date.now()}.png`;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.storage
      .from("Buyuk-karavan-app-admin")
      .upload(fileName, new Blob([resultBuffer], { type: "image/png" }), { 
        contentType: "image/png" 
      });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const { data } = supabase.storage
      .from("Buyuk-karavan-app-admin")
      .getPublicUrl(fileName);

    return Response.json({ url: data.publicUrl });

  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}