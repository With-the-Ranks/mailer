import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Code, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import { cal, inter } from "@/styles/fonts";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(cal.variable, inter.variable)}>
      <RootProvider
        theme={{
          enabled: false,
          defaultTheme: "light",
        }}
      >
        <DocsLayout
          tree={source.pageTree}
          {...baseOptions}
          sidebar={{
            tabs: {
              transform(option, node) {
                const icons: Record<string, ReactNode> = {
                  "For Organizers": <Users className="size-full" />,
                  "For Developers": <Code className="size-full" />,
                  "For Advanced Users": <Settings className="size-full" />,
                };

                const title = String(option.title || "");
                const icon = icons[title];
                if (!icon) return option;

                return {
                  ...option,
                  icon: (
                    <div className="bg-fd-primary/10 text-fd-primary rounded-md p-1">
                      {icon}
                    </div>
                  ),
                };
              },
            },
          }}
        >
          {children}
        </DocsLayout>
      </RootProvider>
    </div>
  );
}
