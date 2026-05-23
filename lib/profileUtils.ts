import { supabase } from './supabase';
import { FeedProfile } from './compatibility';

export async function fetchProfilesByIds(ids: string[]): Promise<FeedProfile[]> {
  if (ids.length === 0) return [];

  const [{ data: musicians }, { data: bands }] = await Promise.all([
    supabase.from('musician_profiles').select('*').in('id', ids),
    supabase.from('band_profiles').select('*').in('id', ids),
  ]);

  const musicianMap = new Map<string, FeedProfile>(
    (musicians ?? []).map((m: Record<string, unknown>) => [
      m.id as string,
      { ...m, profile_type: 'musician' } as FeedProfile,
    ]),
  );

  const bandMap = new Map<string, FeedProfile>(
    (bands ?? []).map((b: Record<string, unknown>) => [
      b.id as string,
      { ...b, profile_type: 'band' } as FeedProfile,
    ]),
  );

  return ids
    .map((id) => musicianMap.get(id) ?? bandMap.get(id))
    .filter((p): p is FeedProfile => p !== undefined);
}
