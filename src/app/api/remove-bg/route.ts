import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    const imageRes = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // Pixian ga yuborishdan oldin compress
    const compressed = await sharp(imageBuffer)
      .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const imageBlob = new Blob([compressed], { type: "image/jpeg" });

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
      console.log("Pixian xato:", err);
      return Response.json({ error: err }, { status: 500 });
    }

    const resultBlob = await res.blob();
    const buffer = Buffer.from(await resultBlob.arrayBuffer());
    const fileName = `nobg-${Date.now()}.png`;

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

  } catch (e: any) {
    console.log("CATCH:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}