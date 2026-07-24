"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { AuthFeedbackMessage } from "@/components/auth/auth-feedback-message";
import { AuthProcessingOverlay } from "@/components/auth/auth-processing-overlay";
import {
  mapAuthErrorMessage,
  validateEmail,
} from "@/components/auth/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const loadingMessage = useMemo(() => "Sending reset link...", []);

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(email),
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
    setSuccess(null);

    const nextErrors = validateForm();
    if (nextErrors.email) {
      setIsLoading(false);
      emailRef.current?.focus();
      return;
    }

    if (!supabase) {
      setError("Authentication service is currently unavailable.");
      setIsLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

    if (resetError) {
      setError(mapAuthErrorMessage(resetError.message));
      setIsLoading(false);
      return;
    }

    setSuccess("Password reset email sent. Check your inbox for the recovery link.");
    setIsLoading(false);
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
                RESTORE ACCESS
                <br />
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-300 lg:text-base lg:leading-8">
                Recover access to your football intelligence workspace and get back to
                players, fixtures and club analysis without breaking your flow.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10 xl:px-14">
          <AuthProcessingOverlay visible={isLoading} message={loadingMessage} />

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
                RESET PASSWORD
              </h1>
              <p className="max-w-md text-sm leading-6 text-zinc-400">
                Enter your email and we&apos;ll send you a recovery link.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} aria-busy={isLoading}>
              <div className="space-y-2">
                <label
                  htmlFor="forgot-password-email"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                >
                  Email
                </label>
                <Input
                  id="forgot-password-email"
                  ref={emailRef}
                  placeholder="youremail@reticla.com"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setEmail(nextValue);
                    setFieldErrors({
                      email: nextValue ? validateEmail(nextValue) : "Email is required.",
                    });
                  }}
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "forgot-password-email-error" : undefined}
                />

                {fieldErrors.email ? (
                  <p id="forgot-password-email-error" className="text-sm text-rose-400">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              {error ? <AuthFeedbackMessage tone="error" message={error} /> : null}
              {success ? <AuthFeedbackMessage tone="success" message={success} /> : null}

              <Button
                type="submit"
                className="w-full bg-[var(--accent-secondary)] text-black transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </Button>

              {isLoading ? (
                <p className="text-sm text-zinc-500" role="status" aria-live="polite">
                  Sending reset link...
                </p>
              ) : null}
            </form>

            <p className="text-sm text-zinc-500">
              Remembered your password?{" "}
              <Link href="/sign-in" className="accent-secondary font-medium transition hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
