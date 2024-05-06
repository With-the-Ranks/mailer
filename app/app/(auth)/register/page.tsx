import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import FormPage from "./form";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <section className="bg-black flex items-center justify-center">
      <div className="w-sm">
        <FormPage />
      </div>
    </section>
  );
}