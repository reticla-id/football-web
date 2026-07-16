import { redirect } from "next/navigation";

import HomeClient from "@/components/home/HomeClient";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/sign-in");
  }

  return <HomeClient />;
}
