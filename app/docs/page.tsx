import { Code, Settings, Users } from "lucide-react";
import Link, { type LinkProps } from "next/link";

export default function DocsPage() {
  return (
    <main className="z-2 container flex flex-1 flex-col items-center justify-center py-16 text-center">
      <h1 className="mb-4 text-3xl font-semibold md:text-4xl">
        Mailer Documentation
      </h1>
      <p className="mb-2 text-lg font-medium">
        Mailer is the easiest way to send organizing emails.
      </p>
      <p className="text-fd-muted-foreground">
        Choose your path to get started with Mailer.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 text-start md:grid-cols-3">
        {[
          {
            name: "For Organizers",
            description:
              "Learn how to manage email campaigns and grow your audience.",
            icon: <Users className="size-full" />,
            href: "/docs/organizers",
          },
          {
            name: "For Developers",
            description: "API documentation and integration guides.",
            icon: <Code className="size-full" />,
            href: "/docs/developers",
          },
          {
            name: "For Advanced Users",
            description: "Advanced features, and customization options.",
            icon: <Settings className="size-full" />,
            href: "/docs/advanced-users",
          },
        ].map((item) => (
          <Item key={item.name} href={item.href}>
            <Icon>{item.icon}</Icon>
            <h2 className="mb-2 font-medium">{item.name}</h2>
            <p className="text-fd-muted-foreground text-sm">
              {item.description}
            </p>
          </Item>
        ))}
      </div>
    </main>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-fd-muted text-fd-muted-foreground mb-2 size-8 rounded-lg border p-1 shadow-md">
      {children}
    </div>
  );
}

function Item(props: LinkProps & { children: React.ReactNode }) {
  return (
    <Link
      {...props}
      className="bg-fd-card rounded-2xl border p-4 shadow-lg transition-shadow hover:shadow-xl"
    >
      {props.children}
    </Link>
  );
}
