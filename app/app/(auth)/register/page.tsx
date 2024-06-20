import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import FormPage from "./form";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <section className="flex items-center justify-center dark:bg-black">
      <div className="w-sm">
        <FormPage />
      </div>
    </section>
  );
}
