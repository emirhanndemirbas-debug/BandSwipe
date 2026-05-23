import { supabase } from './supabase';

export async function generateEmbedding(
  userId: string,
  profileType: 'musician' | 'band',
): Promise<void> {
  try {
    await supabase.functions.invoke('generate-embedding', {
      body: { user_id: userId, profile_type: profileType },
    });
  } catch {
    // best-effort; embedding eksikse kural tabanlı skor devreye girer
  }
}
