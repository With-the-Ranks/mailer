import ForgotPasswordForm from "./form";

interface Props {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  // Normalize token to a single string (or undefined)
  const params = await searchParams;
  const raw = params.token;
  const token = Array.isArray(raw) ? raw[0] : raw;

  return <ForgotPasswordForm token={token} />;
}
