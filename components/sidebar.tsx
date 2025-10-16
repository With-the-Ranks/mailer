"use client";

import {
  ArrowLeft,
  ChevronRight,
  Edit3,
  Filter,
  FormInput,
  Info,
  LayoutDashboard,
  List,
  Newspaper,
  Palette,
  RadioTower,
  Settings,
  SlidersHorizontal,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import OrganizationSwitcher from "@/components/organization-switcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { getOrgAndAudienceList } from "@/lib/actions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Nav({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const { id } = useParams() as { id?: string };
  const pathname = usePathname();

  const [siteId, setSiteId] = useState<string | null>(null);
  const [audienceListId, setAudienceListId] = useState<string | null>(null);
  const [organizationFound, setOrganizationFound] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [userOrgs, setUserOrgs] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { data: emailData } = useSWR(
    id && pathname.includes("/email") ? `/api/email/${id}` : null,
    fetcher,
  );

  useEffect(() => {
    getOrgAndAudienceList().then((data) => {
      setSiteId(data?.orgId ?? null);
      setAudienceListId(data?.audienceListId ?? null);
      setOrganizationFound(!!data?.orgId);
      setUserOrgs(data?.userOrgs || []);
      setUserRole(data?.userRole ?? null);
      setLoading(false);
    });
  }, [id, pathname]);

  const navItems = useMemo(() => {
    if (loading) return [];

    // Email context
    if (segments[0] === "email" && id) {
      const isPublished = emailData?.published;
      return [
        {
          name: "Back to Dashboard",
          href: siteId ? `/organization/${siteId}` : "/organizations",
          icon: ArrowLeft,
        },
        isPublished && {
          name: "Details",
          href: `/email/${id}/`,
          isActive: segments.length === 2,
          icon: Info,
        },
        !isPublished && {
          name: "Editor",
          href: `/email/${id}/editor`,
          isActive: segments.includes("editor"),
          icon: Edit3,
        },
      ].filter(Boolean);
    }

    // Audience or Segments context
    if (
      segments[0] === "audience" ||
      segments[0] === "segments" ||
      pathname.includes("/segments")
    ) {
      return [
        {
          name: "Back to Dashboard",
          href: siteId ? `/organization/${siteId}/audience` : "/organizations",
          icon: ArrowLeft,
        },
        {
          name: "Audience",
          icon: RadioTower,
          isActive: segments[0] === "audience",
          submenu: [
            {
              name: "Contacts",
              href: `/audience/${audienceListId}`,
              isActive: segments[0] === "audience" && segments.length === 2,
              icon: List,
            },
            {
              name: "Add Contact",
              href: `/audience/${audienceListId}?action=add-contact`,
              isActive:
                typeof window !== "undefined"
                  ? new URLSearchParams(window.location.search).get(
                      "action",
                    ) === "add-contact"
                  : false,
              icon: Edit3,
            },
            {
              name: "Import Contacts",
              href: `/audience/${audienceListId}?action=import`,
              isActive:
                typeof window !== "undefined"
                  ? new URLSearchParams(window.location.search).get(
                      "action",
                    ) === "import"
                  : false,
              icon: UploadIcon,
            },
            {
              name: "Custom Fields",
              href: `/audience/${audienceListId}?action=custom-fields`,
              isActive:
                typeof window !== "undefined"
                  ? new URLSearchParams(window.location.search).get(
                      "action",
                    ) === "custom-fields"
                  : false,
              icon: Settings,
            },
            {
              name: "Segments",
              href: `/organization/${siteId}/segments`,
              isActive: segments.includes("segments"),
              icon: Filter,
            },
          ],
        },
      ];
    }

    // Main org nav
    if (organizationFound) {
      return [
        {
          name: "Dashboard",
          href: "/",
          isActive: segments[0] === "organizations",
          icon: LayoutDashboard,
        },
        {
          name: "Audience",
          icon: RadioTower,
          isActive: segments.includes("audience"),
          submenu: [
            {
              name: "Lists",
              href: `/organization/${siteId}/audience`,
              isActive:
                pathname === `/organization/${siteId}/audience` ||
                pathname === `/organization/${siteId}/audience/lists`,
              icon: List,
            },
            {
              name: "Signup Forms",
              href: `/organization/${siteId}/signup-forms`,
              isActive: segments.includes("signup-forms"),
              icon: FormInput,
            },
            {
              name: "Segments",
              href: `/organization/${siteId}/segments`,
              isActive:
                pathname === `/organization/${siteId}/segments` ||
                pathname.startsWith(`/organization/${siteId}/segments/`),
              icon: Filter,
            },
          ],
        },
        {
          name: "Emails",
          href: `/organization/${siteId}`,
          isActive: segments.length === 2,
          icon: Newspaper,
        },
        // Only show Settings for ADMIN users
        ...(userRole === "ADMIN"
          ? [
              {
                name: "Settings",
                icon: Settings,
                isActive: segments.includes("settings"),
                submenu: [
                  {
                    name: "General",
                    href: `/organization/${siteId}/settings`,
                    isActive:
                      pathname === `/organization/${siteId}/settings` ||
                      pathname === `/organization/${siteId}/settings/general`,
                    icon: SlidersHorizontal,
                  },
                  {
                    name: "Appearance",
                    href: `/organization/${siteId}/settings/appearance`,
                    isActive: pathname.includes("/settings/appearance"),
                    icon: Palette,
                  },
                ],
              },
            ]
          : []),
      ];
    }

    // Fallback nav
    return [
      {
        name: "Overview",
        href: "/",
        isActive: segments.length === 0,
        icon: LayoutDashboard,
      },
      {
        name: "Settings",
        icon: Settings,
        isActive: segments[0] === "settings",
        submenu: [
          {
            name: "General",
            href: "/settings",
            isActive:
              pathname === "/settings" || pathname === "/settings/general",
            icon: SlidersHorizontal,
          },
          {
            name: "Appearance",
            href: "/settings/appearance",
            isActive: pathname.includes("/settings/appearance"),
            icon: Palette,
          },
        ],
      },
    ];
  }, [
    segments,
    id,
    siteId,
    audienceListId,
    organizationFound,
    loading,
    emailData,
    pathname,
    userRole,
  ]);

  return (
    <Sidebar
      collapsible="icon"
      className="h-full border-r bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Image
            src="/logo.png"
            width={24}
            height={24}
            alt="Logo"
            className="dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
          />
          <span className="font-bold">Mailer</span>
        </Link>
        {userOrgs.length > 0 && (
          <div className="px-2 py-2">
            <OrganizationSwitcher
              organizations={userOrgs}
              currentOrgId={siteId || undefined}
            />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                item.submenu ? (
                  <Collapsible
                    key={item.name}
                    asChild
                    defaultOpen={true}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.name}
                          isActive={item.isActive}
                          className="transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                        >
                          <item.icon className="mr-2" size={18} />
                          <span>{item.name}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((sub: any) => (
                            <SidebarMenuSubItem key={sub.name}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={sub.isActive}
                                className="transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                              >
                                <Link
                                  href={sub.href}
                                  className="flex items-center"
                                >
                                  <sub.icon className="mr-2" size={16} />
                                  <span>{sub.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.name}
                      className="transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2" size={18} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        {children}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
