import { Category, Place, PlaceFilters } from "@/types";

const YELP_BASE = "https://api.yelp.com/v3";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const CATEGORY_MAP: Record<Category, string> = {
  cafe: "coffee,cafes",
  restaurant: "restaurants",
  store: "petstore,pet_adoption",
};

export interface YelpSearchParams {
  category: Category;
  lat: number;
  lon: number;
  filters?: PlaceFilters;
}

function priceLevelToYelp(price?: string[]): string | undefined {
  if (!price || price.length === 0) return undefined;
  const map: Record<string, string> = { $: "1", $$: "2", $$$: "3", $$$$: "4" };
  return price.map((p) => map[p]).filter(Boolean).join(",");
}

function metersToMiles(m: number): number {
  return Math.round((m / 1609.34) * 10) / 10;
}

function mapYelpPlace(raw: YelpBusiness, userLat: number, userLon: number): Place {
  const price = raw.price ?? "$";
  return {
    id: raw.id,
    name: raw.name,
    category: guessCategory(raw.categories),
    address: [raw.location.address1, raw.location.city, raw.location.state].filter(Boolean).join(", "),
    lat: raw.coordinates.latitude,
    lon: raw.coordinates.longitude,
    distanceMiles: metersToMiles(raw.distance ?? 0),
    price,
    rating: raw.rating,
    reviewCount: raw.review_count,
    phone: raw.display_phone,
    url: raw.url,
    imageUrl: raw.image_url,
    hours: raw.hours
      ? {
          open: raw.hours[0]?.is_open_now ?? false,
          display: raw.hours[0]?.open?.map((h) => `${h.day}: ${h.start}–${h.end}`) ?? [],
        }
      : undefined,
    yelpCategories: raw.categories.map((c) => c.title),
  };
}

function guessCategory(cats: { alias: string; title: string }[]): Category {
  const aliases = cats.map((c) => c.alias);
  if (aliases.some((a) => a.includes("pet") || a.includes("animal"))) return "store";
  if (aliases.some((a) => a.includes("coffee") || a.includes("cafe"))) return "cafe";
  return "restaurant";
}

export async function searchYelp({ category, lat, lon, filters }: YelpSearchParams): Promise<Place[]> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) throw new Error("YELP_API_KEY not set");

  const params = new URLSearchParams({
    term: "pet friendly",
    categories: CATEGORY_MAP[category],
    latitude: String(lat),
    longitude: String(lon),
    radius: "16000", // ~10 miles
    limit: "20",
    sort_by: "distance",
    open_now: filters?.openNow ? "true" : "false",
  });

  if (filters?.price) {
    const yelpPrice = priceLevelToYelp(filters.price);
    if (yelpPrice) params.set("price", yelpPrice);
  }
  if (filters?.cuisine && category === "restaurant") {
    params.set("categories", filters.cuisine);
  }

  const res = await fetch(`${YELP_BASE}/businesses/search?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yelp API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.businesses as YelpBusiness[]).map((b) => mapYelpPlace(b, lat, lon));
}

// Yelp business types (minimal)
interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  price?: string;
  image_url: string;
  url: string;
  display_phone: string;
  distance?: number;
  coordinates: { latitude: number; longitude: number };
  location: { address1: string; city: string; state: string; zip_code: string };
  categories: { alias: string; title: string }[];
  hours?: { is_open_now: boolean; open: { day: number; start: string; end: string }[] }[];
}
