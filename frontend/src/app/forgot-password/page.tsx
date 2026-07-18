"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-12">
        <section className="relative flex items-center justify-center px-8 py-12 lg:col-span-5">
          <AuthProcessingOverlay visible={isLoading} message={loadingMessage} />

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
                Reset password
              </h1>

              <p className="mt-3 text-zinc-400">
                Enter your email and we&apos;ll send you a recovery link.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} aria-busy={isLoading}>
              <div className="space-y-2">
                <Input
                  ref={emailRef}
                  placeholder="Email"
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

            <div className="mt-8 flex items-center justify-between text-sm">
              <span className="text-zinc-500">Remembered your password?</span>

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
                Restore
                Secure
                Access.
              </h2>

              <p className="mt-8 max-w-lg text-lg leading-8 text-zinc-300">
                Recover access to your football intelligence workspace and get
                back to players, fixtures and club analysis without breaking
                your flow.
              </p>
            </div>

            <Card className="w-[360px] border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Secure sign-in</span>
                  <span className="font-semibold text-white">Enabled</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Recovery flow</span>
                  <span className="font-semibold text-white">Email link</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Workspace access</span>
                  <span className="font-semibold text-white">Restorable</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
