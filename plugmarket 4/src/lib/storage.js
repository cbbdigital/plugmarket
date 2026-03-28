import { supabase } from "./supabase";

// ── Upload listing photo ──
export async function uploadListingPhoto(file, userId, listingId, position = 0) {
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/${listingId}/${position}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("listing-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) return { url: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from("listing-photos")
    .getPublicUrl(data.path);

  // Insert into listing_photos table
  const { error: dbError } = await supabase
    .from("listing_photos")
    .insert({ listing_id: listingId, url: publicUrl, position });

  return { url: publicUrl, error: dbError };
}

// ── Delete listing photo ──
export async function deleteListingPhoto(photoId, storagePath) {
  // Remove from storage
  if (storagePath) {
    await supabase.storage.from("listing-photos").remove([storagePath]);
  }
  // Remove from DB
  const { error } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", photoId);
  return { error };
}

// ── Upload avatar ──
export async function uploadAvatar(file, userId) {
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/avatar.${ext}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // overwrite existing
    });

  if (error) return { url: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(data.path);

  // Update profile
  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);

  return { url: publicUrl, error: null };
}

// ── Get all photos for a listing ──
export async function getListingPhotos(listingId) {
  const { data, error } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", listingId)
    .order("position");
  return { data, error };
}

// ── Reorder photos ──
export async function reorderPhotos(photoIds) {
  // photoIds is an array in the desired order
  const updates = photoIds.map((id, i) => ({ id, position: i }));
  for (const u of updates) {
    await supabase
      .from("listing_photos")
      .update({ position: u.position })
      .eq("id", u.id);
  }
}
