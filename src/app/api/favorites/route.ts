import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { placeId, placeName, placeType, lat, lon } = await req.json();
  const fav = await prisma.favorite.upsert({
    where: { userId_placeId: { userId: session.userId, placeId } },
    update: {},
    create: { userId: session.userId, placeId, placeName, placeType, lat, lon },
  });
  return NextResponse.json({ favorite: fav });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { placeId } = await req.json();
  await prisma.favorite.deleteMany({
    where: { userId: session.userId, placeId },
  });
  return NextResponse.json({ ok: true });
}
