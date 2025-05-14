import ForgotPasswordForm from "./form";

interface Props {
  searchParams: { token?: string | string[] };
}

export default function ForgotPasswordPage({ searchParams }: Props) {
  // Normalize token to a single string (or undefined)
  const raw = searchParams.token;
  const token = Array.isArray(raw) ? raw[0] : raw;

  return <ForgotPasswordForm token={token} />;
}
