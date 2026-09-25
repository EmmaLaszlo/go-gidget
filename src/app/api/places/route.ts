import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchYelp } from "@/lib/yelp";
import { generateBlurb } from "@/lib/ai-blurb";
import { Category, FREE_CLICK_LIMIT, PlaceFilters } from "@/types";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") as Category;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const price = searchParams.getAll("price") as PlaceFilters["price"];
  const cuisine = searchParams.get("cuisine") ?? undefined;
  const openNow = searchParams.get("openNow") === "true";

  if (!category || isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Missing category, lat, or lon" }, { status: 400 });
  }

  // Freemium gate (server-enforced)
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!user.isPremium && user.clickCount >= FREE_CLICK_LIMIT) {
    return NextResponse.json({ error: "upgrade_required", clickCount: user.clickCount }, { status: 402 });
  }

  // Increment click count for free users
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { clickCount: { increment: 1 } },
  });

  // Cache key based on location (rounded to ~1km grid), category, and filters
  const latR = Math.round(lat * 100) / 100;
  const lonR = Math.round(lon * 100) / 100;
  const filterKey = JSON.stringify({ price, cuisine, openNow });
  const cacheKey = `${category}:${latR}:${lonR}:${filterKey}`;

  // Check cache
  const cached = await prisma.placeCache.findUnique({ where: { cacheKey } });
  if (cached) {
    const age = Date.now() - cached.fetchedAt.getTime();
    if (age < CACHE_TTL_MS) {
      await saveHistory(user.id, category, lat, lon, { price, cuisine, openNow });
      return NextResponse.json({ places: cached.data, clickCount: updatedUser.clickCount, fromCache: true });
    }
  }

  // Fetch from Yelp
  const places = await searchYelp({ category, lat, lon, filters: { price, cuisine, openNow } });

  // Generate AI blurbs for top results (limit to avoid cost)
  const enriched = await Promise.all(
    places.slice(0, 10).map(async (place) => {
      try {
        const { blurb, confidence } = await generateBlurb(
          place.name,
          place.yelpCategories,
          place.reviewCount,
          place.rating,
          place.price
        );
        return { ...place, aiBlurb: blurb, aiConfidence: confidence };
      } catch {
        return place;
      }
    })
  );
  // Remaining places without blurbs
  const result = [...enriched, ...places.slice(10)];

  // Attach community Go Gidget ratings
  const placeIds = result.map((p) => p.id);
  const ratings = await prisma.review.groupBy({
    by: ["placeId"],
    where: { placeId: { in: placeIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const ratingMap = Object.fromEntries(ratings.map((r) => [r.placeId, r]));
  const finalResult = result.map((p) => ({
    ...p,
    goGidgetRating: ratingMap[p.id]?._avg.rating ?? null,
    goGidgetCount: ratingMap[p.id]?._count.rating ?? 0,
  }));

  // Upsert cache
  await prisma.placeCache.upsert({
    where: { cacheKey },
    update: { data: finalResult as object, fetchedAt: new Date() },
    create: { cacheKey, data: finalResult as object },
  });

  await saveHistory(user.id, category, lat, lon, { price, cuisine, openNow });

  return NextResponse.json({ places: finalResult, clickCount: updatedUser.clickCount });
}

async function saveHistory(
  userId: number,
  category: string,
  lat: number,
  lon: number,
  filters: object
) {
  await prisma.searchHistory.create({
    data: { userId, category, lat, lon, filters },
  });
}
