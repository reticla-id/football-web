"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

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
                BUILD YOUR
                <br />
                ANALYSIS
                <br />
                ENVIRONMENT.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-300 lg:text-base lg:leading-8">
                Create your account to explore clubs, players, fixtures and performance
                insights in one modern football intelligence workspace.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10 xl:px-14">
          <AuthProcessingOverlay visible={isLoading} message="Creating account..." />

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
                CREATE ACCOUNT
              </h1>
              <p className="max-w-md text-sm leading-6 text-zinc-400">
                Build your football analytics workspace and get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
              <div className="space-y-2">
                <label
                  htmlFor="sign-up-email"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                >
                  Email
                </label>
                <Input
                  id="sign-up-email"
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
                  aria-describedby={fieldErrors.email ? "sign-up-email-error" : undefined}
                />
                {fieldErrors.email ? (
                  <p id="sign-up-email-error" className="text-sm text-rose-400">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="sign-up-username"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                >
                  Username
                </label>
                <Input
                  id="sign-up-username"
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
                <label
                  htmlFor="sign-up-password"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                >
                  Password
                </label>
                <Input
                  id="sign-up-password"
                  ref={passwordRef}
                  placeholder="••••••••"
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
                <label
                  htmlFor="sign-up-confirm-password"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                >
                  Confirm Password
                </label>
                <Input
                  id="sign-up-confirm-password"
                  ref={confirmPasswordRef}
                  placeholder="Confirm password"
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
              {successMessage ? (
                <AuthFeedbackMessage tone="success" message={successMessage} />
              ) : null}

              <Button
                className="w-full bg-[var(--accent-secondary)] text-black transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
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

            <p className="text-sm text-zinc-500">
              Already registered?{" "}
              <Link href="/sign-in" className="accent-text font-medium transition hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
