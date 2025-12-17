import type { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-col space-y-12 p-4 md:p-8 lg:p-16">
      <div className="flex min-w-0 flex-col space-y-6">{children}</div>
    </div>
  );
}
