import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { imageUrl } = await req.json();

  const response = await client.messages.create({
model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url: imageUrl },
          },
          {
            type: "text",
            text: `Bu mahsulot rasmini tahlil qil va faqat JSON qaytар (boshqa narsa yozma):
{
  "name": "mahsulot nomi",
  "category": "Elektronika/Kiyim/Oziq-ovqat/Uy jihozlari/Sport/Boshqa",
  "shortDesc": "qisqa tavsif o'zbek tilida 1-2 jumla",
  "fullDesc": "to'liq tavsif o'zbek tilida 3-5 jumla",
  "priceUsd": 99,
  "rating": 4.5
}`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return Response.json(JSON.parse(clean));
  } catch {
    return Response.json({ error: "AI javob xato" }, { status: 500 });
  }
}