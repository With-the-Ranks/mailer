import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Code, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import { leagueSpartan } from "@/styles/fonts";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(leagueSpartan.variable, "font-sans")}>
      <RootProvider
        search={{
          enabled: true,
        }}
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
              transform(option, _node) {
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
                    <div className="bg-fd-primary/10 rounded-md p-1 text-white">
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
