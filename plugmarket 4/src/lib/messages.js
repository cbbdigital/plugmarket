import { supabase } from "./supabase";

// ── Get all conversations for a user ──
export async function getConversations(userId) {
  const { data, error } = await supabase
    .from("conversations_with_details")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });
  return { data, error };
}

// ── Get or create a conversation ──
export async function getOrCreateConversation(listingId, buyerId, sellerId) {
  // Check if conversation exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .limit(1);

  if (existing?.length > 0) return { data: existing[0], error: null };

  // Create new
  const { data, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
    .select()
    .single();
  return { data, error };
}

// ── Get messages for a conversation ──
export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (full_name, avatar_url)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return { data, error };
}

// ── Send a message ──
export async function sendMessage(conversationId, senderId, body) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select()
    .single();
  return { data, error };
}

// ── Mark messages as read ──
export async function markAsRead(conversationId, userId) {
  // Mark all unread messages in this conversation from the other user
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_read", false);

  // Reset unread counter
  const { data: conv } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .single();

  if (conv) {
    const field = userId === conv.buyer_id ? "buyer_unread" : "seller_unread";
    await supabase
      .from("conversations")
      .update({ [field]: 0 })
      .eq("id", conversationId);
  }
}

// ── Subscribe to new messages (realtime) ──
export function subscribeToMessages(conversationId, callback) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// ── Subscribe to conversation updates (for unread badges) ──
export function subscribeToConversations(userId, callback) {
  return supabase
    .channel(`conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
        filter: `buyer_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
        filter: `seller_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
