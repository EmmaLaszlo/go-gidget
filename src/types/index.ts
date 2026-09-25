export type Category = "cafe" | "restaurant" | "store";

export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";

export interface PlaceFilters {
  price?: PriceLevel[];
  cuisine?: string;
  openNow?: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: Category;
  address: string;
  lat: number;
  lon: number;
  distanceMiles: number;
  price: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  url?: string;
  imageUrl?: string;
  hours?: { open: boolean; display: string[] };
  yelpCategories: string[];
  aiBlurb?: string;
  aiConfidence?: "high" | "moderate" | "low";
  goGidgetRating?: number; // community average 1-5
  goGidgetCount?: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  isPremium: boolean;
  clickCount: number;
}

export const FREE_CLICK_LIMIT = Number(process.env.FREE_CLICK_LIMIT ?? 20);

export const GO_LABELS: Record<number, string> = {
  1: "go",
  2: "goo",
  3: "gooo",
  4: "goooo",
  5: "gooooo",
};
