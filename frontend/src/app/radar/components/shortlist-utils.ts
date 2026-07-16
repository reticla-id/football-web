import { supabase } from "@/lib/supabase/client";
import type { ShortlistCollection, ShortlistPlayer } from "@/lib/supabase/types";

export async function loadUserShortlistData(userId: string) {
  if (!supabase) {
    return {
      collections: [] as ShortlistCollection[],
      links: [] as ShortlistPlayer[],
      error: "Supabase client is not initialized.",
    };
  }

  const { data: collections, error: collectionsError } = await supabase
    .from("shortlist_collections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (collectionsError) {
    return {
      collections: [] as ShortlistCollection[],
      links: [] as ShortlistPlayer[],
      error: collectionsError.message,
    };
  }

  if (!collections.length) {
    return {
      collections,
      links: [] as ShortlistPlayer[],
      error: null,
    };
  }

  const shortlistIds = collections.map((collection) => collection.id);
  const { data: links, error: linksError } = await supabase
    .from("shortlist_players")
    .select("*")
    .in("shortlist_id", shortlistIds)
    .order("created_at", { ascending: false });

  return {
    collections,
    links: links ?? [],
    error: linksError?.message ?? null,
  };
}

export function hasPlayerInCollection(
  links: ShortlistPlayer[],
  shortlistId: number,
  playerId: number
) {
  return links.some(
    (link) => link.shortlist_id === shortlistId && link.player_id === playerId
  );
}
