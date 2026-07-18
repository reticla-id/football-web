"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";

import { AuthFeedbackMessage } from "@/components/auth/auth-feedback-message";
import { AuthProcessingOverlay } from "@/components/auth/auth-processing-overlay";
import {
  mapAuthErrorMessage,
  validateEmail,
} from "@/components/auth/auth-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUserProfile, signInWithEmail } from "@/lib/supabase/queries";
import { useAppStore } from "@/lib/store";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const infoMessage = useMemo(() => {
    const reason = searchParams.get("reason");
    const status = searchParams.get("status");

    if (reason === "session-expired") {
      return "Your session expired. Please sign in again.";
    }

    if (status === "account-created") {
      return "Account created. If verification is required, check your email before signing in.";
    }

    return null;
  }, [searchParams]);

  const focusFirstInvalidField = (nextErrors: {
    email?: string;
    password?: string;
  }) => {
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }

    if (nextErrors.password) {
      passwordRef.current?.focus();
    }
  };

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(email),
      password: password ? "" : "Password is required.",
    };

    setFieldErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const nextErrors = validateForm();
    if (nextErrors.email || nextErrors.password) {
      setIsLoading(false);
      focusFirstInvalidField(nextErrors);
      return;
    }

    const { data, error: signInError } = await signInWithEmail(email, password);
    if (signInError || !data?.user) {
      setError(mapAuthErrorMessage(signInError));
      setIsLoading(false);
      return;
    }

    const profileResult = await getCurrentUserProfile();
    setCurrentUser(profileResult.data);
    setSuccessMessage("Successfully signed in. Redirecting...");

    window.setTimeout(() => {
      setIsLoading(false);
      router.replace("/");
      router.refresh();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-12">
        <section className="relative flex items-center justify-center px-8 py-12 lg:col-span-5">
          <AuthProcessingOverlay visible={isLoading} message="Signing in..." />

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
                Welcome back
              </h1>

              <p className="mt-3 text-zinc-400">
                Sign in to access your football analytics workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
              <div className="space-y-2">
                <Input
                  ref={emailRef}
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setEmail(nextValue);
                    setFieldErrors((current) => ({
                      ...current,
                      email: nextValue ? validateEmail(nextValue) : "Email is required.",
                    }));
                  }}
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "sign-in-email-error" : undefined}
                />
                {fieldErrors.email ? (
                  <p id="sign-in-email-error" className="text-sm text-rose-400">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Input
                  ref={passwordRef}
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setPassword(nextValue);
                    setFieldErrors((current) => ({
                      ...current,
                      password: nextValue ? "" : "Password is required.",
                    }));
                  }}
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "sign-in-password-error" : undefined}
                />
                {fieldErrors.password ? (
                  <p id="sign-in-password-error" className="text-sm text-rose-400">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              {infoMessage ? <AuthFeedbackMessage tone="info" message={infoMessage} /> : null}
              {error ? <AuthFeedbackMessage tone="error" message={error} /> : null}
              {successMessage ? <AuthFeedbackMessage tone="success" message={successMessage} /> : null}

              <Button
                type="submit"
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
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>

              {isLoading ? (
                <p className="text-sm text-zinc-500" role="status" aria-live="polite">
                  Signing in...
                </p>
              ) : null}
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
              </Link> */}

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

            <Card className="w-[360px] border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Competitions
                  </span>

                  <span className="font-semibold text-white">
                    15+
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Clubs
                  </span>

                  <span className="font-semibold text-white">
                    300+
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-zinc-400">
                    Players
                  </span>

                  <span className="font-semibold text-white">
                    15,000+
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
