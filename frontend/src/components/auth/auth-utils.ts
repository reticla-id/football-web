"use client";

export function validateEmail(email: string) {
  if (!email.trim()) {
    return "Email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return "Enter a valid email address.";
  }

  return "";
}

export function validateUsername(username: string) {
  if (!username.trim()) {
    return "Username is required.";
  }

  if (username.trim().length < 3) {
    return "Username must be at least 3 characters.";
  }

  return "";
}

export function validatePassword(password: string) {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must include at least one letter and one number.";
  }

  return "";
}

export function validatePasswordConfirmation(password: string, confirmPassword: string) {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

export function mapAuthErrorMessage(error: string | null | undefined) {
  const value = (error ?? "").toLowerCase();

  if (!value) {
    return "Something went wrong. Please try again.";
  }

  if (
    value.includes("invalid login credentials") ||
    value.includes("invalid credentials") ||
    value.includes("invalid_grant")
  ) {
    return "Incorrect email or password.";
  }

  if (value.includes("email not confirmed") || value.includes("email not verified")) {
    return "Verify your email address before signing in.";
  }

  if (
    value.includes("failed to fetch") ||
    value.includes("network") ||
    value.includes("fetch")
  ) {
    return "Network issue detected. Check your connection and try again.";
  }

  if (value.includes("session") && (value.includes("expired") || value.includes("missing"))) {
    return "Your session expired. Please sign in again.";
  }

  if (value.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (value.includes("user already registered")) {
    return "An account with this email already exists.";
  }

  if (value.includes("server") || value.includes("unexpected")) {
    return "Unexpected server issue. Please try again shortly.";
  }

  return "Something went wrong. Please try again.";
}
