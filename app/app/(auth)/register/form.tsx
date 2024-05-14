"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, registerOrganization } from "@/lib/actions";
import FormButton from "@/components/form/form-button";

export default function FormPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    organizationId: ""
  });
  const [orgData, setOrgData] = useState({
    organizationName: "",
    address: "",
    domain: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const prevStep = () => {
    setStep(step - 1);
  }

  const nextStep = () => {
    setStep(step + 1);
  }  

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrgChange = (e: any) => {
    const {name, value} = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value}));
  }

  return (
    <form
      action={async (data: FormData) => {
        setIsSubmitting(true);
        const orgResult = await registerOrganization(data);
        if (orgResult?.error) {
          toast.error(`Organization Creation Failed: ${orgResult.error}`);
          setIsSubmitting(false);
          return;
        }
    
        const result = await registerUser(data, orgResult.organization.id);
        if (result?.error) {
          toast.error(`Register Failed: ${result.error}`);
          setIsSubmitting(false);
        } else {
          toast.success("Registration Successful");
          router.push("/login");
        }
      }}
      className="rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-black sm:p-10"
    >
      <h2 className="mb-2 font-cal text-3xl dark:text-white">
        Register Intrepid Email App
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Create your account.
      </p>
      <div className={step === 0 ? "max-w-md block" : "hidden"}>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          required
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="my-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          required
        />
      </div>
      <div className={step === 1 ? "max-w-md block" : "hidden"}>
        <input
          name="organizationName"
          type="text"
          value={orgData.organizationName}
          onChange={handleOrgChange}
          placeholder="Organization Name"
          className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        />
        <input
          name="address"
          type="text"
          value={orgData.address}
          onChange={handleOrgChange}
          placeholder="Organization Address"
          className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        />
        <input
            name="domain"
            type="text"
            value={orgData.domain}
            onChange={handleOrgChange}
            placeholder="Domain"
            className="mt-4 w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
        />
      </div>
      {step > 0 && <button onClick={prevStep} className="w-full max-w-md rounded-md border border-stone-300 text-sm dark:text-white sm:h-10 my-5">Back</button>}
      {step < 1 && <button onClick={nextStep}  className="w-full max-w-md rounded-md border border-stone-300 text-sm dark:text-white sm:h-10">Next</button>}
      { step === 1 && <FormButton isSubmitting={isSubmitting} label="Register" />}
      <div className="mt-5 text-sm text-stone-400">
        Already have an account?
        <Link
          href="/login"
          className="rounded-lg p-2 underline hover:text-stone-200 dark:hover:text-stone-200"
        >
          Log in
        </Link>
      </div>
    </form>
  );
}