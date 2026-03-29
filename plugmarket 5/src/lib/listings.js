import { supabase } from "./supabase";

// ── Create a new listing ──
export async function createListing(listingData, userId) {
  const { data, error } = await supabase
    .from("listings")
    .insert({ ...listingData, seller_id: userId })
    .select()
    .single();
  return { data, error };
}

// ── Update listing ──
export async function updateListing(id, updates) {
  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ── Delete listing (soft — set status to deleted) ──
export async function deleteListing(id) {
  return updateListing(id, { status: "deleted" });
}

// ── Get single listing with details ──
export async function getListing(id) {
  const { data, error } = await supabase
    .from("listings_with_details")
    .select("*")
    .eq("id", id)
    .single();

  if (data) {
    // Fetch all photos
    const { data: photos } = await supabase
      .from("listing_photos")
      .select("*")
      .eq("listing_id", id)
      .order("position");
    data.photos = photos || [];
  }

  return { data, error };
}

// ── Search listings ──
export async function searchListings({
  make, model, country, condition,
  priceMin, priceMax, yearMin, yearMax,
  rangeMin, sohMin, dcChargeMin,
  mileageMax, drivetrain,
  sortBy = "created_at", sortDir = "desc",
  page = 0, perPage = 20,
} = {}) {
  let query = supabase
    .from("listings_with_details")
    .select("*", { count: "exact" })
    .eq("status", "active");

  if (make) query = query.eq("make", make);
  if (model) query = query.eq("model", model);
  if (country) query = query.eq("country", country);
  if (condition) query = query.eq("condition", condition);
  if (drivetrain) query = query.eq("drivetrain", drivetrain);
  if (priceMin) query = query.gte("price_eur", priceMin);
  if (priceMax) query = query.lte("price_eur", priceMax);
  if (yearMin) query = query.gte("year", yearMin);
  if (yearMax) query = query.lte("year", yearMax);
  if (rangeMin) query = query.gte("range_real_km", rangeMin);
  if (sohMin) query = query.gte("state_of_health_pct", sohMin);
  if (dcChargeMin) query = query.gte("dc_charge_max_kw", dcChargeMin);
  if (mileageMax) query = query.lte("mileage_km", mileageMax);

  // Boosted listings first, then sort
  query = query
    .order("is_boosted", { ascending: false })
    .order(sortBy, { ascending: sortDir === "asc" })
    .range(page * perPage, (page + 1) * perPage - 1);

  const { data, error, count } = await query;
  return { data, error, count, page, perPage };
}

// ── Get my listings (seller dashboard) ──
export async function getMyListings(userId) {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_photos (url, position)
    `)
    .eq("seller_id", userId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });
  return { data, error };
}

// ── Get sold listings ──
export async function getMySoldListings(userId) {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_photos (url, position),
      buyer:profiles!listings_buyer_id_fkey (full_name, city)
    `)
    .eq("seller_id", userId)
    .eq("status", "sold")
    .order("sold_at", { ascending: false });
  return { data, error };
}

// ── Increment view count ──
export async function recordListingView(listingId, viewerId, ipHash) {
  // Check for duplicate view
  const { data: existing } = await supabase
    .from("listing_views")
    .select("id")
    .eq("listing_id", listingId)
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (existing?.length > 0) return; // Already viewed in last 24h

  await supabase.from("listing_views").insert({
    listing_id: listingId,
    viewer_id: viewerId || null,
    ip_hash: ipHash,
  });

  await supabase.rpc("increment_view_count", { listing_id: listingId });
}

// ── Featured / recently added for homepage ──
export async function getFeaturedListings() {
  const { data, error } = await supabase
    .from("listings_with_details")
    .select("*")
    .eq("status", "active")
    .eq("is_boosted", true)
    .gte("boosted_until", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(6);
  return { data, error };
}

export async function getRecentListings(limit = 8) {
  const { data, error } = await supabase
    .from("listings_with_details")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data, error };
}
