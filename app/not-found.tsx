import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-stone-800 md:text-8xl dark:text-white">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-stone-700 md:text-4xl dark:text-stone-200">
            Page Not Found
          </h2>
          <p className="text-lg text-stone-600 md:text-xl dark:text-stone-400">
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
          <p className="text-base text-stone-500 dark:text-stone-500">
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
