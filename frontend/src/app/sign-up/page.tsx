"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Shield } from "lucide-react";

import { AuthFeedbackMessage } from "@/components/auth/auth-feedback-message";
import { AuthProcessingOverlay } from "@/components/auth/auth-processing-overlay";
import {
  mapAuthErrorMessage,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from "@/components/auth/auth-utils";
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const focusFirstInvalidField = (nextErrors: typeof fieldErrors) => {
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }

    if (nextErrors.username) {
      usernameRef.current?.focus();
      return;
    }

    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    if (nextErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
    }
  };

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(email),
      username: validateUsername(username),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
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
    if (
      nextErrors.email ||
      nextErrors.username ||
      nextErrors.password ||
      nextErrors.confirmPassword
    ) {
      setIsLoading(false);
      focusFirstInvalidField(nextErrors);
      return;
    }

    const { data, error: signUpError } = await signUpWithEmail(email, password, username);
    if (signUpError || !data?.user || !data.profile) {
      setError(mapAuthErrorMessage(signUpError));
      setIsLoading(false);
      return;
    }

    setCurrentUser(data.profile);
    setSuccessMessage("Account created successfully. Redirecting...");

    window.setTimeout(() => {
      setIsLoading(false);
      router.push("/sign-in?status=account-created");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-12">
        <section className="relative flex items-center justify-center px-8 py-12 lg:col-span-5">
          <AuthProcessingOverlay visible={isLoading} message="Creating account..." />

          <div className="w-full max-w-md">
            <div className="mb-10">
              <div className="accent-bg-soft accent-border-soft accent-text mb-8 flex h-14 w-14 items-center justify-center border">
                <Shield className="h-6 w-6" />
              </div>

              <h1 className="font-display text-4xl text-white">
                Create account
              </h1>

              <p className="mt-3 text-zinc-400">
                Build your football analytics workspace and get started.
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
                  aria-describedby={fieldErrors.email ? "sign-up-email-error" : undefined}
                />
                {fieldErrors.email ? (
                  <p id="sign-up-email-error" className="text-sm text-rose-400">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Input
                  ref={usernameRef}
                  placeholder="Username"
                  value={username}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setUsername(nextValue);
                    setFieldErrors((current) => ({
                      ...current,
                      username: nextValue ? validateUsername(nextValue) : "Username is required.",
                    }));
                  }}
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? "sign-up-username-error" : undefined}
                />
                {fieldErrors.username ? (
                  <p id="sign-up-username-error" className="text-sm text-rose-400">
                    {fieldErrors.username}
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
                      password: validatePassword(nextValue),
                      confirmPassword: confirmPassword
                        ? validatePasswordConfirmation(nextValue, confirmPassword)
                        : current.confirmPassword,
                    }));
                  }}
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "sign-up-password-error" : undefined}
                />
                {fieldErrors.password ? (
                  <p id="sign-up-password-error" className="text-sm text-rose-400">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Input
                  ref={confirmPasswordRef}
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setConfirmPassword(nextValue);
                    setFieldErrors((current) => ({
                      ...current,
                      confirmPassword: validatePasswordConfirmation(password, nextValue),
                    }));
                  }}
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword ? "sign-up-confirm-password-error" : undefined
                  }
                />
                {fieldErrors.confirmPassword ? (
                  <p id="sign-up-confirm-password-error" className="text-sm text-rose-400">
                    {fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </div>

              {error ? <AuthFeedbackMessage tone="error" message={error} /> : null}
              {successMessage ? <AuthFeedbackMessage tone="success" message={successMessage} /> : null}

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
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>

              {isLoading ? (
                <p className="text-sm text-zinc-500" role="status" aria-live="polite">
                  Creating account...
                </p>
              ) : null}
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
