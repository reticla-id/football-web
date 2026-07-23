"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Lock, Mail } from "lucide-react";

import { AuthFeedbackMessage } from "@/components/auth/auth-feedback-message";
import { AuthProcessingOverlay } from "@/components/auth/auth-processing-overlay";
import {
  mapAuthErrorMessage,
  validateEmail,
} from "@/components/auth/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUserProfile, signInWithEmail } from "@/lib/supabase/queries";
import { useAppStore } from "@/lib/store";

interface SignInClientProps {
  infoMessage: string | null;
}

export default function SignInClient({ infoMessage }: SignInClientProps) {
  const router = useRouter();
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
    <div className="min-h-screen bg-black">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.98fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="relative hidden min-h-screen overflow-hidden md:block">
          <Image
            src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1600&auto=format&fit=crop"
            alt="Football analytics platform"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.22)_28%,rgba(0,0,0,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.48),rgba(0,0,0,0.18)_38%,rgba(0,0,0,0.58))]" />

          <div className="relative flex h-full flex-col justify-between p-8 lg:p-10 xl:p-12">
            <div className="flex items-center gap-3">
              <Image
                src="https://i.ibb.co.com/Z6tKqhkm/pantauaja-vector-no-bg.png"
                alt="Reticla"
                width={88}
                height={88}
                className="h-14 w-14 object-contain lg:h-16 lg:w-16"
                priority
              />
              <span className="font-display text-2xl tracking-[0.18em] text-white">
                RETICLA
              </span>
            </div>

            <div className="max-w-2xl">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.38em] text-zinc-300 lg:text-xs">
                Sports Intelligence Platform
              </p>

              <h2 className="font-display text-[2.85rem] leading-[0.92] text-white sm:text-[3.2rem] lg:text-[4.2rem] xl:text-[5rem]">
                EVERY METRIC.
                <br />
                EVERY MATCH.
                <br />
                ONE PLATFORM.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-300 lg:text-base lg:leading-8">
                Built for analysts, scouts, coaching staff, and club leadership to
                monitor performance, evaluate talent, and turn match data into
                sharper decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10 xl:px-14">
          <AuthProcessingOverlay visible={isLoading} message="Signing in..." />

          <div className="w-full max-w-[480px] space-y-7">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <Image
                src="https://i.ibb.co.com/Z6tKqhkm/pantauaja-vector-no-bg.png"
                alt="Reticla"
                width={72}
                height={72}
                className="h-12 w-12 object-contain"
                priority
              />
              <span className="font-display text-2xl tracking-[0.18em] text-white">
                RETICLA
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-[2.5rem] leading-none text-white sm:text-[2.9rem]">
                WELCOME BACK
              </h1>
              <p className="max-w-md text-sm leading-6 text-zinc-400">
                Sign in to continue into your football intelligence workspace.
              </p>
            </div>

            <div className="space-y-3">
              <SocialButton label="Continue with Google" provider="google" />
              <SocialButton label="Continue with Microsoft" provider="microsoft" />
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 border-t border-zinc-800" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Or
              </span>
              <div className="h-px flex-1 border-t border-zinc-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
              <div className="space-y-2">
                <label
                  htmlFor="sign-in-email"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                >
                  Email
                </label>
                <div className="flex h-12 items-center gap-3 border border-zinc-800 px-4 transition-colors hover:border-zinc-700 focus-within:border-zinc-600">
                  <Mail className="h-4 w-4 shrink-0 text-zinc-500" />
                  <Input
                    id="sign-in-email"
                    ref={emailRef}
                    placeholder="youremail@reticla.com"
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
                    className="h-full border-0 bg-transparent p-0 text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                {fieldErrors.email ? (
                  <p id="sign-in-email-error" className="text-sm text-rose-400">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="sign-in-password"
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 transition hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="flex h-12 items-center gap-3 border border-zinc-800 px-4 transition-colors hover:border-zinc-700 focus-within:border-zinc-600">
                  <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
                  <Input
                    id="sign-in-password"
                    ref={passwordRef}
                    placeholder="••••••••"
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
                    className="h-full border-0 bg-transparent p-0 text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                {fieldErrors.password ? (
                  <p id="sign-in-password-error" className="text-sm text-rose-400">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              {infoMessage ? <AuthFeedbackMessage tone="info" message={infoMessage} /> : null}
              {error ? <AuthFeedbackMessage tone="error" message={error} /> : null}
              {successMessage ? (
                <AuthFeedbackMessage tone="success" message={successMessage} />
              ) : null}

              <Button
                type="submit"
                className="w-full bg-[var(--accent-secondary)] text-black transition-all duration-200 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99]"
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

            <p className="text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="accent-secondary font-medium transition hover:text-white">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SocialButton({
  label,
  provider,
}: {
  label: string;
  provider: "google" | "microsoft";
}) {
  return (
    <button
      type="button"
      disabled
      className="flex h-12 w-full items-center justify-center gap-3 border border-zinc-800 px-4 text-sm text-zinc-200 transition-colors"
      aria-disabled="true"
    >
      {provider === "google" ? <GoogleMark /> : <MicrosoftMark />}
      <span>{label}</span>
    </button>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.7S6.8 21 12 21c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.9-.1-1.3H12Z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
      <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
      <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
      <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
    </svg>
  );
}
