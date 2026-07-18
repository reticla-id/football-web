import SignInClient from "./SignInClient";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const reason = getFirstValue(resolvedSearchParams?.reason);
  const status = getFirstValue(resolvedSearchParams?.status);

  let infoMessage: string | null = null;

  if (reason === "session-expired") {
    infoMessage = "Your session expired. Please sign in again.";
  } else if (status === "account-created") {
    infoMessage =
      "Account created. If verification is required, check your email before signing in.";
  }

  return <SignInClient infoMessage={infoMessage} />;
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
