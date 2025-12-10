"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import FormButton from "@/components/form/form-button";
import { registerUser } from "@/lib/actions/auth";

function RegisterForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataObj = new FormData();
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);

    const result = await registerUser(formDataObj);

    if (result?.error) {
      toast.error(`Register Failed: ${result.error}`);
      setIsSubmitting(false);
      return;
    }

    toast.success(
      "Registration successful. Please check your email to verify.",
    );
    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        disabled={isSubmitting}
        className="mt-4 w-full max-w-md rounded-none border border-white bg-white/10 text-base text-white placeholder-white/70 focus:border-white focus:ring-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        required
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        disabled={isSubmitting}
        className="my-4 w-full max-w-md rounded-none border border-white bg-white/10 text-base text-white placeholder-white/70 focus:border-white focus:ring-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        required
      />
      <FormButton isSubmitting={isSubmitting} label="Register" />
    </form>
  );
}

export default RegisterForm;
