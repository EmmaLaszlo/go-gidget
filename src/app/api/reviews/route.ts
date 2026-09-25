import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { placeId, rating, body } = await req.json();
  if (!placeId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { placeId_userId: { placeId, userId: session.userId } } as never,
    update: { rating, body },
    create: { placeId, userId: session.userId, rating, body },
  });

  return NextResponse.json({ review });
}

// Fallback upsert using raw (Prisma 7 doesn't support compound unique in upsert where easily)
