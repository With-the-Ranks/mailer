import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import FormPage from "./form";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <section className="flex items-center justify-center bg-black">
      <div className="w-sm">
        <FormPage />
      </div>
    </section>
  );
}
