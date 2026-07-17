"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signUpWithEmail } from "@/lib/supabase/queries";
import { useAppStore } from "@/lib/store";

export default function SignUpPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await signUpWithEmail(email, password, username);
    if (error || !data?.user || !data.profile) {
      setError(error ?? "We could not create your account right now.");
      setIsLoading(false);
      return;
    }

    setCurrentUser(data.profile);
    router.push("/");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-12">
        <section className="flex items-center justify-center px-8 py-12 lg:col-span-5">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <div className="accent-text mb-8 flex h-14 w-14 items-center justify-center">
                <Image
                  src="https://i.ibb.co.com/Z6tKqhkm/pantauaja-vector-no-bg.png"
                  alt="Reticla"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>

              <h1 className="font-display text-4xl text-white">
                Create account
              </h1>

              <p className="mt-3 text-zinc-400">
                Build your football analytics workspace and get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />

              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}

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
                type="submit" 
                disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-8 flex items-center justify-between text-sm">
              <span className="text-zinc-500">Already registered?</span>

              <Link href="/sign-in" className="accent-text">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden lg:col-span-7 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--accent)_25%,transparent),transparent_45%)]" />

          <div className="relative flex h-full flex-col justify-between p-16">
            <div />

            <div className="max-w-xl">
              <p className="accent-text mb-6 text-xs uppercase tracking-[0.35em]">
                Football Analytics Platform
              </p>

              <h2 className="font-display text-6xl leading-[1.05] text-white">
                Build Your
                Analysis
                Environment.
              </h2>

              <p className="mt-8 max-w-lg text-lg leading-8 text-zinc-300">
                Create your account to explore clubs, players, fixtures and
                performance insights in one modern football intelligence
                workspace.
              </p>
            </div>

            <Card className="w-[360px] border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Competitions</span>
                  <span className="font-semibold text-white">24+</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Clubs</span>
                  <span className="font-semibold text-white">650+</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Players</span>
                  <span className="font-semibold text-white">30,000+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
