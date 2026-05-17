import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    const imageRes = await fetch(imageUrl);
    const imageArrayBuffer = await imageRes.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    const compressed = await sharp(imageBuffer)
      .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const uint8 = new Uint8Array(compressed.buffer, compressed.byteOffset, compressed.byteLength);
    const imageBlob = new Blob([uint8], { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("image", imageBlob, "image.jpg");
    formData.append("bg.color", "ffffff");

    const res = await fetch("https://api.pixian.ai/api/v2/remove-background", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(
          `${process.env.PIXIAN_API_ID}:${process.env.PIXIAN_API_SECRET}`
        ).toString("base64"),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: 500 });
    }

    const resultArrayBuffer = await res.arrayBuffer();
    const resultUint8 = new Uint8Array(resultArrayBuffer);
    const fileName = `nobg-${Date.now()}.png`;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.storage
      .from("Buyuk-karavan-app-admin")
      .upload(fileName, resultUint8, { contentType: "image/png" });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const { data } = supabase.storage
      .from("Buyuk-karavan-app-admin")
      .getPublicUrl(fileName);

    return Response.json({ url: data.publicUrl });

  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}