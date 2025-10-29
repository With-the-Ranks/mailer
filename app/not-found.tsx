import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="font-cal text-6xl font-bold text-stone-800 dark:text-white md:text-8xl">
            404
          </h1>
          <h2 className="font-cal text-3xl font-semibold text-stone-700 dark:text-stone-200 md:text-4xl">
            Page Not Found
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 md:text-xl">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        <div className="flex justify-center">
          <Image
            alt="404 illustration"
            src="/empty-state.png"
            width={400}
            height={400}
            className="rounded-lg"
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-stone-500 dark:text-stone-500">
            The page you were looking for might have been moved, deleted, or
            doesn&apos;t exist.
          </p>
          <Button asChild variant="default">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
