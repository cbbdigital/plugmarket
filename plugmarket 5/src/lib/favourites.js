import { supabase } from "./supabase";

export async function getFavourites(userId) {
  const { data, error } = await supabase
    .from("favourites")
    .select(`
      id,
      created_at,
      listing:listings (
        *,
        listing_photos (url, position)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function addFavourite(userId, listingId) {
  const { data, error } = await supabase
    .from("favourites")
    .insert({ user_id: userId, listing_id: listingId })
    .select()
    .single();

  // Increment save_count on listing
  if (!error) {
    await supabase.rpc("increment_save_count", { lid: listingId });
  }
  return { data, error };
}

export async function removeFavourite(userId, listingId) {
  const { error } = await supabase
    .from("favourites")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);

  if (!error) {
    await supabase.rpc("decrement_save_count", { lid: listingId });
  }
  return { error };
}

export async function isFavourited(userId, listingId) {
  const { data } = await supabase
    .from("favourites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .limit(1);
  return data?.length > 0;
}
