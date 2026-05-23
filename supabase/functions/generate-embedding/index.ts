import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase Edge Runtime global
declare const Supabase: {
  ai: {
    Session: new (model: string) => {
      run(
        input: string,
        options: { mean_pool: boolean; normalize: boolean },
      ): Promise<Float32Array | number[]>;
    };
  };
};

Deno.serve(async (req: Request) => {
  try {
    const { user_id, profile_type } = await req.json();

    if (!user_id || !profile_type) {
      return new Response(JSON.stringify({ error: 'user_id and profile_type required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const table = profile_type === 'musician' ? 'musician_profiles' : 'band_profiles';
    const selectCols = profile_type === 'musician'
      ? 'name, genres, bio, goals'
      : 'band_name, genres, bio, goals';
    const { data: profile, error } = await supabase
      .from(table)
      .select(selectCols)
      .eq('id', user_id)
      .single();

    if (error || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found', detail: error?.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const name: string = profile.name ?? profile.band_name ?? '';
    const genres: string = (profile.genres ?? []).join(', ');
    const bio: string = profile.bio ?? '';
    const goals: string = (profile.goals ?? []).join(', ');
    const text = `${name}. Tarz: ${genres}. Bio: ${bio}. Hedefler: ${goals}`.trim();

    const model = new Supabase.ai.Session('gte-small');
    const raw = await model.run(text, { mean_pool: true, normalize: true });
    const embedding = Array.from(raw);

    const { error: updateError } = await supabase
      .from(table)
      .update({ embedding })
      .eq('id', user_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
