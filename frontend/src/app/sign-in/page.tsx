"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUserProfile, signInWithEmail } from "@/lib/supabase/queries";
import { useAppStore } from "@/lib/store";

export default function SignInPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await signInWithEmail(email, password);
    if (error || !data?.user) {
      setError(error ?? "Unable to sign in with those credentials.");
      setIsLoading(false);
      return;
    }

    const profileResult = await getCurrentUserProfile();
    setCurrentUser(profileResult.data);
    router.push("/");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-12">

        {/* LEFT */}

        <section className="flex items-center justify-center px-8 py-12 lg:col-span-5">
          <div className="w-full max-w-md">

            <div className="mb-10">

              <div className="accent-bg-soft accent-border-soft accent-text mb-8 flex h-14 w-14 items-center justify-center border">
                <Shield className="h-6 w-6" />
              </div>

              <h1 className="font-display text-4xl text-white">
                Welcome back
              </h1>

              <p className="mt-3 text-zinc-400">
                Sign in to access your football analytics workspace.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <p className="text-sm text-rose-400">
                  {error}
                </p>
              )}

              <Button
                className="
                  w-full
                  bg-[var(--accent)]
                  text-black
                  hover:brightness-110
                  hover:scale-[1.01]
                  active:scale-[0.99]
                  transition-all
                  duration-200
                "
                disabled={isLoading}
              >
                {isLoading
                  ? "Signing in..."
                  : "Sign in"}
              </Button>

            </form>

            <div className="mt-8 flex items-center justify-between text-sm">

              <Link
                href="/forgot-password"
                className="text-zinc-500 transition hover:text-white"
              >
                Forgot password?
              </Link>

              <Link
                href="/sign-up"
                className="accent-text"
              >
                Create account
              </Link>

            </div>

          </div>
        </section>

        {/* RIGHT */}

        <section
          className="
          relative
          hidden
          overflow-hidden
          lg:col-span-7
          lg:flex
          "
        >

          {/* <img
            src="/images/auth-cover.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          /> */}

          <div
            className="
            absolute
            inset-0

            bg-gradient-to-br
            from-black/70
            via-black/40
            to-black/80
            "
          />

          <div
            className="
            absolute

            inset-0

            bg-[radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--accent)_25%,transparent),transparent_45%)]
            "
          />

          <div className="relative flex h-full flex-col justify-between p-16">

            <div />

            <div className="max-w-xl">

              <p
                className="
                accent-text

                mb-6

                text-xs

                uppercase

                tracking-[0.35em]
                "
              >
                Football Analytics Platform
              </p>

              <h2
                className="
                font-display

                text-6xl

                leading-[1.05]

                text-white
                "
              >
                Scouting &
                Performance
                Intelligence.
              </h2>

              <p className="mt-8 max-w-lg text-lg leading-8 text-zinc-300">
                Explore clubs, players, fixtures and performance
                insights across multiple competitions in one
                unified analytics platform.
              </p>

            </div>

            <Card
              className="
              w-[360px]

              border-zinc-800

              bg-zinc-900/60

              backdrop-blur-xl
              "
            >
              <CardContent className="space-y-6 p-6">

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Competitions
                  </span>

                  <span className="font-semibold text-white">
                    24+
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Clubs
                  </span>

                  <span className="font-semibold text-white">
                    650+
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Players
                  </span>

                  <span className="font-semibold text-white">
                    30,000+
                  </span>

                </div>

              </CardContent>
            </Card>

          </div>

        </section>

      </div>
    </div>
  );
}
