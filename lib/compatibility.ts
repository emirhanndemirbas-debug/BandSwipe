// gte-small normalize=true ile üretilen vektörler birim uzunlukta olduğundan
// cosine similarity = dot product
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}

function parseEmbedding(raw: unknown): number[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as number[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as number[];
    } catch {
      return null;
    }
  }
  return null;
}

export interface MusicianProfile {
  id: string;
  name: string;
  city: string | null;
  instrument: string | null;
  experience_years: number;
  genres: string[];
  goals: string[];
  skill_level: string | null;
  bio: string | null;
  avatar_url: string | null;
  audio_demo_url: string | null;
  youtube_url: string | null;
  spotify_url: string | null;
  instagram_url: string | null;
  photos?: string[] | null;
  embedding?: number[] | null;
}

export interface BandProfile {
  id: string;
  band_name: string;
  city: string | null;
  genres: string[];
  required_roles: string[];
  min_experience_years: number;
  goals: string[];
  bio: string | null;
  avatar_url: string | null;
  demo_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  spotify_url?: string | null;
  min_age: number | null;
  max_age: number | null;
  active_since: number | null;
  photos?: string[] | null;
  embedding?: number[] | null;
}

export type FeedProfile =
  | (MusicianProfile & { profile_type: 'musician' })
  | (BandProfile & { profile_type: 'band' });

interface CompatibilityBreakdown {
  city: number;
  genre: number;
  experience: number;
  goals: number;
  other: number;
}

export function calculateCompatibility(
  myProfile: FeedProfile,
  targetProfile: FeedProfile,
): { score: number; breakdown: CompatibilityBreakdown } {
  const musician =
    myProfile.profile_type === 'musician'
      ? (myProfile as MusicianProfile & { profile_type: 'musician' })
      : (targetProfile as MusicianProfile & { profile_type: 'musician' });
  const band =
    myProfile.profile_type === 'band'
      ? (myProfile as BandProfile & { profile_type: 'band' })
      : (targetProfile as BandProfile & { profile_type: 'band' });

  // city: +25
  const cityScore =
    musician.city && band.city && musician.city.toLowerCase() === band.city.toLowerCase()
      ? 25
      : 0;

  // genre: +30, kısmi puan
  const genreOverlap = musician.genres.filter((g) => band.genres.includes(g));
  const genreMax = Math.max(musician.genres.length, band.genres.length, 1);
  const genreScore = Math.round((30 * genreOverlap.length) / genreMax);

  // experience: +15
  const minExp = band.min_experience_years ?? 0;
  const musExp = musician.experience_years ?? 0;
  const expScore =
    minExp === 0 ? 15 : musExp >= minExp ? 15 : Math.round((15 * musExp) / minExp);

  // goals: +15, kısmi puan
  const goalOverlap = musician.goals.filter((g) => band.goals.includes(g));
  const goalMax = Math.max(musician.goals.length, band.goals.length, 1);
  const goalsScore = Math.round((15 * goalOverlap.length) / goalMax);

  // other: +15 — embedding varsa cosine similarity, yoksa binary enstrüman eşleşmesi
  const musEmb = parseEmbedding(musician.embedding);
  const bandEmb = parseEmbedding(band.embedding);
  const otherScore =
    musEmb && bandEmb && musEmb.length === bandEmb.length
      ? Math.round(15 * Math.max(0, dotProduct(musEmb, bandEmb)))
      : musician.instrument &&
          band.required_roles.some(
            (r) =>
              r.toLowerCase().includes(musician.instrument!.toLowerCase()) ||
              musician.instrument!.toLowerCase().includes(r.toLowerCase()),
          )
        ? 15
        : 0;

  const breakdown: CompatibilityBreakdown = {
    city: cityScore,
    genre: genreScore,
    experience: expScore,
    goals: goalsScore,
    other: otherScore,
  };

  const score = Math.min(100, cityScore + genreScore + expScore + goalsScore + otherScore);

  return { score, breakdown };
}
