import FixturesDirectoryClient from "@/components/fixtures/FixturesDirectoryClient";
import { getFixtureLeagues } from "@/lib/supabase/queries";

export default async function FixturesPage() {
  const { data, error } = await getFixtureLeagues();

  return (
    <FixturesDirectoryClient
      leagues={data ?? []}
      error={error}
    />
  );
}
