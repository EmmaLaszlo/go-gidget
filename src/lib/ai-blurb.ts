import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface BlurbResult {
  blurb: string;
  confidence: "high" | "moderate" | "low";
}

export async function generateBlurb(
  name: string,
  categories: string[],
  reviewCount: number,
  rating: number,
  priceLevel: string
): Promise<BlurbResult> {
  const confidence: "high" | "moderate" | "low" =
    reviewCount >= 20 ? "high" : reviewCount >= 5 ? "moderate" : "low";

  const prompt = `You are writing a short, cute, 2-sentence vibe description for a pet-friendly location called "${name}".
Type: ${categories.join(", ")}
Price: ${priceLevel}
Yelp rating: ${rating}/5 from ${reviewCount} reviews
Confidence in data: ${confidence} (${reviewCount} reviews)

Write a warm, playful blurb that helps a pet owner decide if they want to bring their dog here.
Focus on the vibe, friendliness, and what makes it special.
${reviewCount < 5 ? "Note that there are very few reviews, so keep it general." : ""}
Keep it to 2 sentences max. Do NOT mention the confidence level directly.`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    messages: [{ role: "user", content: prompt }],
  });

  const blurb = (msg.content[0] as { type: string; text: string }).text.trim();
  return { blurb, confidence };
}
