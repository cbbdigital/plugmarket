import { supabase } from "./supabase";

export async function getSellerReviews(sellerId) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey (full_name, avatar_url, city, country),
      listing:listings (make, model, year)
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function createReview({ reviewerId, sellerId, listingId, rating, text }) {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ reviewer_id: reviewerId, seller_id: sellerId, listing_id: listingId, rating, text })
    .select()
    .single();
  return { data, error };
}
