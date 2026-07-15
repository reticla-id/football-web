export interface Team {
  id: number;
  name: string;
  slug: string | null;
  short_code: string | null;
  country: string | null;
  league: string | null;
  logo: string | null;
  founded: number | null;
  stadium?: string | null;
  season?: string | null;
}